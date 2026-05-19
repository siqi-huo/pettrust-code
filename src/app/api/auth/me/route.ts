import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/sessions';

export async function GET(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get('session_token')?.value;
    
    if (!sessionToken) {
      return NextResponse.json(
        { error: '未登录' },
        { status: 401 }
      );
    }
    
    const session = getSession(sessionToken);
    
    if (!session) {
      return NextResponse.json(
        { error: '会话已过期' },
        { status: 401 }
      );
    }
    
    return NextResponse.json({
      success: true,
      user: session,
    });
  } catch (error) {
    console.error('获取用户信息错误:', error);
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    );
  }
}
