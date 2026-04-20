"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Heart, Calendar, Shield, Activity } from 'lucide-react';
import type { Pet } from '@/types';

export default function PetDetailPage() {
  const params = useParams();
  const router = useRouter();
  const petId = params.id as string;

  const [pet, setPet] = useState<Pet | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{ id: string; role: string } | null>(null);

  useEffect(() => {
    // 获取当前登录用户
    fetch('/api/auth/me')
        .then(res => res.json())
        .then(data => {
          if (data.success) setUser(data.user);
        });

    // 获取宠物详情
    fetch(`/api/pets/${petId}`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setPet(data.pet);
          }
          setLoading(false);
        });
  }, [petId]);

  const handleApply = () => {
    if (!user) {
      router.push('/login?redirect=' + encodeURIComponent(`/pets/${petId}`));
      return;
    }
    router.push(`/apply/${petId}`);
  };

  const handleContact = () => {
    if (!user) {
      router.push('/login');
      return;
    }
    if (pet) {
      router.push(`/dashboard/adopter/messages?shelter=${pet.shelter_id}`);
    }
  };

  if (loading) {
    return <div className="p-8 text-center">加载中...</div>;
  }

  if (!pet) {
    return <div className="p-8 text-center text-gray-500">宠物不存在</div>;
  }

  return (
      <div className="max-w-6xl mx-auto p-4 md:p-8">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* 图片区域 */}
          <div className="relative h-64 md:h-96 bg-gray-200">
            {pet.photos && pet.photos[0] ? (
                <Image
                    src={pet.photos[0]}
                    alt={pet.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                    priority
                />
            ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  暂无图片
                </div>
            )}
          </div>

          {/* 信息区域 */}
          <div className="p-6 md:p-8">
            <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{pet.name}</h1>
                <p className="text-gray-600 mt-1">
                  {pet.species === 'dog' ? '狗狗' : pet.species === 'cat' ? '猫咪' : pet.species} · {pet.breed || '未知品种'}
                </p>
              </div>
              <span className={`px-4 py-2 rounded-full text-sm font-medium ${
                  pet.status === 'available' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
              }`}>
              {pet.status === 'available' ? '待领养' : pet.status}
            </span>
            </div>

            {/* 基本信息卡片 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-gray-50 p-4 rounded-xl">
                <Calendar className="w-5 h-5 text-rose-500 mb-2" />
                <p className="text-sm text-gray-500">年龄</p>
                <p className="font-semibold">{pet.age} 个月</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl">
                <Heart className="w-5 h-5 text-rose-500 mb-2" />
                <p className="text-sm text-gray-500">性别</p>
                <p className="font-semibold">
                  {pet.gender === 'male' ? '男生 ♂' : pet.gender === 'female' ? '女生 ♀' : '未知'}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl">
                <Shield className="w-5 h-5 text-rose-500 mb-2" />
                <p className="text-sm text-gray-500">疫苗</p>
                <p className="font-semibold">{pet.vaccination_status ? '已接种' : '未接种'}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl">
                <Activity className="w-5 h-5 text-rose-500 mb-2" />
                <p className="text-sm text-gray-500">绝育</p>
                <p className="font-semibold">{pet.neutered ? '已绝育' : '未绝育'}</p>
              </div>
            </div>

            {/* 描述 */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-3">关于 {pet.name}</h2>
              <p className="text-gray-700 leading-relaxed">{pet.description || '暂无详细介绍'}</p>
            </div>

            {/* 健康状态 */}
            {pet.health_status && (
                <div className="mb-8">
                  <h2 className="text-xl font-semibold mb-3">健康状况</h2>
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <p className="text-gray-700">{pet.health_status}</p>
                  </div>
                </div>
            )}

            {/* 操作按钮 */}
            <div className="flex flex-wrap gap-4">
              {user?.role === 'adopter' && pet.status === 'available' && (
                  <button
                      onClick={handleApply}
                      className="flex-1 md:flex-none px-8 py-3 bg-rose-500 text-white rounded-full font-medium hover:bg-rose-600 transition"
                  >
                    申请领养
                  </button>
              )}
              <button
                  onClick={handleContact}
                  className="flex-1 md:flex-none px-8 py-3 border-2 border-rose-500 text-rose-500 rounded-full font-medium hover:bg-rose-50 transition"
              >
                联系机构
              </button>
            </div>
          </div>
        </div>
      </div>
  );
}