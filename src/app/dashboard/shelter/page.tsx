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
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-6">机构管理后台</h1>
        <p className="mb-8">欢迎，{user?.name}！</p>
        <div className="grid md:grid-cols-2 gap-6">
          <Link href="/dashboard/shelter/pets" className="p-6 bg-white rounded-xl shadow hover:shadow-lg">
            <PawPrint className="w-8 h-8 text-rose-500 mb-4" />
            <h2 className="text-xl font-semibold mb-2">宠物管理</h2>
            <p className="text-gray-600">发布、编辑、下架宠物信息</p>
          </Link>
          <Link href="/dashboard/shelter/contracts" className="p-6 bg-white rounded-xl shadow hover:shadow-lg">
            <FileText className="w-8 h-8 text-blue-500 mb-4" />
            <h2 className="text-xl font-semibold mb-2">领养申请</h2>
            <p className="text-gray-600">审核领养合同</p>
          </Link>
        </div>
      </div>
  );
}