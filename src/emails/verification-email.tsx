// src/emails/verification-email.tsx
import {
    Html,
    Head,
    Preview,
    Body,
    Container,
    Heading,
    Text,

} from '@react-email/components';

interface VerificationEmailProps {
    code: string;
}

export default function VerificationEmail({ code }: VerificationEmailProps) {
    return (
        <Html>
            <Head />
            <Preview>您的 PetTrust 邮箱验证码</Preview>
            <Body style={main}>
                <Container style={container}>
                    <Heading style={h1}>验证您的邮箱</Heading>
                    <Text style={text}>您正在注册 PetTrust，请输入以下验证码完成验证：</Text>
                    <Container style={codeContainer}>
                        <Text style={codeText}>{code}</Text>
                    </Container>
                    <Text style={text}>验证码 5 分钟内有效，请勿泄露给他人。</Text>
                    <Text style={footer}>如果这不是您本人的操作，请忽略此邮件。</Text>
                </Container>
            </Body>
        </Html>
    );
}

// 简单的内联样式，确保邮件在各种客户端中显示正常
const main = {
    backgroundColor: '#f6f9fc',
    fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
    backgroundColor: '#ffffff',
    margin: '0 auto',
    padding: '20px 0 48px',
    marginBottom: '64px',
};

const h1 = {
    color: '#333',
    fontSize: '24px',
    fontWeight: 'bold',
    margin: '40px 0',
    padding: '0',
    textAlign: 'center' as const,
};

const text = {
    color: '#333',
    fontSize: '16px',
    lineHeight: '26px',
    textAlign: 'center' as const,
};

const codeContainer = {
    background: '#f4f4f4',
    borderRadius: '8px',
    margin: '20px auto',
    padding: '20px',
    textAlign: 'center' as const,
    width: '200px',
};

const codeText = {
    color: '#e11d48',
    fontSize: '32px',
    fontWeight: 'bold',
    letterSpacing: '6px',
    margin: 0,
};

const footer = {
    color: '#8898aa',
    fontSize: '12px',
    lineHeight: '16px',
    textAlign: 'center' as const,
    marginTop: '40px',
};