import React, { ElementType } from 'react';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SettingsRowProps {
    icon: ElementType;
    label: string;
    description: string;
    onClick?: () => void;
    className?: string;
    rightElement?: React.ReactNode;
}

export function SettingsRow({
    icon: Icon,
    label,
    description,
    onClick,
    className,
    rightElement,
}: SettingsRowProps) {
    const Tag = onClick ? 'button' : 'div';

    return (
        <Tag
            onClick={onClick}
            className={cn(
                'w-full flex items-center justify-between p-4 rounded-2xl border border-border/10 hover:border-primary/20 hover:bg-muted/20 transition-all duration-200 text-left group',
                className,
            )}
        >
            <div className="flex items-center gap-4">
                <div className="h-9 w-9 rounded-xl bg-muted/40 border border-border/10 flex items-center justify-center group-hover:border-primary/20 transition-colors shrink-0">
                    <Icon className="h-4 w-4 text-muted-foreground/50 group-hover:text-primary transition-colors" />
                </div>
                <div>
                    <span className="text-[11px] font-black uppercase tracking-[0.15em] block leading-none">
                        {label}
                    </span>
                    <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-muted-foreground/30 group-hover:text-muted-foreground/50 transition-colors mt-1 block">
                        {description}
                    </span>
                </div>
            </div>
            {rightElement
                ? rightElement
                : onClick && (
                      <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/20 group-hover:translate-x-0.5 group-hover:text-primary transition-all" />
                  )}
        </Tag>
    );
}
