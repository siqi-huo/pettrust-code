"use client";

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function NewPetPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        // 调用 API 创建宠物
        // ...
        alert('发布成功（演示）');
        router.push('/dashboard/shelter/pets');
    };

    return (
        <div className="max-w-2xl mx-auto p-8">
            <h1 className="text-2xl font-bold mb-6">发布新宠物</h1>
            <form onSubmit={handleSubmit} className="space-y-4">
                <input placeholder="宠物名字" className="w-full p-2 border rounded" required />
                <button type="submit" disabled={loading} className="px-4 py-2 bg-rose-500 text-white rounded">
                    {loading ? '发布中...' : '发布'}
                </button>
            </form>
        </div>
    );
}