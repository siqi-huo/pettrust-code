import { NextRequest, NextResponse } from 'next/server';
import { sessions } from '../login/route';

export async function POST(request: NextRequest) {
  const sessionToken = request.cookies.get('session_token')?.value;

  if (sessionToken) {
    sessions.delete(sessionToken);
  }

  const response = NextResponse.json({ success: true, message: '已退出登录' });

  // 删除 session_token
  response.cookies.delete('session_token');

  // 新增：删除 user_role
  response.cookies.delete('user_role');

  return response;
}