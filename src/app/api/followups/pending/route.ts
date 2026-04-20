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
    
    const client = getSupabaseClient();
    
    // 获取待审核的反馈（机构端）
    const { data: pendingFeedbacks, error } = await client
      .from('followup_feedbacks')
      .select('*, followup_tasks(title, pet_id, contract_id)')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('获取反馈列表失败:', error);
      return NextResponse.json(
        { error: '获取反馈列表失败' },
        { status: 500 }
      );
    }
    
    // 获取统计数据
    const { count: totalTasks } = await client
      .from('followup_tasks')
      .select('*', { count: 'exact', head: true });
    
    const { count: pendingTasks } = await client
      .from('followup_tasks')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');
    
    const { count: overdueTasks } = await client
      .from('followup_tasks')
      .select('*', { count: 'exact', head: true })
      .lt('due_date', new Date().toISOString())
      .neq('status', 'submitted')
      .neq('status', 'approved');
    
    return NextResponse.json({
      success: true,
      feedbacks: pendingFeedbacks || [],
      stats: {
        total: totalTasks || 0,
        pending: pendingTasks || 0,
        overdue: overdueTasks || 0,
      },
    });
  } catch (error) {
    console.error('获取反馈列表错误:', error);
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    );
  }
}
