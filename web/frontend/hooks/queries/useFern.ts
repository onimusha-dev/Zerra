import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

export interface FernMessage {
    userPrompt: string;
    aiResponse: string;
    reasoning: string | null;
    duration: number | null;
    createdAt: string;
}

export interface ChatSession {
    id: string;
    name: string;
    createdAt: string;
}

export const useFern = () => {
    const queryClient = useQueryClient();

    const useChats = () =>
        useQuery({
            queryKey: ['fern', 'chats'],
            queryFn: async () => {
                const res = await api.get('/fern/chats');
                return res.data.data as ChatSession[];
            },
        });

    const useMessages = (chatId: string | null) =>
        useQuery({
            queryKey: ['fern', 'messages', chatId],
            queryFn: async () => {
                if (!chatId || chatId === 'new') return [];
                const res = await api.get(`/fern/${chatId}`);
                return res.data.data as FernMessage[];
            },
            enabled: !!chatId && chatId !== 'new',
        });

    const sendMessage = useMutation({
        mutationFn: async ({
            chatId,
            prompt,
            model,
            reasoning,
            webSearch,
            onUpdate,
        }: {
            chatId: string;
            prompt: string;
            model?: string;
            reasoning?: boolean;
            webSearch?: boolean;
            onUpdate?: (chunk: {
                content?: string;
                reasoning?: string;
                session?: string;
                duration?: number;
            }) => void;
        }) => {
            const token =
                typeof window !== 'undefined' ? localStorage.getItem('zerra_token') : null;
            // We assume /api is proxied correctly
            const baseUrl = api.defaults.baseURL || '/api';
            const res = await fetch(`${baseUrl}/fern/${chatId}/message`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({ prompt, model, reasoning, webSearch }),
            });

            if (!res.ok) throw new Error('Failed to send message');

            const reader = res.body?.getReader();
            const decoder = new TextDecoder();
            let done = false;
            let buffer = '';

            let finalSessionId = chatId;
            let finalDuration: number | undefined;
            let currentEvent = 'message';

            while (reader && !done) {
                const { value, done: doneReading } = await reader.read();
                done = doneReading;
                if (value) {
                    buffer += decoder.decode(value, { stream: true });
                    const lines = buffer.split('\n');
                    buffer = lines.pop() || '';

                    for (const line of lines) {
                        if (line.startsWith('event: ')) {
                            currentEvent = line.substring(7).trim();
                        } else if (line.startsWith('data: ')) {
                            const dataStr = line.substring(6).trim();
                            if (!dataStr) continue;
                            try {
                                const parsed = JSON.parse(dataStr);
                                if (currentEvent === 'session') {
                                    finalSessionId = parsed;
                                    onUpdate?.({ session: parsed });
                                } else if (currentEvent === 'content') {
                                    onUpdate?.({ content: parsed });
                                } else if (currentEvent === 'reasoning') {
                                    onUpdate?.({ reasoning: parsed });
                                } else if (currentEvent === 'done') {
                                    finalDuration = parsed.duration;
                                    onUpdate?.({ duration: finalDuration });
                                }
                            } catch (e) {}
                        }
                    }
                }
            }
            return { sessionId: finalSessionId, duration: finalDuration };
        },
        onSuccess: (data) => {
            // Invalidate the chat list in case a new chat was created
            queryClient.invalidateQueries({ queryKey: ['fern', 'chats'] });
            // Invalidate the current chat messages
            if (data.sessionId && data.sessionId !== 'new') {
                queryClient.invalidateQueries({ queryKey: ['fern', 'messages', data.sessionId] });
            }
        },
    });

    const deleteChat = useMutation({
        mutationFn: async (chatId: string) => {
            await api.delete(`/fern/${chatId}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['fern', 'chats'] });
        },
    });

    const renameChat = useMutation({
        mutationFn: async ({ chatId, name }: { chatId: string; name: string }) => {
            const res = await api.post(`/fern/${chatId}/rename`, { name });
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['fern', 'chats'] });
        },
    });

    return { useChats, useMessages, sendMessage, deleteChat, renameChat };
};
