// 共享会话存储
// 在生产环境应该使用 Redis 或数据库

interface SessionData {
  userId: string;
  email: string;
  name: string;
  role: string;
}

const sessions = new Map<string, SessionData>();

export function getSession(token: string): SessionData | undefined {
  return sessions.get(token);
}

export function setSession(token: string, data: SessionData): void {
  sessions.set(token, data);
}

export function deleteSession(token: string): boolean {
  return sessions.delete(token);
}

export function getSessions(): Map<string, SessionData> {
  return sessions;
}
