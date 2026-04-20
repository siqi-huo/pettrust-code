"use client";

import { useEffect, useState, useRef, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import type { Message } from '@/types';

export default function MessagesPage() {
    const searchParams = useSearchParams();
    const shelterId = searchParams.get('shelter');
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMsg, setNewMsg] = useState('');
    const [userId, setUserId] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // 使用 useCallback 确保函数引用稳定，并提前声明
    const fetchMessages = useCallback(async () => {
        let url = '/api/messages';
        if (shelterId) url += `?shelter_id=${shelterId}`;
        const res = await fetch(url);
        const data = await res.json();
        if (data.success) {
            setMessages(data.messages);
            setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
        }
    }, [shelterId]);

    useEffect(() => {
        fetch('/api/auth/me')
            .then(res => res.json())
            .then(data => setUserId(data.user.id));

        fetchMessages();
        const interval = setInterval(fetchMessages, 5000);
        return () => clearInterval(interval);
    }, [fetchMessages]);

    const sendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!newMsg.trim() || !shelterId) return;

        const res = await fetch('/api/messages', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                receiver_id: shelterId,
                content: newMsg,
            }),
        });
        const data = await res.json();
        if (data.success) {
            setNewMsg('');
            await fetchMessages();
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-8 h-screen flex flex-col">
            <h1 className="text-2xl font-bold mb-4">与机构沟通</h1>

            {!shelterId ? (
                <div className="bg-white p-8 rounded-xl shadow text-center text-gray-500">
                    请从宠物详情页点击“联系机构”开始对话。
                </div>
            ) : (
                <>
                    <div className="flex-1 bg-white rounded-xl shadow p-4 overflow-y-auto mb-4">
                        {messages.length === 0 ? (
                            <p className="text-gray-400 text-center py-8">暂无消息，开始对话吧</p>
                        ) : (
                            messages.map(msg => (
                                <div
                                    key={msg.id}
                                    className={`mb-3 flex ${msg.sender_id === userId ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-xs px-4 py-2 rounded-lg ${
                                            msg.sender_id === userId
                                                ? 'bg-rose-500 text-white'
                                                : 'bg-gray-100 text-gray-800'
                                        }`}
                                    >
                                        <p>{msg.content}</p>
                                        <span className="text-xs opacity-70 block mt-1">
                      {new Date(msg.created_at).toLocaleTimeString()}
                    </span>
                                    </div>
                                </div>
                            ))
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <form onSubmit={sendMessage} className="flex gap-2">
                        <input
                            type="text"
                            value={newMsg}
                            onChange={(e) => setNewMsg(e.target.value)}
                            placeholder="输入消息..."
                            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                        />
                        <button
                            type="submit"
                            className="px-6 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600"
                        >
                            发送
                        </button>
                    </form>
                </>
            )}
        </div>
    );
}