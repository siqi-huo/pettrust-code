import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const { url } = await request.json();
  
  if (!url) {
    return NextResponse.json({ error: 'URL is required' }, { status: 400 });
  }
  
  try {
    // 尝试使用 SDK 进行文档获取
    try {
      const { FetchClient, Config, HeaderUtils } = await import('coze-coding-dev-sdk');
      
      const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);
      const config = new Config();
      const client = new FetchClient(config, customHeaders);
      
      const response = await client.fetch(url);
      
      if (response.status_code !== 0) {
        return NextResponse.json({ 
          error: 'Failed to fetch document',
          status: response.status_message 
        }, { status: 500 });
      }
      
      // 提取文本内容
      const textContent = response.content
        .filter(item => item.type === 'text')
        .map(item => item.text)
        .join('\n');
      
      return NextResponse.json({
        title: response.title,
        content: textContent,
        filetype: response.filetype,
      });
    } catch {
      // SDK 不可用，使用内置 fetch
      const fetchResponse = await fetch(url);
      const contentType = fetchResponse.headers.get('content-type') || '';
      
      let title = 'Document';
      let content = '';
      
      if (contentType.includes('text/html')) {
        const html = await fetchResponse.text();
        // 简单的 HTML 到文本的转换
        content = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
        title = 'Web Page';
      } else if (contentType.includes('text/plain')) {
        content = await fetchResponse.text();
        title = 'Text Document';
      } else {
        content = await fetchResponse.text();
        title = 'Document';
      }
      
      return NextResponse.json({
        title,
        content: content.substring(0, 10000), // 限制内容长度
        filetype: contentType,
      });
    }
  } catch (error) {
    console.error('Error fetching document:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
