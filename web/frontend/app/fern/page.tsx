'use client';

import React, { useState, useEffect, useRef } from 'react';
import MainLayout from '@/components/layout/main-layout';
import { useFern, FernMessage } from '@/hooks/queries/useFern';
import { useAuthStore } from '@/stores/useAuthStore';
import { getMediaUrl } from '@/lib/utils';
import {
    Send,
    Sparkles,
    Loader2,
    Plus,
    BrainCircuit,
    Bot,
    History,
    MessageSquare,
    Trash2,
    X,
    ArrowUp,
    Paperclip,
    Globe,
    ChevronDown,
    Pencil,
    Check,
    Brain,
    Copy,
    Atom,
    ScrollText,
    Layout,
    Plane,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { formatRelativeTime, formatFernTime } from '@/lib/time';
import Image from 'next/image';
import { MarkdownWithHighlighting } from './markdown-with-highlighting';
import { AI_MODELS } from '@/lib/ai-models';

const ThinkingBlock = ({
    duration,
    reasoning,
    loading,
}: {
    duration?: number;
    reasoning: string;
    loading?: boolean;
}) => {
    const [expanded, setExpanded] = useState(false);
    const formatDuration = (val?: number) => {
        if (!val) return 'a few seconds';
        let totalSeconds =
            val > 1_000_000 ? Math.floor(val / 1_000_000_000) : Math.floor(val / 1000);
        if (totalSeconds < 1) totalSeconds = 1;
        if (totalSeconds < 60) return `${totalSeconds}s`;
        const m = Math.floor(totalSeconds / 60);
        const s = totalSeconds % 60;
        return `${m}m ${s}s`;
    };

    const durationText = formatDuration(duration);

    return (
        <div className="mb-4 flex flex-col items-start w-full max-w-2xl">
            <button
                onClick={() => setExpanded(!expanded)}
                className="flex items-center gap-2 text-foreground/40 hover:text-primary-ui transition-all group outline-none font-medium mb-1 py-1 px-2 rounded-lg hover:bg-primary-ui/5"
            >
                <div className="w-[18px] shrink-0 flex justify-center">
                    <Brain
                        className={cn(
                            'h-[16px] w-[16px]',
                            loading && !duration
                                ? 'animate-pulse text-primary-ui'
                                : 'text-primary-ui/60',
                        )}
                        strokeWidth={2}
                    />
                </div>
                <span className="text-[13px] tracking-tight">
                    {loading && !duration ? 'Thinking...' : `Thought for ${durationText}`}
                </span>
                <ChevronDown
                    className={cn(
                        'h-[14px] w-[14px] opacity-40 transition-transform duration-300',
                        expanded ? 'rotate-180' : '',
                    )}
                />
            </button>

            <AnimatePresence>
                {expanded && reasoning && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden w-full"
                    >
                        <div className="flex w-full relative group mt-1">
                            <div className="absolute left-[11px] top-0 bottom-0 w-px bg-linear-to-b from-primary-ui/30 via-primary-ui/10 to-transparent" />
                            <div className="pl-6 pr-4 py-2 text-[14px] leading-relaxed text-foreground/60 font-medium italic whitespace-pre-wrap text-left border-l-2 border-primary-ui/20 ml-2.5 rounded-r-lg bg-primary-ui/[0.02]">
                                {reasoning}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default function FernPage() {
    const { user } = useAuthStore();
    const { useChats, useMessages, sendMessage, deleteChat, renameChat } = useFern();
    const { data: chats, isLoading: chatsLoading } = useChats();

    const [activeChatId, setActiveChatId] = useState<string>('new');
    const { data: historyMessages, isLoading: messagesLoading } = useMessages(activeChatId);

    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<any[]>([]);
    const [showHistory, setShowHistory] = useState(false);
    const [editingChatId, setEditingChatId] = useState<string | null>(null);
    const [editName, setEditName] = useState('');

    const [selectedModel, setSelectedModel] = useState<string>(AI_MODELS[0].id);
    const [enableReasoning, setEnableReasoning] = useState(true);
    const [enableWebSearch, setEnableWebSearch] = useState(false);
    const [showModelDropdown, setShowModelDropdown] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowModelDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (historyMessages) {
            // Convert history to UI format
            const formatted = historyMessages.flatMap((m) => [
                { role: 'user', content: m.userPrompt, createdAt: m.createdAt },
                {
                    role: 'assistant',
                    content: m.aiResponse,
                    reasoning: m.reasoning,
                    duration: m.duration,
                    createdAt: m.createdAt,
                },
            ]);
            setMessages(formatted);
        } else if (activeChatId === 'new') {
            setMessages([]);
        }
    }, [historyMessages, activeChatId]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!input.trim() || sendMessage.isPending) return;

        const userMsg = { role: 'user', content: input, createdAt: new Date().toISOString() };
        const assistantMsg = {
            role: 'assistant',
            content: '',
            reasoning: '',
            loading: true,
            createdAt: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, userMsg, assistantMsg]);

        const currentInput = input;
        setInput('');

        try {
            const result = await sendMessage.mutateAsync({
                chatId: activeChatId,
                prompt: currentInput,
                model: selectedModel,
                reasoning: enableReasoning,
                webSearch: enableWebSearch,
                onUpdate: (chunk) => {
                    setMessages((prev) => {
                        const newMsgs = [...prev];
                        const lastMsg = newMsgs[newMsgs.length - 1];
                        if (lastMsg.role === 'assistant') {
                            const updated = { ...lastMsg };
                            if (chunk.content) updated.content += chunk.content;
                            if (chunk.reasoning) {
                                updated.reasoning = (updated.reasoning || '') + chunk.reasoning;
                            }
                            if (chunk.duration) {
                                updated.duration = chunk.duration;
                            }
                            if (chunk.session && activeChatId === 'new') {
                                setActiveChatId(chunk.session);
                            }
                            newMsgs[newMsgs.length - 1] = updated;
                        }
                        return newMsgs;
                    });
                },
            });

            if (activeChatId === 'new' && result.sessionId) {
                setActiveChatId(result.sessionId);
            }

            setMessages((prev) => {
                const newMsgs = [...prev];
                const lastMsg = newMsgs[newMsgs.length - 1];
                if (lastMsg.role === 'assistant') {
                    lastMsg.loading = false;
                }
                return newMsgs;
            });
        } catch (error) {
            console.error('Failed to send message:', error);
            // Remove loading state on error
            setMessages((prev) => {
                const newMsgs = [...prev];
                const lastMsg = newMsgs[newMsgs.length - 1];
                if (lastMsg.role === 'assistant') {
                    lastMsg.loading = false;
                    lastMsg.content = 'Failed to connect to Fern.';
                }
                return newMsgs;
            });
        }
    };

    const startNewChat = () => {
        setActiveChatId('new');
        setMessages([]);
        setShowHistory(false);
    };

    return (
        <MainLayout hideSidebar>
            <div className="flex h-[calc(100vh-64px)] sm:h-screen flex-col bg-background relative overflow-hidden">
                {/* Header */}
                <header className="flex h-16 shrink-0 items-center justify-between px-6 bg-background/60 backdrop-blur-md z-30 sticky top-0">
                    <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/5 border border-primary-ui/10">
                            <Image
                                src="/images/fern.webp"
                                alt="Fern AI"
                                width={40}
                                height={40}
                                className="h-full w-full object-cover scale-110"
                            />
                        </div>
                        <div className="flex flex-col" ref={dropdownRef}>
                            <div className="flex items-center gap-2 relative">
                                <button
                                    onClick={() => setShowModelDropdown(!showModelDropdown)}
                                    className="text-[17px] font-bold tracking-tight text-foreground flex items-center gap-1 hover:opacity-70 transition-opacity"
                                >
                                    Fern AI
                                    <span className="text-[10px] font-bold text-primary-ui bg-primary-ui/5 px-2 py-0.5 rounded-full border border-primary-ui/10 opacity-60">
                                        {AI_MODELS.find((m) => m.id === selectedModel)?.name}
                                    </span>
                                    <ChevronDown
                                        className={cn(
                                            'h-4 w-4 text-foreground/40 transition-transform duration-300',
                                            showModelDropdown ? 'rotate-180' : '',
                                        )}
                                    />
                                </button>
                                <AnimatePresence>
                                    {showModelDropdown && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10, scale: 0.98 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 10, scale: 0.98 }}
                                            transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
                                            className="absolute top-full left-0 mt-3 w-64 bg-background/90 backdrop-blur-3xl border border-border-ui/50 rounded-2xl shadow-3xl z-50 py-2.5 overflow-hidden ring-1 ring-black/10"
                                        >
                                            <div className="px-5 py-2 mb-1.5 opacity-30">
                                                <span className="text-[9px] font-bold uppercase tracking-[0.3em]">
                                                    Knowledge Engine
                                                </span>
                                            </div>
                                            {AI_MODELS.map((m) => (
                                                <button
                                                    key={m.id}
                                                    onClick={() => {
                                                        setSelectedModel(m.id);
                                                        setShowModelDropdown(false);
                                                    }}
                                                    className={cn(
                                                        'w-full text-left px-5 py-3.5 text-sm hover:bg-primary-ui/[0.03] flex items-center justify-between transition-colors relative group',
                                                        selectedModel === m.id &&
                                                            'bg-primary-ui/[0.02]',
                                                    )}
                                                >
                                                    <div className="flex flex-col gap-0.5">
                                                        <span
                                                            className={cn(
                                                                'font-bold tracking-tight',
                                                                selectedModel === m.id
                                                                    ? 'text-primary-ui'
                                                                    : 'text-foreground/70',
                                                            )}
                                                        >
                                                            {m.name}
                                                        </span>
                                                        <span className="text-[9px] opacity-40 uppercase font-bold tracking-widest">
                                                            {m.provider}
                                                        </span>
                                                    </div>
                                                    {selectedModel === m.id && (
                                                        <div className="h-1.5 w-1.5 rounded-full bg-primary-ui shadow-[0_0_8px_var(--primary)]" />
                                                    )}
                                                    <div
                                                        className={cn(
                                                            'absolute left-0 top-0 bottom-0 w-[3px] bg-primary-ui transition-transform origin-center scale-y-0',
                                                            selectedModel === m.id
                                                                ? 'scale-y-75'
                                                                : 'group-hover:scale-y-50',
                                                        )}
                                                    />
                                                </button>
                                            ))}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setShowHistory(!showHistory)}
                            className={cn(
                                'h-9 w-9 flex items-center justify-center rounded-2xl transition-all border',
                                showHistory
                                    ? 'bg-primary-ui/10 border-primary-ui/20 text-primary-ui'
                                    : 'border-border-ui/40 text-foreground/40 hover:bg-secondary-ui',
                            )}
                            title="Archives"
                        >
                            <History className="h-4.5 w-4.5" />
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={startNewChat}
                            className="h-9 w-9 flex items-center justify-center rounded-2xl border border-border-ui/40 text-foreground/40 hover:bg-secondary-ui transition-all"
                            title="New Session"
                        >
                            <Plus className="h-4.5 w-4.5" />
                        </motion.button>
                    </div>
                </header>

                {/* Chat Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-12 zerra-scrollbar">
                    {messages.length === 0 && !messagesLoading ? (
                        <div className="flex flex-col items-center justify-center h-full text-center w-full max-w-3xl mx-auto space-y-10 px-4">
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                                animate={{ scale: 1, opacity: 1, y: 0 }}
                                transition={{ type: 'spring', damping: 20, stiffness: 100 }}
                                className="relative"
                            >
                                <div className="h-24 w-24 sm:h-32 sm:w-32 rounded-[32px] overflow-hidden flex items-center justify-center shadow-[0_20px_50px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-primary-ui/10 ring-8 ring-primary-ui/5">
                                    <Image
                                        src="/images/fern.webp"
                                        alt="Fern AI"
                                        width={128}
                                        height={128}
                                        className="h-full w-full object-cover scale-105"
                                        priority
                                    />
                                </div>
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: 0.5, type: 'spring' }}
                                    className="absolute -top-3 -right-3 h-10 w-10 rounded-2xl bg-primary-ui text-background flex items-center justify-center shadow-lg border-4 border-background"
                                >
                                    <Sparkles className="h-5 w-5 fill-current" />
                                </motion.div>
                            </motion.div>

                            <div className="space-y-3">
                                <h2 className="text-3xl sm:text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-linear-to-b from-foreground to-foreground/50">
                                    How can I help you today?
                                </h2>
                                <p className="text-foreground/40 font-medium text-lg">
                                    Your personal AI assistant, powered by Zerra.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-2xl mt-4">
                                {[
                                    {
                                        text: 'Help me write a thread about Web3',
                                        icon: ScrollText,
                                        color: 'text-sky-500',
                                    },
                                    {
                                        text: 'Explain quantum computing simply',
                                        icon: Atom,
                                        color: 'text-purple-500',
                                    },
                                    {
                                        text: 'Best setup for remote coding?',
                                        icon: Layout,
                                        color: 'text-emerald-500',
                                    },
                                    {
                                        text: 'Plan a 3-day trip to Tokyo',
                                        icon: Plane,
                                        color: 'text-orange-500',
                                    },
                                ].map((hint, idx) => (
                                    <motion.button
                                        key={hint.text}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.1 * idx + 0.6 }}
                                        onClick={() => setInput(hint.text)}
                                        className="group px-4 py-3 bg-secondary-ui/20 border border-border-ui/10 hover:border-primary-ui/20 hover:bg-secondary-ui/40 rounded-[18px] transition-all text-left flex items-start gap-3 active:scale-[0.98]"
                                    >
                                        <hint.icon
                                            className={cn(
                                                'h-4 w-4 group-hover:scale-110 transition-transform shrink-0',
                                                hint.color,
                                            )}
                                        />
                                        <span className="text-[13.5px] font-bold text-foreground/50 group-hover:text-foreground/80 transition-colors leading-snug">
                                            {hint.text}
                                        </span>
                                    </motion.button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <>
                            {messages.map((msg, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.4, ease: [0.19, 1, 0.22, 1] }}
                                    className={cn(
                                        'flex w-full max-w-4xl mx-auto mb-10 px-4 gap-3',
                                        msg.role === 'user' ? 'flex-row-reverse' : 'flex-row',
                                    )}
                                >
                                    {/* Avatar */}
                                    <div className="flex-shrink-0 mt-1">
                                        <div className="h-8 w-8 rounded-xl overflow-hidden border border-border-ui/50 shadow-sm bg-secondary-ui/50 flex items-center justify-center">
                                            {msg.role === 'user' ? (
                                                user?.avatar ? (
                                                    <img
                                                        src={getMediaUrl(user.avatar)}
                                                        className="h-full w-full object-cover"
                                                        alt="User"
                                                    />
                                                ) : (
                                                    <div className="text-[10px] font-bold uppercase">
                                                        {user?.name?.slice(0, 1) || 'U'}
                                                    </div>
                                                )
                                            ) : (
                                                <Image
                                                    src="/images/fern.webp"
                                                    width={32}
                                                    height={32}
                                                    className="h-full w-full object-cover"
                                                    alt="Fern"
                                                />
                                            )}
                                        </div>
                                    </div>

                                    {/* Message Body */}
                                    <div
                                        className={cn(
                                            'flex flex-col max-w-[85%]',
                                            msg.role === 'user' ? 'items-end' : 'items-start',
                                        )}
                                    >
                                        {msg.role === 'user' ? (
                                            <div className="relative group">
                                                <div className="absolute -inset-1 bg-linear-to-r from-primary-ui/20 to-primary-ui/10 rounded-[24px] blur-lg opacity-0 group-hover:opacity-40 transition-opacity" />
                                                <div className="relative bg-secondary-ui/80 backdrop-blur-md text-foreground rounded-[20px] rounded-tr-sm px-5 py-3 text-[15px] leading-relaxed shadow-sm border border-border-ui/50 font-medium">
                                                    {msg.content}
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-start w-full relative">
                                                {(msg.reasoning || msg.loading) && (
                                                    <ThinkingBlock
                                                        duration={msg.duration}
                                                        reasoning={msg.reasoning || ''}
                                                        loading={msg.loading}
                                                    />
                                                )}
                                                <div className="w-full">
                                                    <MarkdownWithHighlighting
                                                        content={msg.content}
                                                        className="text-[16px] w-full font-medium prose-p:leading-8 prose-p:mb-4 prose-headings:mb-4 prose-headings:mt-6 prose-ul:mb-4 prose-li:mb-2 prose-code:bg-secondary-ui/50 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:before:content-none prose-code:after:content-none"
                                                    />
                                                </div>
                                                {/* Action Bar (hidden until hover) */}
                                                {!msg.loading && msg.content && (
                                                    <motion.div
                                                        initial={{ opacity: 0 }}
                                                        whileHover={{ opacity: 1 }}
                                                        className="flex items-center gap-2 mt-4 opacity-0 hover:opacity-100 transition-opacity"
                                                    >
                                                        <button
                                                            onClick={() => {
                                                                navigator.clipboard.writeText(
                                                                    msg.content,
                                                                );
                                                            }}
                                                            className="p-2 rounded-xl hover:bg-secondary-ui text-foreground/30 hover:text-foreground/60 transition-all active:scale-90"
                                                            title="Copy Message"
                                                        >
                                                            <Copy className="h-4 w-4" />
                                                        </button>
                                                        <button className="p-2 rounded-xl hover:bg-secondary-ui text-foreground/30 hover:text-foreground/60 transition-all active:scale-90">
                                                            <MessageSquare className="h-4 w-4" />
                                                        </button>
                                                        <button className="p-2 rounded-xl hover:bg-secondary-ui text-foreground/30 hover:text-foreground/60 transition-all active:scale-90">
                                                            <Sparkles className="h-4 w-4" />
                                                        </button>
                                                    </motion.div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                        </>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                <div className="shrink-0 pt-2 pb-8 px-4 bg-linear-to-t from-background via-background to-transparent z-20 w-full">
                    <div className="max-w-4xl mx-auto relative">
                        <form
                            onSubmit={handleSend}
                            className="flex flex-col w-full bg-secondary-ui/40 backdrop-blur-xl focus-within:bg-background border border-border-ui focus-within:border-primary-ui/40 rounded-[32px] shadow-2xl shadow-black/5 transition-all focus-within:ring-4 focus-within:ring-primary-ui/5 p-2"
                        >
                            <textarea
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSend();
                                    }
                                }}
                                placeholder="Whisper to Fern..."
                                rows={1}
                                className="w-full max-h-60 bg-transparent border-none outline-none resize-none pt-4 px-5 pb-2 text-[16px] font-medium text-foreground placeholder:text-foreground/30"
                                style={{ overflow: 'hidden' }}
                                onInput={(e) => {
                                    const target = e.target as HTMLTextAreaElement;
                                    target.style.height = 'auto';
                                    target.style.height = target.scrollHeight + 'px';
                                }}
                            />
                            <div className="flex items-center justify-between px-3 py-2">
                                <div className="flex items-center gap-1.5">
                                    <button
                                        type="button"
                                        onClick={() => setEnableReasoning(!enableReasoning)}
                                        className={cn(
                                            'flex items-center gap-1.5 rounded-2xl px-3.5 py-2 text-[12px] font-bold tracking-tight transition-all active:scale-95',
                                            enableReasoning
                                                ? 'text-primary-ui bg-primary-ui/10 hover:bg-primary-ui/20 shadow-sm'
                                                : 'text-foreground/40 hover:text-foreground/60 hover:bg-secondary-ui',
                                        )}
                                    >
                                        <BrainCircuit className="h-[14px] w-[14px]" />
                                        DeepThink
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setEnableWebSearch(!enableWebSearch)}
                                        className={cn(
                                            'flex items-center gap-1.5 rounded-2xl px-3.5 py-2 text-[12px] font-bold tracking-tight transition-all active:scale-95',
                                            enableWebSearch
                                                ? 'text-primary-ui bg-primary-ui/10 hover:bg-primary-ui/20 shadow-sm'
                                                : 'text-foreground/40 hover:text-foreground/60 hover:bg-secondary-ui',
                                        )}
                                    >
                                        <Globe className="h-[14px] w-[14px]" />
                                        Search
                                    </button>
                                </div>
                                <div className="flex items-center gap-1">
                                    <button
                                        type="button"
                                        className="p-2.5 text-foreground/30 hover:text-foreground/60 hover:bg-secondary-ui rounded-xl transition-all"
                                    >
                                        <Paperclip className="h-5 w-5" />
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={!input.trim() || sendMessage.isPending}
                                        className="h-10 w-10 rounded-2xl bg-primary-ui text-background flex items-center justify-center transition-all hover:scale-105 active:scale-95 disabled:opacity-30 disabled:hover:scale-100 shadow-lg shadow-primary-ui/20"
                                    >
                                        {sendMessage.isPending ? (
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                        ) : (
                                            <ArrowUp className="h-5 w-5" strokeWidth={3} />
                                        )}
                                    </button>
                                </div>
                            </div>
                        </form>
                        <p className="text-[11px] text-center mt-4 text-foreground/20 font-bold tracking-widest uppercase">
                            Fern can make mistakes. Check important info.
                        </p>
                    </div>
                </div>

                {/* Sidebar History Drawer */}
                <AnimatePresence>
                    {showHistory && (
                        <>
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setShowHistory(false)}
                                className="absolute inset-0 bg-black/20 backdrop-blur-[2px] z-30"
                            />
                            <motion.aside
                                initial={{ x: '100%' }}
                                animate={{ x: 0 }}
                                exit={{ x: '100%' }}
                                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                                className="absolute right-0 top-0 bottom-0 w-85 bg-background border-l z-40 flex flex-col shadow-2xl"
                            >
                                <div className="h-16 flex items-center justify-between px-6 border-b">
                                    <h3 className="font-bold text-lg flex items-center gap-2">
                                        <History className="h-5 w-5 text-primary-ui" />
                                        Archive
                                    </h3>
                                    <button
                                        onClick={() => setShowHistory(false)}
                                        className="p-2 hover:bg-secondary-ui rounded-full transition-colors"
                                    >
                                        <X className="h-5 w-5" />
                                    </button>
                                </div>
                                <div className="flex-1 overflow-y-auto p-4 zerra-scrollbar">
                                    {chatsLoading ? (
                                        <div className="flex p-8 justify-center">
                                            <Loader2 className="animate-spin text-primary-ui" />
                                        </div>
                                    ) : chats?.length === 0 ? (
                                        <div className="p-12 text-center opacity-40 text-sm flex flex-col items-center gap-2">
                                            <MessageSquare className="h-8 w-8 opacity-20" />
                                            <span>No sessions found</span>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col gap-2">
                                            {chats?.map((chat) => (
                                                <div key={chat.id} className="group relative">
                                                    <button
                                                        onClick={() => {
                                                            setActiveChatId(chat.id);
                                                            setShowHistory(false);
                                                        }}
                                                        className={cn(
                                                            'w-full text-left p-4 rounded-2xl flex items-center gap-4 transition-all border border-transparent',
                                                            activeChatId === chat.id
                                                                ? 'bg-primary-ui/10 border-primary-ui/20 text-primary-ui'
                                                                : 'hover:bg-secondary-ui/80',
                                                        )}
                                                    >
                                                        <div
                                                            className={cn(
                                                                'h-10 w-10 rounded-xl flex items-center justify-center shrink-0',
                                                                activeChatId === chat.id
                                                                    ? 'bg-primary-ui/20'
                                                                    : 'bg-secondary-ui',
                                                            )}
                                                        >
                                                            <MessageSquare className="h-5 w-5" />
                                                        </div>
                                                        <div className="flex-1 overflow-hidden">
                                                            {editingChatId === chat.id ? (
                                                                <input
                                                                    type="text"
                                                                    autoFocus
                                                                    value={editName}
                                                                    onChange={(e) =>
                                                                        setEditName(e.target.value)
                                                                    }
                                                                    onKeyDown={(e) => {
                                                                        if (e.key === 'Enter') {
                                                                            renameChat.mutate({
                                                                                chatId: chat.id,
                                                                                name: editName,
                                                                            });
                                                                            setEditingChatId(null);
                                                                        } else if (
                                                                            e.key === 'Escape'
                                                                        ) {
                                                                            setEditingChatId(null);
                                                                        }
                                                                    }}
                                                                    onClick={(e) =>
                                                                        e.stopPropagation()
                                                                    }
                                                                    className="w-full text-[15px] font-bold bg-background border border-primary-ui/50 rounded px-1 py-0.5 outline-none focus:ring-1 focus:ring-primary-ui text-foreground"
                                                                />
                                                            ) : (
                                                                <p className="text-[15px] font-bold truncate pr-6">
                                                                    {chat.name}
                                                                </p>
                                                            )}
                                                            <p className="text-[11px] opacity-50 font-medium tracking-wider">
                                                                {formatFernTime(chat.createdAt)}
                                                            </p>
                                                        </div>
                                                    </button>
                                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                                        {editingChatId === chat.id ? (
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    renameChat.mutate({
                                                                        chatId: chat.id,
                                                                        name: editName,
                                                                    });
                                                                    setEditingChatId(null);
                                                                }}
                                                                className="p-1.5 rounded-xl hover:bg-emerald-500/10 hover:text-emerald-500 transition-colors bg-background"
                                                            >
                                                                <Check className="h-4 w-4" />
                                                            </button>
                                                        ) : (
                                                            <>
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setEditingChatId(chat.id);
                                                                        setEditName(chat.name);
                                                                    }}
                                                                    className="p-1.5 rounded-xl hover:bg-primary-ui/10 hover:text-primary-ui transition-colors bg-background"
                                                                >
                                                                    <Pencil className="h-4 w-4" />
                                                                </button>
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        if (
                                                                            window.confirm(
                                                                                'Are you sure you want to delete this session?',
                                                                            )
                                                                        ) {
                                                                            deleteChat.mutate(
                                                                                chat.id,
                                                                            );
                                                                            if (
                                                                                activeChatId ===
                                                                                chat.id
                                                                            )
                                                                                setActiveChatId(
                                                                                    'new',
                                                                                );
                                                                        }
                                                                    }}
                                                                    className="p-1.5 rounded-xl hover:bg-destructive/10 hover:text-destructive transition-colors bg-background"
                                                                    disabled={deleteChat.isPending}
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </motion.aside>
                        </>
                    )}
                </AnimatePresence>
            </div>
        </MainLayout>
    );
}
