'use client';

import React, { useState, useEffect, useRef } from 'react';
import MainLayout from '@/components/layout/main-layout';
import { useFern, FernMessage } from '@/hooks/queries/useFern';
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

        // Ollama returns duration in nanoseconds. 1 second = 1,000,000,000 ns.
        let totalSeconds =
            val > 1_000_000 ? Math.floor(val / 1_000_000_000) : Math.floor(val / 1000);
        if (totalSeconds < 1) totalSeconds = 1;

        if (totalSeconds < 60) return `${totalSeconds} seconds`;
        const m = Math.floor(totalSeconds / 60);
        const s = totalSeconds % 60;
        if (s === 0) return `${m} minute${m > 1 ? 's' : ''}`;
        return `${m} minute${m > 1 ? 's' : ''} ${s} second${s !== 1 ? 's' : ''}`;
    };

    const durationText = formatDuration(duration);

    return (
        <div className="mb-4 flex flex-col items-start w-full">
            <button
                onClick={() => setExpanded(!expanded)}
                className="flex items-center gap-2 text-foreground/50 hover:text-foreground transition-colors group outline-none font-medium mb-1"
            >
                <div className="w-[20px] shrink-0 flex justify-center">
                    <Brain
                        className={cn(
                            'h-[18px] w-[18px]',
                            loading && !duration ? 'animate-pulse text-primary-ui' : '',
                        )}
                        strokeWidth={2.5}
                    />
                </div>
                <span className="text-[14px]">
                    {loading && !duration ? 'Thinking...' : `Thought for ${durationText}`}
                </span>
                <ChevronDown
                    className={cn(
                        'h-[15px] w-[15px] opacity-40 transition-transform',
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
                        <div className="flex w-full relative group">
                            <div className="absolute left-[9px] top-1 bottom-1 border-l-2 border-border-ui/50 group-hover:border-foreground/30 transition-colors" />
                            <div className="pl-8 pt-2 pb-3 text-[14px] leading-relaxed opacity-70 italic whitespace-pre-wrap text-left">
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
                <header className="flex h-16 shrink-0 items-center justify-between border-b px-4 bg-background z-20">
                    <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl overflow-hidden text-background shadow-lg">
                            <Image
                                src="/images/fern.webp"
                                alt="Fern AI"
                                width={44}
                                height={44}
                                className="h-full w-full object-cover"
                            />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 relative">
                                <button
                                    onClick={() => setShowModelDropdown(!showModelDropdown)}
                                    className="text-xl font-bold bg-clip-text text-transparent bg-linear-to-r from-foreground to-foreground/60 flex items-center gap-1 hover:opacity-80"
                                >
                                    Fern AI{' '}
                                    <ChevronDown
                                        className="h-5 w-5 text-foreground/50 transition-transform"
                                        style={{
                                            transform: showModelDropdown
                                                ? 'rotate(180deg)'
                                                : 'none',
                                        }}
                                    />
                                </button>
                                <AnimatePresence>
                                    {showModelDropdown && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            className="absolute top-full left-0 mt-3 w-56 bg-background border border-border-ui rounded-2xl shadow-xl z-50 py-2 overflow-hidden"
                                        >
                                            {AI_MODELS.map((m) => (
                                                <button
                                                    key={m.id}
                                                    onClick={() => {
                                                        setSelectedModel(m.id);
                                                        setShowModelDropdown(false);
                                                    }}
                                                    className={cn(
                                                        'w-full text-left px-4 py-2.5 text-sm hover:bg-secondary-ui flex items-center justify-between transition-colors',
                                                        selectedModel === m.id &&
                                                            'text-primary-ui bg-primary-ui/5',
                                                    )}
                                                >
                                                    <div className="flex flex-col">
                                                        <span className="font-bold">{m.name}</span>
                                                        <span className="text-[10px] opacity-60 uppercase tracking-widest">
                                                            {m.provider}
                                                        </span>
                                                    </div>
                                                    {selectedModel === m.id && (
                                                        <Check className="h-4 w-4" />
                                                    )}
                                                </button>
                                            ))}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                            <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-[10px] font-bold tracking-widest text-emerald-500 uppercase">
                                    {AI_MODELS.find((m) => m.id === selectedModel)?.name} Online
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-1.5 p-1 bg-secondary-ui/50 rounded-2xl border">
                        <button
                            onClick={() => setShowHistory(!showHistory)}
                            className={cn(
                                'p-2 rounded-xl transition-all hover:bg-background shadow-sm',
                                showHistory
                                    ? 'bg-background text-primary-ui shadow-md'
                                    : 'text-foreground/60',
                            )}
                            title="Chat History"
                        >
                            <History className="h-5 w-5" />
                        </button>
                        <div className="w-px h-4 bg-foreground/10" />
                        <button
                            onClick={startNewChat}
                            className="p-2 rounded-xl hover:bg-background text-foreground/60 transition-all active:scale-95"
                            title="New Chat"
                        >
                            <Plus className="h-5 w-5" />
                        </button>
                    </div>
                </header>

                {/* Chat Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-hide">
                    {messages.length === 0 && !messagesLoading ? (
                        <div className="flex flex-col items-center justify-center h-full text-center w-full max-w-2xl mx-auto space-y-6">
                            <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="relative"
                            >
                                <div className="h-28 w-28 rounded-3xl overflow-hidden flex items-center justify-center shadow-2xl border border-border-ui/50">
                                    <Image
                                        src="/images/fern.webp"
                                        alt="Fern AI"
                                        width={112}
                                        height={112}
                                        className="h-full w-full object-cover"
                                    />
                                </div>
                                <div className="absolute -top-2 -right-2 h-8 w-8 rounded-full bg-primary-ui flex items-center justify-center animate-bounce">
                                    <Sparkles className="h-4 w-4 text-background" />
                                </div>
                            </motion.div>
                            <div>
                                <h2 className="text-[32px] font-semibold text-foreground/90">
                                    Hello! I&apos;m Fern
                                </h2>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl mt-8">
                                {[
                                    { text: 'Help me write a thread about Web3', icon: '🧵' },
                                    { text: 'Explain quantum computing simply', icon: '⚛️' },
                                    { text: 'Best setup for remote coding?', icon: '💻' },
                                    { text: 'Plan a 3-day trip to Tokyo', icon: '🇯🇵' },
                                ].map((hint) => (
                                    <button
                                        key={hint.text}
                                        onClick={() => setInput(hint.text)}
                                        className="group p-4 bg-secondary-ui/40 border border-transparent hover:border-primary-ui/30 hover:bg-secondary-ui/80 rounded-2xl transition-all text-left flex items-start gap-3"
                                    >
                                        <span className="text-xl group-hover:scale-110 transition-transform">
                                            {hint.icon}
                                        </span>
                                        <span className="text-[14px] font-medium opacity-80 group-hover:text-primary-ui transition-colors leading-snug">
                                            {hint.text}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <>
                            {messages.map((msg, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={cn(
                                        'flex flex-col w-full max-w-4xl mx-auto mb-6',
                                        msg.role === 'user' ? 'items-end' : 'items-start',
                                    )}
                                >
                                    {msg.role === 'user' ? (
                                        <div className="bg-secondary-ui text-foreground rounded-[24px] px-5 py-3 max-w-[80%] text-[15px] leading-relaxed">
                                            {msg.content}
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-start w-full">
                                            {(msg.reasoning || msg.loading) && (
                                                <ThinkingBlock
                                                    duration={msg.duration}
                                                    reasoning={msg.reasoning || ''}
                                                    loading={msg.loading}
                                                />
                                            )}
                                            <MarkdownWithHighlighting
                                                content={msg.content}
                                                className="text-[16px] w-full font-medium prose-p:leading-relaxed prose-a:text-primary-ui"
                                            />
                                        </div>
                                    )}
                                </motion.div>
                            ))}
                        </>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                <div className="shrink-0 pt-2 pb-6 px-4 bg-background z-20 w-full max-w-4xl mx-auto">
                    <form
                        onSubmit={handleSend}
                        className="flex flex-col w-full bg-secondary-ui/40 focus-within:bg-background border border-border-ui focus-within:border-primary-ui/50 rounded-[28px] shadow-sm transition-all focus-within:ring-2 focus-within:ring-primary-ui/20 focus-within:shadow-xl"
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
                            placeholder="Message Fern"
                            rows={1}
                            className="w-full max-h-48 bg-transparent border-none outline-none resize-none pt-4 px-5 pb-2 text-[15px] text-foreground placeholder:text-foreground/50"
                            style={{ overflow: 'hidden' }}
                            onInput={(e) => {
                                const target = e.target as HTMLTextAreaElement;
                                target.style.height = 'auto';
                                target.style.height = target.scrollHeight + 'px';
                            }}
                        />
                        <div className="flex items-center justify-between p-3 pt-1">
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => setEnableReasoning(!enableReasoning)}
                                    className={cn(
                                        'flex items-center gap-1.5 border rounded-full px-3 py-1.5 text-[13px] font-semibold transition-colors',
                                        enableReasoning
                                            ? 'text-primary-ui border-primary-ui/30 bg-primary-ui/10 hover:bg-primary-ui/20'
                                            : 'text-foreground/70 border-border-ui bg-background/50 hover:bg-secondary-ui',
                                    )}
                                >
                                    <BrainCircuit className="h-[14px] w-[14px]" />
                                    DeepThink
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setEnableWebSearch(!enableWebSearch)}
                                    className={cn(
                                        'flex items-center gap-1.5 border rounded-full px-3 py-1.5 text-[13px] font-semibold transition-colors',
                                        enableWebSearch
                                            ? 'text-primary-ui border-primary-ui/30 bg-primary-ui/10 hover:bg-primary-ui/20'
                                            : 'text-foreground/70 border-border-ui bg-background/50 hover:bg-secondary-ui',
                                    )}
                                >
                                    <Globe className="h-[14px] w-[14px]" />
                                    Search
                                </button>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    className="p-2 text-foreground/50 hover:text-foreground transition-colors"
                                >
                                    <Paperclip className="h-5 w-5" />
                                </button>
                                <button
                                    type="submit"
                                    disabled={!input.trim() || sendMessage.isPending}
                                    className="h-8 w-8 rounded-full bg-primary-ui text-background flex items-center justify-center transition-all hover:opacity-90 disabled:opacity-50 disabled:bg-secondary-ui disabled:text-foreground/30 shadow-md"
                                >
                                    {sendMessage.isPending ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <ArrowUp className="h-[18px] w-[18px]" strokeWidth={2.5} />
                                    )}
                                </button>
                            </div>
                        </div>
                    </form>
                    <p className="text-[12px] text-center mt-3 text-secondary-foreground/50">
                        AI-generated, for reference only.
                    </p>
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
                                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
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
