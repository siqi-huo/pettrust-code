import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const petId = searchParams.get('pet_id');
    const analysisType = searchParams.get('type');
    const limit = parseInt(searchParams.get('limit') || '10');
    
    const client = getSupabaseClient();
    
    let query = client
      .from('ai_analysis_records')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (petId) {
      query = query.eq('pet_id', petId);
    }
    
    if (analysisType) {
      query = query.eq('analysis_type', analysisType);
    }
    
    const { data: records, error } = await query;
    
    if (error) {
      console.error('获取分析记录失败:', error);
      return NextResponse.json(
        { error: '获取分析记录失败' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      records: records || [],
    });
  } catch (error) {
    console.error('获取分析记录错误:', error);
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    );
  }
}
