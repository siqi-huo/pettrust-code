"use client";

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Heart } from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const roleParam = searchParams.get('role') as 'adopter' | 'shelter' | null;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'adopter' | 'shelter'>(roleParam || 'adopter');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    setLoading(false);

    if (data.success) {
      router.push('/');
    } else {
      setError(data.error || '登录失败');
    }
  };

  const title = roleParam === 'adopter' ? '领养人登录' : roleParam === 'shelter' ? '机构登录' : '登录 PetTrust';
  const subtitle = roleParam === 'adopter'
      ? '登录后开启领养之旅'
      : roleParam === 'shelter'
          ? '登录后管理您的机构和宠物'
          : '登录您的账户';

  return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg">
          <div className="flex justify-center mb-6">
            <Heart className="w-10 h-10 text-rose-500" />
          </div>
          <h1 className="text-2xl font-bold text-center mb-2">{title}</h1>
          <p className="text-center text-gray-500 text-sm mb-6">{subtitle}</p>

          {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-500 rounded-lg text-sm">
                {error}
              </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                邮箱
              </label>
              <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                  required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                密码
              </label>
              <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                  required
              />
            </div>

            {!roleParam && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    登录身份
                  </label>
                  <select
                      value={role}
                      onChange={(e) => setRole(e.target.value as 'adopter' | 'shelter')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                  >
                    <option value="adopter">领养人</option>
                    <option value="shelter">救助机构</option>
                  </select>
                </div>
            )}

            <button
                type="submit"
                disabled={loading}
                className="w-full py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 disabled:opacity-50"
            >
              {loading ? '登录中...' : '登录'}
            </button>
          </form>

          <p className="mt-4 text-center text-sm text-gray-600">
            还没有账号？{' '}
            <Link href="/register" className="text-rose-500 hover:underline">
              立即注册
            </Link>
          </p>
        </div>
      </div>
  );
}

export default function LoginPage() {
  return (
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center">加载中...</div>}>
        <LoginForm />
      </Suspense>
  );
}