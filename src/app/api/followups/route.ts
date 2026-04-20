import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { z } from 'zod';

const createFollowupFeedbackSchema = z.object({
  task_id: z.string().min(1),
  media_urls: z.array(z.string()).optional(),
  responses: z.record(z.string(), z.string()).optional(),
  health_status: z.enum(['healthy', 'sick', 'recovering', 'unknown']).optional(),
  ai_analysis: z.any().optional(),
  notes: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const adopterId = searchParams.get('adopter_id');
    const status = searchParams.get('status');
    const overdue = searchParams.get('overdue');
    
    const client = getSupabaseClient();
    
    let query = client
      .from('followup_tasks')
      .select('*, pets(name, photos)')
      .order('due_date', { ascending: true });
    
    if (adopterId) {
      query = query.eq('adopter_id', adopterId);
    }
    
    if (status) {
      query = query.eq('status', status);
    }
    
    if (overdue === 'true') {
      query = query.lt('due_date', new Date().toISOString());
      query = query.neq('status', 'submitted');
      query = query.neq('status', 'approved');
    }
    
    const { data: tasks, error } = await query;
    
    if (error) {
      console.error('获取回访任务失败:', error);
      return NextResponse.json(
        { error: '获取回访任务失败' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      tasks: tasks || [],
    });
  } catch (error) {
    console.error('获取回访任务错误:', error);
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
    
    if (!session) {
      return NextResponse.json(
        { error: '会话已过期' },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    
    // 验证请求数据
    const validatedData = createFollowupFeedbackSchema.parse(body);
    
    const client = getSupabaseClient();
    
    // 创建反馈
    const { data: feedback, error: feedbackError } = await client
      .from('followup_feedbacks')
      .insert(validatedData)
      .select()
      .single();
    
    if (feedbackError) {
      console.error('创建反馈失败:', feedbackError);
      return NextResponse.json(
        { error: '创建反馈失败' },
        { status: 500 }
      );
    }
    
    // 更新任务状态
    await client
      .from('followup_tasks')
      .update({
        status: 'submitted',
        submitted_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', validatedData.task_id);
    
    return NextResponse.json({
      success: true,
      message: '回访反馈提交成功',
      feedback,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '数据验证失败', details: error.issues },
        { status: 400 }
      );
    }
    console.error('创建反馈错误:', error);
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    );
  }
}
