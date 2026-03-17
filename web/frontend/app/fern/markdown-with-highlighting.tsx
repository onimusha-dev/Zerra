'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus, vs } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { cn } from '@/lib/utils';
import { Check, Copy } from 'lucide-react';
import { Components } from 'react-markdown';
import { useThemeStore } from '@/stores/useThemeStore';

interface MarkdownWithHighlightingProps {
    content: string;
    className?: string;
}

export function MarkdownWithHighlighting({ content, className }: MarkdownWithHighlightingProps) {
    const { theme } = useThemeStore();
    const [copied, setCopied] = React.useState<string | null>(null);

    const handleCopy = (code: string, language: string) => {
        navigator.clipboard.writeText(code);
        setCopied(language);
        setTimeout(() => setCopied(null), 2000);
    };

    const syntaxStyle = ['eclipse'].includes(theme) ? vs : vscDarkPlus;

    const markdownComponents: Components = {
        code({ node, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '');
            const language = match ? match[1] : '';
            const codeString = String(children).replace(/\n$/, '');

            if (match) {
                return (
                    <div className="my-4 rounded-lg overflow-hidden border border-border-ui">
                        <div className="bg-secondary-ui/80 px-4 py-2 text-xs font-mono border-b border-border-ui flex items-center gap-2">
                            <span className="text-foreground/70">{language}</span>
                            <button
                                onClick={() => handleCopy(codeString, language)}
                                className="ml-auto flex items-center gap-1 px-2 py-1 rounded bg-foreground/10 hover:bg-foreground/20 transition-colors text-foreground/80"
                            >
                                {copied === language ? (
                                    <>
                                        <Check className="h-3 w-3" />
                                        <span>Copied!</span>
                                    </>
                                ) : (
                                    <>
                                        <Copy className="h-3 w-3" />
                                        <span>Copy</span>
                                    </>
                                )}
                            </button>
                        </div>
                        <SyntaxHighlighter
                            style={syntaxStyle as any}
                            language={language}
                            PreTag="div"
                            className="m-0! rounded-none! text-sm"
                            showLineNumbers={codeString.split('\n').length > 3}
                            lineNumberStyle={{ opacity: 0.5, minWidth: '2.5em' }}
                        >
                            {codeString}
                        </SyntaxHighlighter>
                    </div>
                );
            }

            // For inline code, we can safely spread props since it's a native element
            return (
                <code
                    className="bg-secondary-ui/80 px-1.5 py-0.5 rounded-md text-sm font-mono border border-border-ui text-foreground"
                    {...props}
                >
                    {children}
                </code>
            );
        },
    };

    return (
        <div className={cn('prose prose-neutral dark:prose-invert max-w-none', className)}>
            <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                {content}
            </ReactMarkdown>
        </div>
    );
}
