import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { sessions } from '../auth/login/route';

// 获取当前用户的所有会话列表（按机构分组）
export async function GET(request: NextRequest) {
    const sessionToken = request.cookies.get('session_token')?.value;
    if (!sessionToken) {
        return NextResponse.json({ error: '未登录' }, { status: 401 });
    }
    const session = sessions.get(sessionToken);
    if (!session) {
        return NextResponse.json({ error: '会话过期' }, { status: 401 });
    }

    const client = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    const shelterId = searchParams.get('shelter_id');

    let query = client
        .from('messages')
        .select('*')
        .order('created_at', { ascending: true });

    if (session.role === 'adopter') {
        query = query.eq('sender_id', session.userId).or(`receiver_id.eq.${session.userId}`);
    }

    if (shelterId) {
        query = query.eq('sender_id', shelterId).or(`receiver_id.eq.${shelterId}`);
    }

    const { data, error } = await query;
    if (error) {
        return NextResponse.json({ error: '获取消息失败' }, { status: 500 });
    }
    return NextResponse.json({ success: true, messages: data });
}

// 发送消息
export async function POST(request: NextRequest) {
    const sessionToken = request.cookies.get('session_token')?.value;
    if (!sessionToken) {
        return NextResponse.json({ error: '未登录' }, { status: 401 });
    }
    const session = sessions.get(sessionToken);
    if (!session) {
        return NextResponse.json({ error: '会话过期' }, { status: 401 });
    }

    const { receiver_id, content, pet_id } = await request.json();
    if (!receiver_id || !content) {
        return NextResponse.json({ error: '缺少必要参数' }, { status: 400 });
    }

    const client = getSupabaseClient();
    const { data, error } = await client
        .from('messages')
        .insert({
            sender_id: session.userId,
            receiver_id,
            content,
            pet_id,
        })
        .select()
        .single();

    if (error) {
        return NextResponse.json({ error: '发送失败' }, { status: 500 });
    }
    return NextResponse.json({ success: true, message: data });
}