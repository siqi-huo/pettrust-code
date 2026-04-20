import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { z } from 'zod';

const createContractSchema = z.object({
  pet_id: z.string().min(1),
  adopter_id: z.string().min(1),
  shelter_id: z.string().min(1),
  terms: z.string().optional(),
  adopter_signature: z.string().optional(),
  shelter_signature: z.string().optional(),
  adopter_signed_at: z.string().optional(),
  shelter_signed_at: z.string().optional(),
  status: z.enum(['pending', 'active', 'completed', 'cancelled']).default('pending'),
  adopted_at: z.string().optional(),
});

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
    
    let query = client
      .from('contracts')
      .select('*')
      .order('created_at', { ascending: false });
    
    // 根据用户角色筛选
    if (session.role === 'adopter') {
      query = query.eq('adopter_id', session.userId);
    } else if (session.role === 'shelter') {
      query = query.eq('shelter_id', session.userId);
    }
    
    const { data: contracts, error } = await query;
    
    if (error) {
      console.error('获取合同列表失败:', error);
      return NextResponse.json(
        { error: '获取合同列表失败' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      contracts: contracts || [],
    });
  } catch (error) {
    console.error('获取合同列表错误:', error);
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // 验证请求数据
    const validatedData = createContractSchema.parse(body);
    
    const client = getSupabaseClient();
    
    const { data, error } = await client
      .from('contracts')
      .insert(validatedData)
      .select()
      .single();
    
    if (error) {
      console.error('创建合同失败:', error);
      return NextResponse.json(
        { error: '创建合同失败' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: '合同创建成功',
      contract: data,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '数据验证失败', details: error.issues },
        { status: 400 }
      );
    }
    console.error('创建合同错误:', error);
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    );
  }
}
