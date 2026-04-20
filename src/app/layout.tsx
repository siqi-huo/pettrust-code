import type { Metadata } from 'next';
import './globals.css';
import ChatWidget from "@/components/ChatWidget"; // 导入 AI 助手组件

export const metadata: Metadata = {
  title: {
    default: 'PetTrust - 人宠互信交流系统',
    template: '%s | PetTrust',
  },
  description:
      '基于Web的人宠互信交流系统，为流浪动物领养提供全周期信任建立与监护服务',
  keywords: [
    '宠物领养',
    '人宠互信',
    '动物福利',
    'AI健康检测',
    '智能监护',
  ],
  authors: [{ name: 'PetTrust Team' }],
  generator: 'Coze Code',
};

export default function RootLayout({
                                     children,
                                   }: {
  children: React.ReactNode;
}) {
  return (
      <html lang="zh-CN">
      <body className="min-h-screen bg-gray-50 antialiased">
      {children}
      <ChatWidget /> {/* 添加 AI 助手悬浮按钮 */}
      </body>
      </html>
  );
}