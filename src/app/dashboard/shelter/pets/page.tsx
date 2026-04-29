"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, PawPrint, Edit, Trash2, ShieldCheck, Syringe, Heart, Calendar } from 'lucide-react';

interface Pet {
  id: string;
  name: string;
  species: string;
  breed: string;
  age: number;
  gender: string;
  weight: string;
  status: string;
  shelter_id: string;
  neutered: boolean;
  vaccination_status: boolean;
  health_status: string;
  description: string;
  photos: string[];
  created_at: string;
}

export default function ShelterPetsPage() {
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPets();
  }, []);

  const fetchPets = async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const res = await fetch('/api/pets', {
        signal: controller.signal,
        credentials: 'include',
      });
      clearTimeout(timeoutId);

      if (!res.ok) {
        if (res.status === 401) {
          setError('登录状态已失效，请重新登录');
        } else {
          const errorData = await res.json().catch(() => ({}));
          setError(errorData.error || `服务器错误 (${res.status})`);
        }
        return;
      }

      const data = await res.json();
      if (data.success) {
        setPets(data.pets || []);
        setError('');
      } else {
        setError(data.error || '获取宠物列表失败');
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') {
        setError('请求超时，请检查网络连接');
      } else {
        console.error('获取宠物列表失败:', err);
        setError('网络错误，请稍后重试');
      }
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

  const getHealthLabel = (status: string) => {
    const map: Record<string, string> = { healthy: '💚 健康', sick: '❤️‍🩹 生病', recovering: '🩹 康复中', unknown: '❓ 未知' };
    return map[status] || status;
  };

  if (loading) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-48"></div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-64 bg-gray-100 rounded-xl"></div>
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

      {/* 错误提示 */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>
      )}

      {/* 空状态提示（修改了标题和说明文字） */}
      {pets.length === 0 && !error ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-16 text-center">
          <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <PawPrint className="w-10 h-10 text-rose-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">暂无宠物信息</h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            您还没有发布任何宠物，点击下方按钮添加您的第一只宠物吧
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
              {/* 宠物照片 */}
              <div className="h-48 bg-gradient-to-br from-rose-100 to-orange-100 relative overflow-hidden">
                {pet.photos && pet.photos[0] ? (
                  <img
                    src={pet.photos[0]}
                    alt={pet.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <PawPrint className="w-16 h-16 text-rose-300" />
                  </div>
                )}
                <div className="absolute top-3 right-3">{getStatusBadge(pet.status)}</div>
              </div>

              {/* 宠物信息 */}
              <div className="p-5">
                <div className="mb-3">
                  <h3 className="text-lg font-semibold text-gray-900">{pet.name}</h3>
                  <p className="text-sm text-gray-500">
                    {getSpeciesLabel(pet.species)}{pet.breed ? ` · ${pet.breed}` : ''}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 mb-3">
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-50 rounded-md text-xs text-gray-600">
                    {pet.gender === 'male' ? '♂ 公' : pet.gender === 'female' ? '♀ 母' : '未知'}
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-50 rounded-md text-xs text-gray-600">
                    <Calendar className="w-3 h-3" />
                    {pet.age} 个月
                  </span>
                  {pet.weight && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-50 rounded-md text-xs text-gray-600">
                      ⚖ {pet.weight}
                    </span>
                  )}
                </div>

                <div className="space-y-1.5 mb-3">
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <ShieldCheck className={`w-3.5 h-3.5 ${pet.neutered ? 'text-green-500' : 'text-gray-400'}`} />
                    {pet.neutered ? '已绝育' : '未绝育'}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <Syringe className={`w-3.5 h-3.5 ${pet.vaccination_status ? 'text-green-500' : 'text-gray-400'}`} />
                    {pet.vaccination_status ? '已接种疫苗' : '未接种疫苗'}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <Heart className={`w-3.5 h-3.5 ${pet.health_status === 'healthy' ? 'text-green-500' : 'text-orange-500'}`} />
                    {getHealthLabel(pet.health_status)}
                  </div>
                </div>

                {pet.description && (
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500 line-clamp-2">💬 {pet.description}</p>
                  </div>
                )}

                <p className="text-xs text-gray-400 mb-4">
                  发布: {new Date(pet.created_at).toLocaleDateString('zh-CN')}
                </p>

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
