"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { MessageCircle } from 'lucide-react';
import type { Pet } from '@/types';

export default function AdopterPetsPage() {
    const [pets, setPets] = useState<Pet[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const agreed = localStorage.getItem('adoption_agreed');
        if (!agreed) {
            router.push('/dashboard/adopter/agreement');
            return;
        }

        fetch('/api/pets?status=available')
            .then(res => res.json())
            .then(data => {
                // 不可变更新：直接设置新数组
                setPets(data.pets || []);
                setLoading(false);
            });
    }, [router]);

    const handleContact = (shelterId: string) => {
        router.push(`/dashboard/adopter/messages?shelter=${shelterId}`);
    };

    if (loading) {
        return <div className="p-8 text-center">加载中...</div>;
    }

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold mb-2">待领养宠物</h1>
            <p className="text-gray-600 mb-8">找到你的心灵伙伴，给 TA 一个温暖的家</p>

            {pets.length === 0 ? (
                <div className="bg-white p-12 rounded-xl shadow text-center text-gray-500">
                    暂时没有待领养的宠物，请稍后再来看看。
                </div>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {pets.map((pet) => (
                        <div key={pet.id} className="bg-white rounded-xl shadow overflow-hidden hover:shadow-lg transition">
                            <div className="relative h-48 bg-gray-200">
                                {pet.photos && pet.photos[0] ? (
                                    <Image
                                        src={pet.photos[0]}
                                        alt={pet.name}
                                        fill
                                        className="object-cover"
                                        sizes="(max-width: 768px) 100vw, 33vw"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400">暂无图片</div>
                                )}
                            </div>
                            <div className="p-4">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="text-xl font-semibold">{pet.name}</h3>
                                    <span className="text-sm bg-rose-100 text-rose-600 px-2 py-1 rounded-full">
                    {pet.gender === 'male' ? '♂' : '♀'} {pet.age}个月
                  </span>
                                </div>
                                <p className="text-gray-600 text-sm mb-2">{pet.breed} · {pet.species}</p>
                                <p className="text-gray-700 line-clamp-2 mb-4">{pet.description || '暂无描述'}</p>
                                <div className="flex gap-2">
                                    <Link
                                        href={`/pets/${pet.id}`}
                                        className="flex-1 text-center px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600"
                                    >
                                        查看详情
                                    </Link>
                                    <button
                                        onClick={() => handleContact(pet.shelter_id)}
                                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                                        title="联系机构"
                                    >
                                        <MessageCircle className="w-5 h-5" />
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