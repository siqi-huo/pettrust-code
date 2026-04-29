"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FileText, Clock, CheckCircle, XCircle, Eye } from 'lucide-react';

interface Contract {
  id: string;
  pet_id: string;
  adopter_id: string;
  status: string;
  created_at: string;
}

export default function ShelterContractsPage() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContracts();
  }, []);

  const fetchContracts = async () => {
    try {
      const res = await fetch('/api/contracts');
      const data = await res.json();
      if (data.success) {
        setContracts(data.contracts || []);
      }
    } catch (error) {
      console.error('获取合同列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { label: string; icon: JSX.Element; className: string }> = {
      pending: { label: '待审核', icon: <Clock className="w-3.5 h-3.5" />, className: 'bg-yellow-100 text-yellow-700' },
      active: { label: '已通过', icon: <CheckCircle className="w-3.5 h-3.5" />, className: 'bg-green-100 text-green-700' },
      completed: { label: '已完成', icon: <CheckCircle className="w-3.5 h-3.5" />, className: 'bg-blue-100 text-blue-700' },
      cancelled: { label: '已取消', icon: <XCircle className="w-3.5 h-3.5" />, className: 'bg-red-100 text-red-700' },
    };
    const c = config[status] || { label: status, icon: null, className: 'bg-gray-100 text-gray-600' };
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${c.className}`}>
        {c.icon}
        {c.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-48"></div>
          <div className="grid md:grid-cols-2 gap-6">
            {[1, 2].map(i => (
              <div key={i} className="h-32 bg-gray-100 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">领养申请管理</h1>
        <p className="text-gray-500 mt-1">审核和处理来自领养人的领养申请</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-yellow-50 rounded-xl p-5 border border-yellow-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-200 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-yellow-700" />
            </div>
            <div>
              <p className="text-2xl font-bold text-yellow-700">{contracts.filter(c => c.status === 'pending').length}</p>
              <p className="text-sm text-yellow-600">待审核</p>
            </div>
          </div>
        </div>
        <div className="bg-green-50 rounded-xl p-5 border border-green-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-200 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-700" />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-700">{contracts.filter(c => c.status === 'active').length}</p>
              <p className="text-sm text-green-600">进行中</p>
            </div>
          </div>
        </div>
        <div className="bg-blue-50 rounded-xl p-5 border border-blue-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-200 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-blue-700" />
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-700">{contracts.filter(c => c.status === 'completed').length}</p>
              <p className="text-sm text-blue-600">已完成</p>
            </div>
          </div>
        </div>
      </div>

      {contracts.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-16 text-center">
          <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <FileText className="w-10 h-10 text-blue-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">暂无需审核的领养申请</h3>
          <p className="text-gray-500">当有领养人提交申请后，它们会显示在这里</p>
        </div>
      ) : (
        <div className="space-y-4">
          {contracts.map((contract) => (
            <div key={contract.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FileText className="w-6 h-6 text-blue-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">合同 #{contract.id.slice(0, 8)}</h3>
                    <p className="text-sm text-gray-500">
                      宠物 ID: {contract.pet_id?.slice(0, 8)} · 
                      领养人 ID: {contract.adopter_id?.slice(0, 8)} · 
                      {new Date(contract.created_at).toLocaleDateString('zh-CN')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {getStatusBadge(contract.status)}
                  <Link href={`/dashboard/shelter/contracts/${contract.id}`} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <Eye className="w-4 h-4" />
                    查看详情
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
