"use client";

import { useEffect, useState, Fragment } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FileText, PawPrint, MessageCircle, LogOut, User as UserIcon, ChevronDown } from 'lucide-react';
import { Menu, Transition } from '@headlessui/react';
import type { User } from '@/types';

export default function AdopterDashboard() {
    const [user, setUser] = useState<User | null>(null);
    const router = useRouter();

    useEffect(() => {
        fetch('/api/auth/me')
            .then(res => res.json())
            .then(data => {
                if (!data.success) router.push('/login');
                else setUser(data.user);
            });
    }, [router]);

    const handleLogout = async () => {
        await fetch('/api/auth/logout', { method: 'POST' });
        router.push('/login');
    };

    return (
        <div className="p-8 max-w-6xl mx-auto">
            {/* 欢迎栏 + 用户菜单 */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold mb-2">欢迎，{user?.name}！</h1>
                    <p className="text-gray-600">这里是你的领养中心，开始你的领养之旅吧。</p>
                </div>

                {/* 用户下拉菜单 */}
                <Menu as="div" className="relative">
                    <Menu.Button className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-gray-200 hover:shadow-md transition">
                        <div className="w-8 h-8 bg-rose-100 rounded-full flex items-center justify-center text-rose-600">
                            <UserIcon className="w-4 h-4" />
                        </div>
                        <span className="text-gray-700">{user?.name || '用户'}</span>
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                    </Menu.Button>

                    <Transition
                        as={Fragment}
                        enter="transition ease-out duration-100"
                        enterFrom="transform opacity-0 scale-95"
                        enterTo="transform opacity-100 scale-100"
                        leave="transition ease-in duration-75"
                        leaveFrom="transform opacity-100 scale-100"
                        leaveTo="transform opacity-0 scale-95"
                    >
                        <Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right bg-white rounded-lg shadow-lg border border-gray-200 focus:outline-none z-50">
                            <div className="p-1">
                                <Menu.Item>
                                    {({ active }) => (
                                        <button
                                            onClick={handleLogout}
                                            className={`${
                                                active ? 'bg-rose-50 text-rose-600' : 'text-gray-700'
                                            } group flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm`}
                                        >
                                            <LogOut className="w-4 h-4" />
                                            退出登录
                                        </button>
                                    )}
                                </Menu.Item>
                            </div>
                        </Menu.Items>
                    </Transition>
                </Menu>
            </div>

            {/* 功能卡片区域保持不变 */}
            <div className="grid md:grid-cols-3 gap-6">
                <Link href="/dashboard/adopter/agreement" className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition">
                    <FileText className="w-10 h-10 text-rose-500 mb-4" />
                    <h2 className="text-xl font-semibold mb-2">领养规则与说明</h2>
                    <p className="text-gray-600">阅读并同意领养协议，了解领养责任</p>
                </Link>

                <Link href="/dashboard/adopter/pets" className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition">
                    <PawPrint className="w-10 h-10 text-rose-500 mb-4" />
                    <h2 className="text-xl font-semibold mb-2">浏览待领养宠物</h2>
                    <p className="text-gray-600">查看等待新家的毛孩子们</p>
                </Link>

                <Link href="/dashboard/adopter/messages" className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition">
                    <MessageCircle className="w-10 h-10 text-rose-500 mb-4" />
                    <h2 className="text-xl font-semibold mb-2">消息中心</h2>
                    <p className="text-gray-600">与救助机构沟通，咨询宠物详情</p>
                </Link>
            </div>

            <div className="mt-12">
                <h3 className="text-lg font-semibold mb-4">最近动态</h3>
                <div className="bg-white p-6 rounded-xl shadow">
                    <p className="text-gray-500">暂无新动态</p>
                </div>
            </div>
        </div>
    );
}