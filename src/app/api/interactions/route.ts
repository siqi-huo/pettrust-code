import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

// 互动计划管理
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const petId = searchParams.get('pet_id');
    
    const client = getSupabaseClient();
    
    let query = client
      .from('interaction_plans')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false });
    
    if (petId) {
      query = query.eq('pet_id', petId);
    }
    
    const { data: plans, error } = await query;
    
    if (error) {
      console.error('获取互动计划失败:', error);
      return NextResponse.json(
        { error: '获取互动计划失败' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      plans: plans || [],
    });
  } catch (error) {
    console.error('获取互动计划错误:', error);
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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
    
    if (!session || session.role !== 'shelter') {
      return NextResponse.json(
        { error: '只有机构用户可以创建互动计划' },
        { status: 403 }
      );
    }
    
    const { pet_id, title, description, target_count, tasks } = await request.json();
    
    const client = getSupabaseClient();
    
    const { data, error } = await client
      .from('interaction_plans')
      .insert({
        pet_id,
        title,
        description,
        target_count: target_count || 3,
        tasks: tasks || [],
        status: 'active',
      })
      .select()
      .single();
    
    if (error) {
      console.error('创建互动计划失败:', error);
      return NextResponse.json(
        { error: '创建互动计划失败' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: '互动计划创建成功',
      plan: data,
    });
  } catch (error) {
    console.error('创建互动计划错误:', error);
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    );
  }
}
