// src/app/api/chat/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();
    
    // 检查是否配置了 AI API
    const apiKey = process.env.DASHSCOPE_API_KEY;
    const baseUrl = process.env.DASHSCOPE_BASE_URL;
    
    if (!apiKey || !baseUrl) {
      // 如果没有配置 API，返回默认回复
      const lastMessage = messages?.[messages.length - 1]?.content || '';
      return NextResponse.json({
        role: 'assistant',
        content: '您好！我是 PetTrust 的 AI 助手。由于未配置 AI 服务，暂时无法回答您的问题。请联系管理员配置 DASHSCOPE_API_KEY。'
      });
    }
    
    // 调用 AI API
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'qwen-turbo',
        messages: [
          {
            role: 'system',
            content: '你是一位专业的宠物养护知识助手，请用友好、易懂的中文回答用户关于宠物健康、喂养、训练等方面的问题。'
          },
          ...(messages || [])
        ],
        stream: false
      })
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '抱歉，我暂时无法回答您的问题。';
    
    return NextResponse.json({
      role: 'assistant',
      content
    });
  } catch (error) {
    console.error('聊天 API 错误:', error);
    return NextResponse.json({
      role: 'assistant',
      content: '抱歉，服务暂时不可用，请稍后重试。'
    });
  }
}
