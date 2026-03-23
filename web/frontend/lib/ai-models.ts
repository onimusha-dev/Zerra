export interface AiModel {
    id: string;
    name: string;
    provider: string;
}

export const AI_MODELS: AiModel[] = [
    { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', provider: 'Google' },
    { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash', provider: 'Google' },
    { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', provider: 'Google' },
    { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', provider: 'Google' },
    { id: 'qwen3:1.7b', name: 'Qwen3 1.7B', provider: 'Ollama' },
    { id: 'qwen3:0.6b', name: 'Qwen3 0.6B', provider: 'Ollama' },
    { id: 'lfm2.5-thinking:1.2b', name: 'LFM Reasoning', provider: 'Ollama' },
    { id: 'functiongemma:270m', name: 'Gemma Function', provider: 'Ollama' },
];
