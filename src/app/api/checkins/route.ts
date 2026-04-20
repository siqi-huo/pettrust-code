import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { z } from 'zod';

const createCheckinSchema = z.object({
  plan_id: z.string().min(1),
  adopter_id: z.string().min(1),
  pet_id: z.string().min(1),
  task_index: z.number().int().min(0),
  media_url: z.string().url().optional(),
  note: z.string().optional(),
  trust_score: z.number().int().min(0).max(100).optional(),
  location: z.string().optional(),
  checkin_time: z.string(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const petId = searchParams.get('pet_id');
    const adopterId = searchParams.get('adopter_id');
    
    const client = getSupabaseClient();
    
    let query = client
      .from('checkins')
      .select('*')
      .order('checkin_time', { ascending: false });
    
    if (petId) {
      query = query.eq('pet_id', petId);
    }
    
    if (adopterId) {
      query = query.eq('adopter_id', adopterId);
    }
    
    const { data: checkins, error } = await query;
    
    if (error) {
      console.error('获取打卡记录失败:', error);
      return NextResponse.json(
        { error: '获取打卡记录失败' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      checkins: checkins || [],
    });
  } catch (error) {
    console.error('获取打卡记录错误:', error);
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
    const validatedData = createCheckinSchema.parse(body);
    
    const client = getSupabaseClient();
    
    const { data, error } = await client
      .from('checkins')
      .insert(validatedData)
      .select()
      .single();
    
    if (error) {
      console.error('创建打卡失败:', error);
      return NextResponse.json(
        { error: '创建打卡失败' },
        { status: 500 }
      );
    }
    
    // 获取该计划的所有打卡记录，计算信任分数
    const { data: allCheckins } = await client
      .from('checkins')
      .select('trust_score')
      .eq('plan_id', validatedData.plan_id);
    
    const avgTrustScore = allCheckins && allCheckins.length > 0
      ? Math.round(allCheckins.reduce((sum, c) => sum + (c.trust_score || 0), 0) / allCheckins.length)
      : 0;
    
    return NextResponse.json({
      success: true,
      message: '打卡成功',
      checkin: data,
      trust_score: avgTrustScore,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '数据验证失败', details: error.issues },
        { status: 400 }
      );
    }
    console.error('创建打卡错误:', error);
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    );
  }
}
