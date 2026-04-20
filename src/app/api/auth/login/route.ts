import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

// 简单会话存储（生产环境应使用Redis或数据库）
const sessions = new Map<string, { userId: string; email: string; name: string; role: string }>();

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
          { error: '请提供邮箱和密码' },
          { status: 400 }
      );
    }

    const client = getSupabaseClient();

    // 查询用户
    const { data: user, error } = await client
        .from('users')
        .select('id, email, name, role, password_hash, is_active')
        .eq('email', email)
        .maybeSingle();

    if (error || !user) {
      return NextResponse.json(
          { error: '用户不存在' },
          { status: 401 }
      );
    }

    if (!user.is_active) {
      return NextResponse.json(
          { error: '账户已被禁用' },
          { status: 403 }
      );
    }

    // 验证密码（简化版）
    const hashedPassword = Buffer.from(password).toString('base64');
    if (hashedPassword !== user.password_hash) {
      return NextResponse.json(
          { error: '密码错误' },
          { status: 401 }
      );
    }

    // 生成会话token
    const sessionToken = Buffer.from(`${user.id}-${Date.now()}`).toString('base64');
    sessions.set(sessionToken, {
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    // 创建响应
    const response = NextResponse.json({
      success: true,
      message: '登录成功',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });

    // 设置 session_token Cookie
    response.cookies.set('session_token', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7天
      path: '/',
    });

    // 新增：设置 user_role Cookie（用于 middleware 角色判断）
    response.cookies.set('user_role', user.role, {
      httpOnly: false, // 设为 false，middleware 才能读取
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('登录错误:', error);
    return NextResponse.json(
        { error: '服务器错误' },
        { status: 500 }
    );
  }
}

// 导出sessions供其他路由使用
export { sessions };