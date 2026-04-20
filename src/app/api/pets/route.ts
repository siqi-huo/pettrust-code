import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { z } from 'zod';

// 宠物创建验证 schema
const createPetSchema = z.object({
  shelter_id: z.string().uuid(),
  name: z.string().min(1).max(100),
  species: z.enum(['dog', 'cat', 'bird', 'rabbit', 'other']),
  breed: z.string().optional(),
  age: z.number().int().min(0),
  gender: z.enum(['male', 'female', 'unknown']),
  weight: z.string().optional(),
  color: z.string().optional(),
  health_status: z.enum(['healthy', 'sick', 'recovering', 'unknown']).default('healthy'),
  vaccination_status: z.boolean().default(false),
  neutered: z.boolean().default(false),
  description: z.string().optional(),
  photos: z.array(z.string()).optional(),
  status: z.enum(['available', 'pending', 'adopted', 'unavailable']).default('available'),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'available';
    const species = searchParams.get('species');
    const shelterId = searchParams.get('shelter_id');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const offset = (page - 1) * limit;
    
    const client = getSupabaseClient();
    
    let query = client
      .from('pets')
      .select('*', { count: 'exact' })
      .eq('status', status)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    
    if (species) {
      query = query.eq('species', species);
    }
    
    if (shelterId) {
      query = query.eq('shelter_id', shelterId);
    }
    
    const { data: pets, error, count } = await query;
    
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // 验证请求数据
    const validatedData = createPetSchema.parse(body);
    
    const client = getSupabaseClient();
    
    const { data, error } = await client
      .from('pets')
      .insert(validatedData)
      .select()
      .single();
    
    if (error) {
      console.error('创建宠物失败:', error);
      return NextResponse.json(
        { error: '创建宠物失败' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: '宠物信息创建成功',
      pet: data,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '数据验证失败', details: error.issues },
        { status: 400 }
      );
    }
    console.error('创建宠物错误:', error);
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    );
  }
}
