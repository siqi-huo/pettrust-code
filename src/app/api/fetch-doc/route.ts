import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const { url } = await request.json();
  
  if (!url) {
    return NextResponse.json({ error: 'URL is required' }, { status: 400 });
  }
  
  try {
    // 使用内置 fetch 获取文档
    const fetchResponse = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; PetTrust/1.0)',
      },
    });
    
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
      content: content.substring(0, 10000),
      filetype: contentType,
    });
  } catch (error) {
    console.error('Error fetching document:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
