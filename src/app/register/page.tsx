"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Heart } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    code: '',
    password: '',
    confirm_password: '',
    name: '',
    role: 'adopter' as 'adopter' | 'shelter',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sendingCode, setSendingCode] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // 密码强度状态
  const [passwordStrength, setPasswordStrength] = useState({
    minLength: false,
    hasLetter: false,
    hasNumber: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // 实时校验密码强度
    if (name === 'password') {
      setPasswordStrength({
        minLength: value.length >= 8,
        hasLetter: /[a-zA-Z]/.test(value),
        hasNumber: /[0-9]/.test(value),
      });
    }
  };

  const handleSendCode = async () => {
    if (!formData.email) {
      setError('请先输入邮箱地址');
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      setError('请输入有效的邮箱地址');
      return;
    }

    setError('');
    setSendingCode(true);

    const res = await fetch('/api/auth/send-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: formData.email }),
    });
    const data = await res.json();

    if (data.success) {
      setCountdown(60);
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      setError(data.error || '验证码发送失败');
    }
    setSendingCode(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // 前端密码强度校验
    if (!passwordStrength.minLength || !passwordStrength.hasLetter || !passwordStrength.hasNumber) {
      setError('密码不符合安全要求：至少8个字符，包含字母和数字');
      return;
    }

    if (formData.password !== formData.confirm_password) {
      setError('两次输入的密码不一致');
      return;
    }

    setLoading(true);
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    const data = await res.json();
    setLoading(false);

    if (data.success) {
      router.push('/login?registered=true');
    } else {
      setError(data.error || '注册失败');
    }
  };

  return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12">
        <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg">
          <div className="flex justify-center mb-6">
            <Heart className="w-10 h-10 text-rose-500" />
          </div>
          <h1 className="text-2xl font-bold text-center mb-6">注册 PetTrust</h1>
          {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-500 rounded-lg text-sm">
                {error}
              </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 邮箱输入框 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">邮箱地址</label>
              <div className="flex gap-2">
                <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                    placeholder="your@email.com"
                    required
                />
                <button
                    type="button"
                    onClick={handleSendCode}
                    disabled={sendingCode || countdown > 0}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 whitespace-nowrap"
                >
                  {countdown > 0 ? `${countdown}秒后重试` : sendingCode ? '发送中...' : '获取验证码'}
                </button>
              </div>
            </div>

            {/* 验证码输入框 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">验证码</label>
              <input
                  type="text"
                  name="code"
                  value={formData.code}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                  placeholder="请输入 6 位验证码"
                  maxLength={6}
                  required
              />
            </div>

            {/* 密码输入框 + 强度提示 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">密码</label>
              <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                  required
              />
              <div className="mt-2 text-sm space-y-1">
                <p className={`flex items-center gap-1 ${passwordStrength.minLength ? 'text-green-600' : 'text-gray-500'}`}>
                  {passwordStrength.minLength ? '✅' : '○'} 至少8个字符
                </p>
                <p className={`flex items-center gap-1 ${passwordStrength.hasLetter ? 'text-green-600' : 'text-gray-500'}`}>
                  {passwordStrength.hasLetter ? '✅' : '○'} 包含字母
                </p>
                <p className={`flex items-center gap-1 ${passwordStrength.hasNumber ? 'text-green-600' : 'text-gray-500'}`}>
                  {passwordStrength.hasNumber ? '✅' : '○'} 包含数字
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">确认密码</label>
              <input
                  type="password"
                  name="confirm_password"
                  value={formData.confirm_password}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                  required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">姓名/机构名称</label>
              <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                  required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">注册身份</label>
              <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
              >
                <option value="adopter">领养人</option>
                <option value="shelter">救助机构</option>
              </select>
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 disabled:opacity-50"
            >
              {loading ? '注册中...' : '注册'}
            </button>
          </form>

          <p className="mt-4 text-center text-sm text-gray-600">
            已有账号？{' '}
            <Link href="/login" className="text-rose-500 hover:underline">
              立即登录
            </Link>
          </p>
        </div>
      </div>
  );
}