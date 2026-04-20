"use client";

import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, X, PawPrint } from 'lucide-react';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
}

export default function ChatWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const abortControllerRef = useRef<AbortController | null>(null);

    // 自动滚动到底部
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: input.trim(),
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);
        setError(null);

        abortControllerRef.current = new AbortController();

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: [...messages, userMessage].map(m => ({
                        role: m.role,
                        content: m.content,
                    })),
                }),
                signal: abortControllerRef.current.signal,
            });

            if (!response.ok) {
                throw new Error(`HTTP error ${response.status}`);
            }

            if (!response.body) {
                throw new Error('No response body');
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let assistantContent = '';
            const assistantMessageId = (Date.now() + 1).toString();

            setMessages(prev => [...prev, { id: assistantMessageId, role: 'assistant', content: '' }]);

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                assistantContent += chunk;

                setMessages(prev =>
                    prev.map(m =>
                        m.id === assistantMessageId ? { ...m, content: assistantContent } : m
                    )
                );
            }
        } catch (err: unknown) {
            if (err instanceof Error) {
                if (err.name === 'AbortError') {
                    console.log('请求已取消');
                } else {
                    console.error('聊天错误:', err);
                    setError(err.message || '出错了，请稍后重试');
                }
            } else {
                setError('出错了，请稍后重试');
            }
        } finally {
            setIsLoading(false);
            abortControllerRef.current = null;
        }
    };

    const handleCancel = () => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
    };

    return (
        <>
            {/* 悬浮按钮 - 更大更可爱 */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-6 right-6 z-50 group flex items-center gap-2 px-5 py-4 bg-gradient-to-br from-rose-400 to-rose-500 text-white rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 animate-pulse-subtle"
            >
                {isOpen ? (
                    <X className="w-6 h-6" />
                ) : (
                    <>
                        <PawPrint className="w-7 h-7" />
                        <span className="font-medium text-base">养宠助手</span>
                    </>
                )}
                {/* 脉冲光环 */}
                <span className="absolute inset-0 rounded-full bg-rose-400 opacity-30 animate-ping" style={{ animationDuration: '3s' }}></span>
            </button>

            {/* 聊天窗口 */}
            {isOpen && (
                <div className="fixed bottom-28 right-6 z-50 w-96 h-[600px] max-h-[80vh] bg-white rounded-xl shadow-2xl border border-gray-200 flex flex-col">
                    {/* 头部 */}
                    <div className="p-4 border-b bg-rose-50 rounded-t-xl">
                        <div className="flex items-center gap-2">
                            <Bot className="w-5 h-5 text-rose-500" />
                            <span className="font-semibold text-gray-800">PetTrust 养宠助手</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">AI 建议仅供参考，紧急情况请及时就医</p>
                    </div>

                    {/* 消息列表 */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        {messages.length === 0 && (
                            <div className="text-center text-gray-400 py-8">
                                <Bot className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                <p>你好！我是 PetTrust 养宠助手</p>
                                <p className="text-sm">有任何养宠问题都可以问我～</p>
                            </div>
                        )}

                        {messages.map((m) => (
                            <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`flex items-start gap-2 max-w-[85%] ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                                    <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                                        m.role === 'user' ? 'bg-rose-100' : 'bg-gray-100'
                                    }`}>
                                        {m.role === 'user' ? <User className="w-4 h-4 text-rose-500" /> : <Bot className="w-4 h-4 text-gray-600" />}
                                    </div>
                                    <div className={`px-3 py-2 rounded-2xl ${
                                        m.role === 'user'
                                            ? 'bg-rose-500 text-white rounded-tr-sm'
                                            : 'bg-gray-100 text-gray-800 rounded-tl-sm'
                                    }`}>
                                        <p className="text-sm whitespace-pre-wrap">{m.content}</p>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="flex items-center gap-2">
                                    <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center">
                                        <Bot className="w-4 h-4 text-gray-600" />
                                    </div>
                                    <div className="px-3 py-2 bg-gray-100 rounded-2xl rounded-tl-sm">
                                        <div className="flex gap-1">
                                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                                        </div>
                                        <button
                                            onClick={handleCancel}
                                            className="text-xs text-gray-500 mt-1 hover:text-gray-700"
                                        >
                                            取消
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {error && (
                            <div className="text-center text-red-500 text-sm py-2">
                                {error}
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* 输入框 */}
                    <form onSubmit={handleSubmit} className="p-4 border-t">
                        <div className="flex gap-2">
                            <input
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="输入你的问题..."
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 text-sm"
                                disabled={isLoading}
                            />
                            <button
                                type="submit"
                                disabled={isLoading || !input.trim()}
                                className="px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Send className="w-4 h-4" />
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </>
    );
}