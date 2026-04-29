"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { PawPrint, FileText } from 'lucide-react';

export default function ShelterDashboard() {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (!data.success) router.push('/login');
        else setUser(data.user);
      });
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">机构管理后台</h1>
      <p className="text-gray-600 mb-8">欢迎回来，{user?.name}！管理您的宠物和领养申请。</p>

      <div className="grid md:grid-cols-2 gap-6">
        <Link href="/dashboard/shelter/pets" className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition">
          <PawPrint className="w-10 h-10 text-rose-500 mb-4" />
          <h2 className="text-xl font-semibold mb-2">宠物管理</h2>
          <p className="text-gray-600">发布、编辑、下架宠物信息</p>
        </Link>
        <Link href="/dashboard/shelter/contracts" className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition">
          <FileText className="w-10 h-10 text-blue-500 mb-4" />
          <h2 className="text-xl font-semibold mb-2">领养申请</h2>
          <p className="text-gray-600">审核领养合同，管理签约进度</p>
        </Link>
      </div>
    </div>
  );
}
