// src/lib/email.ts
import { Resend } from 'resend';
import VerificationEmail from '@/emails/verification-email';

function getResendClient(): Resend | null {
    const apiKey = process.env.RESEND_API_KEY || process.env.RESEND_APT_KEY;
    if (!apiKey) {
        console.warn('RESEND_API_KEY not set, email sending disabled');
        return null;
    }
    return new Resend(apiKey);
}

export async function sendVerificationEmail(email: string, code: string): Promise<boolean> {
    try {
        const resend = getResendClient();
        if (!resend) {
            return false;
        }
        
        const { data, error } = await resend.emails.send({
            from: 'PetTrust <onboarding@resend.dev>',
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