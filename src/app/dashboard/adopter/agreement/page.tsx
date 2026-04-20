"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AgreementPage() {
    const router = useRouter();
    const [agreed, setAgreed] = useState(false);

    const handleContinue = () => {
        if (agreed) {
            // 可以存储用户已同意的状态（比如 localStorage 或后端记录）
            localStorage.setItem('adoption_agreed', 'true');
            router.push('/dashboard/adopter/pets');
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-8">
            <h1 className="text-3xl font-bold mb-6">领养规则与责任说明</h1>

            <div className="bg-white p-8 rounded-xl shadow space-y-4 text-gray-700">
                <h2 className="text-xl font-semibold">PetTrust 领养协议</h2>
                <p>感谢你选择领养代替购买。在领养前，请仔细阅读以下规则：</p>

                <ol className="list-decimal pl-6 space-y-3">
                    <li><strong>终身负责</strong>：领养是一生的承诺，请确保你有稳定的住所和经济能力照顾宠物。</li>
                    <li><strong>适龄绝育</strong>：所有领养宠物均需在适龄时完成绝育手术，避免无序繁殖。</li>
                    <li><strong>定期免疫与驱虫</strong>：每年按时接种疫苗，定期体内外驱虫。</li>
                    <li><strong>科学喂养</strong>：提供优质的宠粮和清洁的饮水，禁止随意喂食人类食物。</li>
                    <li><strong>不离不弃</strong>：如遇特殊情况无法继续饲养，必须联系原救助机构退回，不得私自转送或遗弃。</li>
                    <li><strong>接受回访</strong>：领养后需配合机构进行定期线上回访（照片/视频），确保宠物生活良好。</li>
                    <li><strong>文明养宠</strong>：外出牵绳、办理犬证、及时清理粪便，遵守当地养宠法规。</li>
                </ol>

                <h3 className="text-lg font-semibold pt-4">领养流程说明</h3>
                <ul className="list-disc pl-6 space-y-2">
                    <li><strong>浏览宠物</strong> → 选择心仪的毛孩子</li>
                    <li><strong>提交申请</strong> → 填写领养意向表</li>
                    <li><strong>机构审核</strong> → 救助机构会与你联系沟通</li>
                    <li><strong>签署电子合同</strong> → 在线完成领养协议</li>
                    <li><strong>接宠回家</strong> → 开启幸福生活</li>
                </ul>
            </div>

            <div className="mt-6 flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={agreed}
                        onChange={(e) => setAgreed(e.target.checked)}
                        className="w-5 h-5 text-rose-500 rounded"
                    />
                    <span className="text-gray-700">我已仔细阅读并同意以上所有领养规则</span>
                </label>
                <button
                    onClick={handleContinue}
                    disabled={!agreed}
                    className="px-6 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                    同意并继续浏览宠物
                </button>
            </div>
        </div>
    );
}