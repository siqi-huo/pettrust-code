// src/app/api/chat/route.ts
import { createOpenAI } from '@ai-sdk/openai';
import { streamText } from 'ai';

// 配置阿里云通义千问客户端，使其兼容 OpenAI 格式
const qwen = createOpenAI({
    apiKey: process.env.DASHSCOPE_API_KEY,
    baseURL: process.env.DASHSCOPE_BASE_URL,
});

export async function POST(req: Request) {
    try {
        const { messages } = await req.json();

        // 使用新的 streamText 函数
        const result = await streamText({
            model: qwen('qwen-turbo'),
            system: '你是一位专业的宠物养护知识助手，请用友好、易懂的中文回答用户关于宠物健康、喂养、训练等方面的问题。',
            messages,
            temperature: 0.7,
        });

        // 将结果转换为文本流响应并返回
        return result.toTextStreamResponse();
    } catch (error) {
        console.error('聊天 API 错误:', error);
        return new Response('服务器错误', { status: 500 });
    }
}