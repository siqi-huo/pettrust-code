// src/lib/email.ts
import { Resend } from 'resend';
import VerificationEmail from '@/emails/verification-email';

// 延迟初始化 Resend 客户端
let resendClient: Resend | null = null;

function getResendClient(): Resend {
    if (!resendClient) {
        const apiKey = process.env.RESEND_API_KEY;
        if (!apiKey) {
            throw new Error('RESEND_API_KEY is not configured');
        }
        resendClient = new Resend(apiKey);
    }
    return resendClient;
}

export async function sendVerificationEmail(email: string, code: string): Promise<boolean> {
    try {
        const resend = getResendClient(); // 使用 getter 获取客户端
        const { data, error } = await resend.emails.send({
            from: 'PetTrust <noreply@pettrust.asia>',// 如果已验证域名可替换为你的域名邮箱
            to: email,
            subject: '【PetTrust】邮箱验证码',
            react: VerificationEmail({ code }),
        });

        if (error) {
            console.error('邮件发送失败:', error);
            return false;
        }

        console.log('邮件发送成功:', data?.id);
        return true;
    } catch (error) {
        console.error('邮件发送异常:', error);
        return false;
    }
}
