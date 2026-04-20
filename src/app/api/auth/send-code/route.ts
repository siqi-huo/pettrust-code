// src/app/api/auth/send-code/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { sendVerificationEmail } from '@/lib/email';
import { z, ZodError } from 'zod';

const sendCodeSchema = z.object({
    email: z.string().email('请输入有效的邮箱地址'),
});

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email } = sendCodeSchema.parse(body);

        const client = getSupabaseClient();
        const now = new Date();

        // ========== 新增：检查邮箱是否已注册 ==========
        const { data: existingUser, error: userCheckError } = await client
            .from('users')
            .select('id')
            .eq('email', email)
            .maybeSingle();

        if (userCheckError) {
            console.error('检查用户是否存在失败:', userCheckError);
            return NextResponse.json(
                { error: '系统错误，请稍后重试' },
                { status: 500 }
            );
        }

        if (existingUser) {
            return NextResponse.json(
                { error: '该邮箱已注册，请直接登录' },
                { status: 400 }
            );
        }
        // ===========================================

        // 1. 频率限制：检查该邮箱在过去 1 分钟内是否已发送过验证码
        const oneMinuteAgo = new Date(now.getTime() - 60 * 1000);
        const { data: recentCodes } = await client
            .from('verification_codes')
            .select('created_at')
            .eq('email', email)
            .gte('created_at', oneMinuteAgo.toISOString())
            .limit(1);

        if (recentCodes && recentCodes.length > 0) {
            return NextResponse.json(
                { error: '发送过于频繁，请稍后再试' },
                { status: 429 }
            );
        }

        // 2. 生成 6 位随机验证码
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(now.getTime() + 5 * 60 * 1000); // 5 分钟有效期

        // 3. 将旧验证码标记为已使用
        await client
            .from('verification_codes')
            .update({ used: true })
            .eq('email', email)
            .eq('used', false);

        // 4. 存储新验证码到数据库
        const { error: insertError } = await client
            .from('verification_codes')
            .insert({
                email,
                code,
                expires_at: expiresAt.toISOString(),
            });

        if (insertError) {
            console.error('验证码存储失败:', insertError);
            return NextResponse.json(
                { error: '验证码生成失败，请稍后重试' },
                { status: 500 }
            );
        }

        // 5. 发送邮件
        const emailSent = await sendVerificationEmail(email, code);
        if (!emailSent) {
            return NextResponse.json(
                { error: '邮件发送失败，请稍后重试' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            message: '验证码已发送至您的邮箱',
        });
    } catch (error) {
        if (error instanceof ZodError) {
            return NextResponse.json(
                { error: error.issues[0].message },
                { status: 400 }
            );
        }
        console.error('发送验证码错误:', error);
        return NextResponse.json(
            { error: '服务器错误' },
            { status: 500 }
        );
    }
}