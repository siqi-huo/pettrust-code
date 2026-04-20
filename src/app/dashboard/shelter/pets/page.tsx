"use client";

import Link from 'next/link';

export default function ShelterPetsPage() {
    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">宠物管理</h1>
                <Link href="/dashboard/shelter/pets/new" className="px-4 py-2 bg-rose-500 text-white rounded-lg">
                    发布新宠物
                </Link>
            </div>
            <p>这里将展示你发布的宠物列表。</p>
        </div>
    );
}