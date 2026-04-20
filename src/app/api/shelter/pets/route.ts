import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

export async function GET(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get('session_token')?.value;
    
    if (!sessionToken) {
      return NextResponse.json(
        { error: '请先登录' },
        { status: 401 }
      );
    }
    
    const { sessions } = await import('@/app/api/auth/login/route');
    const session = sessions.get(sessionToken);
    
    if (!session) {
      return NextResponse.json(
        { error: '会话已过期' },
        { status: 401 }
      );
    }
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;
    
    const client = getSupabaseClient();
    
    const { data: pets, error, count } = await client
      .from('pets')
      .select('*', { count: 'exact' })
      .eq('shelter_id', session.userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    
    if (error) {
      console.error('获取宠物列表失败:', error);
      return NextResponse.json(
        { error: '获取宠物列表失败' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      pets: pets || [],
      total: count || 0,
      page,
      limit,
    });
  } catch (error) {
    console.error('获取宠物列表错误:', error);
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    );
  }
}
