import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const client = getSupabaseClient();
    
    // 获取宠物详情
    const { data: pet, error } = await client
      .from('pets')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    
    if (error || !pet) {
      return NextResponse.json(
        { error: '宠物不存在' },
        { status: 404 }
      );
    }
    
    // 获取医疗记录
    const { data: medicalRecords } = await client
      .from('pet_medical_records')
      .select('*')
      .eq('pet_id', id)
      .order('record_date', { ascending: false });
    
    // 获取互动计划
    const { data: interactionPlans } = await client
      .from('interaction_plans')
      .select('*')
      .eq('pet_id', id)
      .order('created_at', { ascending: false });
    
    return NextResponse.json({
      success: true,
      pet: {
        ...pet,
        medical_records: medicalRecords || [],
        interaction_plans: interactionPlans || [],
      },
    });
  } catch (error) {
    console.error('获取宠物详情错误:', error);
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    const client = getSupabaseClient();
    
    const { data, error } = await client
      .from('pets')
      .update({
        ...body,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('更新宠物失败:', error);
      return NextResponse.json(
        { error: '更新宠物失败' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: '宠物信息更新成功',
      pet: data,
    });
  } catch (error) {
    console.error('更新宠物错误:', error);
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const client = getSupabaseClient();
    
    const { error } = await client
      .from('pets')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('删除宠物失败:', error);
      return NextResponse.json(
        { error: '删除宠物失败' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: '宠物删除成功',
    });
  } catch (error) {
    console.error('删除宠物错误:', error);
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    );
  }
}
