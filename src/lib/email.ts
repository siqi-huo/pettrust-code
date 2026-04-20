// src/lib/email.ts
import { Resend } from 'resend';
import VerificationEmail from '@/emails/verification-email';

const resend = new Resend(process.env.RESEND_APT_KEY);

export async function sendVerificationEmail(email: string, code: string): Promise<boolean> {
    try {
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