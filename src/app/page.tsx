"use client";

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Heart, Shield, Activity, FileCheck, Search, CheckCircle, User, LogOut, LayoutDashboard } from 'lucide-react';
import type { User as UserType } from '@/types';

export default function Home() {
  const [isVisible, setIsVisible] = useState(false);
  const [user, setUser] = useState<UserType | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsVisible(true);
    // 获取当前登录用户
    fetch('/api/auth/me')
        .then(res => res.json())
        .then(data => {
          if (data.success) setUser(data.user);
        });

    // 点击外部关闭菜单
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    setShowUserMenu(false);
    window.location.href = '/';
  };

  const features = [
    { icon: <Heart className="w-8 h-8" />, title: '渐进式熟悉', description: '领养前通过互动打卡建立信任，让宠物和领养人逐步适应彼此' },
    { icon: <FileCheck className="w-8 h-8" />, title: '数字化签约', description: '便捷的电子合同签署流程，清晰明确的责任与义务' },
    { icon: <Shield className="w-8 h-8" />, title: '定期回访监督', description: '智能回访提醒与监督机制，确保宠物得到妥善照顾' },
    { icon: <Activity className="w-8 h-8" />, title: 'AI健康检测', description: '基于视觉AI的健康监测与虐待检测，全方位守护宠物安全' },
  ];

  const steps = [
    { icon: <Search className="w-6 h-6" />, title: '浏览宠物', desc: '发现心仪的TA' },
    { icon: <Heart className="w-6 h-6" />, title: '互动熟悉', desc: '通过打卡建立信任' },
    { icon: <FileCheck className="w-6 h-6" />, title: '签署合同', desc: '完成领养协议' },
    { icon: <CheckCircle className="w-6 h-6" />, title: '幸福相伴', desc: '开始新生活' },
  ];

  return (
      <div className="min-h-screen">
        {/* 导航栏 */}
        <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md border-b border-gray-200 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center gap-2">
                <Heart className="w-8 h-8 text-rose-500" />
                <span className="text-xl font-bold text-gray-900">PetTrust</span>
              </div>
              <div className="flex items-center gap-4">
                <Link href="/pets" className="text-gray-600 hover:text-gray-900">浏览宠物</Link>

                {user ? (
                    <div className="relative" ref={menuRef}>
                      <button
                          onClick={() => setShowUserMenu(!showUserMenu)}
                          className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition"
                      >
                        <User className="w-5 h-5 text-gray-600" />
                        <span className="text-gray-700">欢迎，{user.name}</span>
                      </button>

                      {showUserMenu && (
                          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                            <Link
                                href={user.role === 'shelter' ? '/dashboard/shelter' : '/dashboard/adopter'}
                                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-50"
                                onClick={() => setShowUserMenu(false)}
                            >
                              <LayoutDashboard className="w-4 h-4" />
                              我的仪表盘
                            </Link>
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-2 w-full text-left px-4 py-2 text-red-600 hover:bg-red-50"
                            >
                              <LogOut className="w-4 h-4" />
                              退出登录
                            </button>
                          </div>
                      )}
                    </div>
                ) : (
                    <Link href="/login" className="px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600">
                      登录
                    </Link>
                )}
              </div>
            </div>
          </div>
        </nav>

        {/* Hero 区域 */}
        <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-rose-50 to-orange-50">
          <div className="max-w-7xl mx-auto text-center">
            <h1 className={`text-5xl md:text-6xl font-bold text-gray-900 mb-6 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              让每一只宠物
              <span className="text-rose-500">找到温暖的家</span>
            </h1>
            <p className={`text-xl text-gray-600 mb-8 max-w-2xl mx-auto transition-all duration-1000 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              PetTrust 为流浪动物领养提供全周期的信任建立与监护服务，降低弃养率，让爱延续
            </p>
            <div className={`flex gap-4 justify-center transition-all duration-1000 delay-400 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <Link href="/login?role=adopter" className="px-8 py-4 bg-rose-500 text-white rounded-full text-lg font-medium hover:bg-rose-600 transition-colors">
                开始领养之旅
              </Link>
              <Link href="/login?role=shelter" className="px-8 py-4 border-2 border-rose-500 text-rose-500 rounded-full text-lg font-medium hover:bg-rose-50 transition-colors">
                机构入驻
              </Link>
            </div>
          </div>
        </section>

        {/* 功能介绍 */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">为什么选择 PetTrust</h2>
              <p className="text-xl text-gray-600">全方位保障人宠互信，让领养更安心</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                  <div key={index} className="p-6 bg-white rounded-2xl shadow-sm hover:shadow-lg transition-shadow border border-gray-100">
                    <div className="w-14 h-14 bg-rose-100 rounded-xl flex items-center justify-center text-rose-500 mb-4">
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                    <p className="text-gray-600">{feature.description}</p>
                  </div>
              ))}
            </div>
          </div>
        </section>

        {/* 领养流程 */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">领养流程</h2>
              <p className="text-xl text-gray-600">简单四步，开启人宠互信之旅</p>
            </div>
            <div className="grid md:grid-cols-4 gap-8">
              {steps.map((step, index) => (
                  <div key={index} className="text-center relative">
                    {index < steps.length - 1 && (
                        <div className="hidden md:block absolute top-10 left-1/2 w-full h-0.5 bg-gray-200" />
                    )}
                    <div className="relative w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-md border border-gray-100">
                      <div className="text-rose-500">{step.icon}</div>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{step.title}</h3>
                    <p className="text-gray-600">{step.desc}</p>
                  </div>
              ))}
            </div>
          </div>
        </section>

        {/* 底部 */}
        <footer className="py-12 px-4 sm:px-6 lg:px-8 bg-gray-900 text-gray-400">
          <div className="max-w-7xl mx-auto text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Heart className="w-6 h-6 text-rose-500" />
              <span className="text-xl font-bold text-white">PetTrust</span>
            </div>
            <p>© 2026 PetTrust. 用科技守护每一份信任</p>
          </div>
        </footer>
      </div>
  );
}
