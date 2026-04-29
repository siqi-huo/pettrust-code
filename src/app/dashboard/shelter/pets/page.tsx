"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, PawPrint, Edit, Trash2 } from 'lucide-react';

interface Pet {
  id: string;
  name: string;
  species: string;
  breed: string;
  age: number;
  gender: string;
  status: string;
  shelter_id: string;
  created_at: string;
}

export default function ShelterPetsPage() {
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPets();
  }, []);

  const fetchPets = async () => {
    try {
      const sessionRes = await fetch('/api/auth/me');
      const sessionData = await sessionRes.json();
      if (!sessionData.user) return;

      const res = await fetch('/api/pets');
      const data = await res.json();
      if (data.success) {
        // 筛选属于当前机构的宠物
        const filtered = data.pets?.filter((p: Pet) => p.shelter_id === sessionData.user.id) || [];
        setPets(filtered);
      }
    } catch (error) {
      console.error('获取宠物列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { label: string; className: string }> = {
      available: { label: '待领养', className: 'bg-green-100 text-green-700' },
      pending: { label: '申请中', className: 'bg-yellow-100 text-yellow-700' },
      adopted: { label: '已领养', className: 'bg-blue-100 text-blue-700' },
      unavailable: { label: '已下架', className: 'bg-gray-100 text-gray-600' },
    };
    const c = config[status] || { label: status, className: 'bg-gray-100 text-gray-600' };
    return <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${c.className}`}>{c.label}</span>;
  };

  const getSpeciesLabel = (species: string) => {
    const map: Record<string, string> = { dog: '🐶 狗狗', cat: '🐱 猫咪', bird: '🐦 鸟类', rabbit: '🐰 兔子', other: '🐾 其他' };
    return map[species] || species;
  };

  if (loading) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-48"></div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-48 bg-gray-100 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      {/* 头部区域 */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">宠物管理</h1>
          <p className="text-gray-500 mt-1">管理您发布的待领养宠物信息</p>
        </div>
        <Link
          href="/dashboard/shelter/pets/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors shadow-sm hover:shadow-md"
        >
          <Plus className="w-5 h-5" />
          发布新宠物
        </Link>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: '全部宠物', value: pets.length, color: 'bg-rose-50 text-rose-700' },
          { label: '待领养', value: pets.filter(p => p.status === 'available').length, color: 'bg-green-50 text-green-700' },
          { label: '申请中', value: pets.filter(p => p.status === 'pending').length, color: 'bg-yellow-50 text-yellow-700' },
          { label: '已领养', value: pets.filter(p => p.status === 'adopted').length, color: 'bg-blue-50 text-blue-700' },
        ].map((stat, i) => (
          <div key={i} className={`${stat.color} rounded-xl p-4`}>
            <p className="text-3xl font-bold">{stat.value}</p>
            <p className="text-sm mt-1 opacity-80">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* 宠物列表 */}
      {pets.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-16 text-center">
          <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <PawPrint className="w-10 h-10 text-rose-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">还没有发布宠物</h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            点击右上角的"发布新宠物"按钮，为等待领养的小动物创建一个专属档案吧
          </p>
          <Link
            href="/dashboard/shelter/pets/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors"
          >
            <Plus className="w-5 h-5" />
            发布第一只宠物
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pets.map((pet) => (
            <div key={pet.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group">
              {/* 占位图 */}
              <div className="h-40 bg-gradient-to-br from-rose-100 to-orange-100 flex items-center justify-center">
                <PawPrint className="w-16 h-16 text-rose-300 group-hover:scale-110 transition-transform" />
              </div>

              {/* 卡片内容 */}
              <div className="p-5">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{pet.name}</h3>
                    <p className="text-sm text-gray-500">{getSpeciesLabel(pet.species)}{pet.breed ? ` · ${pet.breed}` : ''}</p>
                  </div>
                  {getStatusBadge(pet.status)}
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                  <span>{pet.gender === 'male' ? '♂ 公' : pet.gender === 'female' ? '♀ 母' : '未知'}</span>
                  <span className="text-gray-300">|</span>
                  <span>{pet.age} 个月</span>
                  <span className="text-gray-300">|</span>
                  <span className="text-xs text-gray-400">{new Date(pet.created_at).toLocaleDateString('zh-CN')}</span>
                </div>

                <div className="flex gap-2 pt-3 border-t border-gray-100">
                  <Link
                    href={`/dashboard/shelter/pets/${pet.id}/edit`}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                    编辑
                  </Link>
                  <button className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-sm text-red-500 border border-red-100 rounded-lg hover:bg-red-50 transition-colors">
                    <Trash2 className="w-4 h-4" />
                    下架
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
