import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const client = getSupabaseClient();
    
    // 获取合同详情
    const { data: contract, error } = await client
      .from('contracts')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    
    if (error || !contract) {
      return NextResponse.json(
        { error: '合同不存在' },
        { status: 404 }
      );
    }
    
    // 获取宠物信息
    const { data: pet } = await client
      .from('pets')
      .select('*')
      .eq('id', contract.pet_id)
      .single();
    
    // 获取回访任务
    const { data: followupTasks } = await client
      .from('followup_tasks')
      .select('*')
      .eq('contract_id', id)
      .order('due_date', { ascending: true });
    
    return NextResponse.json({
      success: true,
      contract: {
        ...contract,
        pet,
        followup_tasks: followupTasks || [],
      },
    });
  } catch (error) {
    console.error('获取合同详情错误:', error);
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
    
    // 处理签名
    if (body.signature) {
      const { data: user } = await client
        .from('users')
        .select('role')
        .eq('id', body.signer_id)
        .single();
      
      if (user?.role === 'adopter') {
        body.adopter_signature = body.signature;
        body.adopter_signed_at = new Date().toISOString();
      } else if (user?.role === 'shelter') {
        body.shelter_signature = body.signature;
        body.shelter_signed_at = new Date().toISOString();
      }
      delete body.signature;
      delete body.signer_id;
    }
    
    // 检查是否双方都已签名
    if (body.adopter_signature || body.shelter_signature) {
      const { data: currentContract } = await client
        .from('contracts')
        .select('adopter_signature, shelter_signature')
        .eq('id', id)
        .single();
      
      if (currentContract?.adopter_signature && currentContract?.shelter_signature) {
        body.status = 'active';
        body.adopted_at = new Date().toISOString();
        
        // 更新宠物状态为已领养
        await client
          .from('pets')
          .update({ status: 'adopted' })
          .eq('id', body.pet_id);
        
        // 创建回访任务
        const followupSchedule = [
          { title: '1个月回访', days: 30 },
          { title: '3个月回访', days: 90 },
          { title: '6个月回访', days: 180 },
          { title: '12个月回访', days: 365 },
        ];
        
        const adoptedAt = new Date();
        for (const schedule of followupSchedule) {
          const dueDate = new Date(adoptedAt);
          dueDate.setDate(dueDate.getDate() + schedule.days);
          
interface CurrentContractType {
  adopter_signature?: string;
  shelter_signature?: string;
  adopter_id?: string;
}

          await client
            .from('followup_tasks')
            .insert({
              contract_id: id,
              pet_id: body.pet_id,
              adopter_id: (currentContract as CurrentContractType).adopter_id,
              title: schedule.title,
              description: `请上传宠物近照及生活环境照片，并填写健康状况表格`,
              due_date: dueDate.toISOString(),
              status: 'pending',
            });
        }
      }
    }
    
    body.updated_at = new Date().toISOString();
    
    const { data, error } = await client
      .from('contracts')
      .update(body)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('更新合同失败:', error);
      return NextResponse.json(
        { error: '更新合同失败' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: '合同更新成功',
      contract: data,
    });
  } catch (error) {
    console.error('更新合同错误:', error);
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    );
  }
}
