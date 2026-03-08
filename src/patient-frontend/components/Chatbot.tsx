"use client";

import { useState, useRef, useEffect, FormEvent, ChangeEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, User, Bot, Loader2 } from 'lucide-react';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
}

export default function Chatbot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isLoading]);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        const userMessage = input.trim();
        if (!userMessage || isLoading) return;

        const newUserMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: userMessage,
        };

        const updatedMessages = [...messages, newUserMessage];
        setMessages(updatedMessages);
        setInput('');
        setIsLoading(true);

        // Add a placeholder assistant message to stream into
        const assistantId = (Date.now() + 1).toString();
        setMessages(prev => [...prev, { id: assistantId, role: 'assistant', content: '' }]);

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: updatedMessages.map(m => ({ role: m.role, content: m.content })),
                }),
            });

            if (!response.ok) throw new Error('API error');

            const reader = response.body?.getReader();
            const decoder = new TextDecoder();

            if (!reader) throw new Error('No stream');

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });

                // toTextStreamResponse sends plain text chunks directly
                setMessages(prev =>
                    prev.map(m =>
                        m.id === assistantId ? { ...m, content: m.content + chunk } : m
                    )
                );
            }
        } catch (err) {
            setMessages(prev =>
                prev.map(m =>
                    m.id === assistantId
                        ? { ...m, content: 'Sorry, I encountered an error. Please try again.' }
                        : m
                )
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 font-sans">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.9 }}
                        transition={{ duration: 0.2 }}
                        className="absolute bottom-16 right-0 w-[350px] sm:w-[400px] h-[500px] bg-white border border-gray-100 shadow-2xl rounded-2xl flex flex-col overflow-hidden"
                    >
                        {/* Header */}
                        <div className="bg-medical-blue p-4 flex justify-between items-center text-white">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                                    <Bot size={18} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-sm">HealthBook AI</h3>
                                    <p className="text-[10px] text-white/80">Symptom & Triage Navigator</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="hover:bg-white/20 p-1.5 rounded-full transition-colors"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
                            {messages.length === 0 && (
                                <div className="text-center text-gray-400 text-xs mt-10">
                                    <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                                        <Bot size={24} className="text-medical-blue" />
                                    </div>
                                    <p className="font-medium text-gray-500">Welcome to HealthBook!</p>
                                    <p className="mt-1">Describe your symptoms to find the right specialist.</p>
                                </div>
                            )}

                            {messages.map((m) => (
                                <div
                                    key={m.id}
                                    className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    {m.role !== 'user' && (
                                        <div className="w-8 h-8 rounded-full bg-medical-blue/10 flex items-center justify-center shrink-0">
                                            <Bot size={16} className="text-medical-blue" />
                                        </div>
                                    )}

                                    <div
                                        className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${m.role === 'user'
                                            ? 'bg-medical-blue text-white rounded-br-none'
                                            : 'bg-white border border-gray-100 text-gray-700 rounded-bl-none shadow-sm'
                                            }`}
                                    >
                                        {m.content || (m.role === 'assistant' && isLoading && (
                                            <span className="flex items-center gap-1.5">
                                                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                            </span>
                                        ))}
                                    </div>

                                    {m.role === 'user' && (
                                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                                            <User size={16} className="text-gray-500" />
                                        </div>
                                    )}
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <form onSubmit={handleSubmit} className="p-3 bg-white border-t border-gray-100">
                            <div className="relative flex items-center">
                                <input
                                    value={input}
                                    onChange={(e: ChangeEvent<HTMLInputElement>) => setInput(e.target.value)}
                                    placeholder="E.g. I have a severe headache..."
                                    className="w-full bg-gray-50 border border-gray-200 rounded-full pl-4 pr-12 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-medical-blue/20 focus:border-medical-blue transition-all"
                                    disabled={isLoading}
                                />
                                <button
                                    type="submit"
                                    disabled={isLoading || !input.trim()}
                                    className="absolute right-2 w-8 h-8 bg-medical-blue text-white rounded-full flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors shadow-sm"
                                >
                                    {isLoading ? (
                                        <Loader2 size={14} className="animate-spin" />
                                    ) : (
                                        <Send size={14} className="ml-0.5" />
                                    )}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Floating Bubble */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-105 active:scale-95 ${isOpen ? 'bg-gray-900' : 'bg-medical-blue border-4 border-blue-100'
                    }`}
                aria-label="Open AI Health Assistant"
            >
                {isOpen ? (
                    <X size={24} className="text-white" />
                ) : (
                    <MessageSquare size={24} className="text-white" />
                )}
            </button>
        </div>
    );
}
