import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { z, ZodError } from 'zod';

const registerSchema = z.object({
  email: z.string().email('请输入有效的邮箱地址'),
  code: z.string().length(6, '验证码必须为6位数字'),
  password: z
      .string()
      .min(8, '密码至少需要8个字符')
      .regex(/[a-zA-Z]/, '密码必须包含至少一个字母')
      .regex(/[0-9]/, '密码必须包含至少一个数字'),
  confirm_password: z.string().min(8),
  name: z.string().min(1, '请输入姓名'),
  role: z.enum(['adopter', 'shelter']).default('adopter'),
}).refine((data) => data.password === data.confirm_password, {
  message: "两次输入的密码不一致",
  path: ["confirm_password"],
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = registerSchema.parse(body);
    const client = getSupabaseClient();

    // 1. 先检查邮箱是否已存在（主动查询）
    const { data: existingUser, error: checkError } = await client
        .from('users')
        .select('id')
        .eq('email', validatedData.email)
        .maybeSingle();

    if (checkError) {
      console.error('检查邮箱失败:', checkError);
      return NextResponse.json({ error: '系统错误，请稍后重试' }, { status: 500 });
    }

    if (existingUser) {
      return NextResponse.json({ error: '该邮箱已被注册' }, { status: 400 });
    }

    // 2. 验证验证码
    const now = new Date();
    const { data: validCode, error: codeError } = await client
        .from('verification_codes')
        .select('*')
        .eq('email', validatedData.email)
        .eq('code', validatedData.code)
        .eq('used', false)
        .gte('expires_at', now.toISOString())
        .maybeSingle();

    if (codeError || !validCode) {
      return NextResponse.json({ error: '验证码错误或已过期' }, { status: 400 });
    }

    // 3. 标记验证码为已使用
    await client
        .from('verification_codes')
        .update({ used: true })
        .eq('id', validCode.id);

    // 4. 创建用户
    const { data: newUser, error: createError } = await client
        .from('users')
        .insert({
          email: validatedData.email,
          name: validatedData.name,
          role: validatedData.role,
          password_hash: Buffer.from(validatedData.password).toString('base64'),
        })
        .select()
        .single();

    if (createError) {
      console.error('创建用户失败:', createError);
      // 唯一约束冲突时 Supabase 会返回 code '23505'
      if (createError.code === '23505') {
        return NextResponse.json({ error: '该邮箱已被注册' }, { status: 400 });
      }
      return NextResponse.json({ error: '注册失败，请稍后重试' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: '注册成功',
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
      },
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
          { error: '数据验证失败', details: error.issues },
          { status: 400 }
      );
    }
    console.error('注册错误:', error);
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}