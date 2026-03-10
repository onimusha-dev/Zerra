import { cn } from '@/lib/utils';

interface PostStatButtonProps {
    icon: any;
    count?: number;
    color: 'primary' | 'rose-500';
    active?: boolean;
    onClick?: () => void;
}

export function PostStatButton({ icon: Icon, count, color, active, onClick }: PostStatButtonProps) {
    return (
        <button
            onClick={onClick}
            className={cn(
                'flex flex-col items-center gap-2 group/btn transition-colors',
                color === 'rose-500' ? 'hover:text-rose-500' : 'hover:text-primary',
                active && (color === 'rose-500' ? 'text-rose-500' : 'text-primary'),
            )}
        >
            <div
                className={cn(
                    'minimal-card p-4 interactive-hover border-border/10',
                    color === 'rose-500'
                        ? 'group-hover/btn:border-rose-500/20'
                        : 'group-hover/btn:border-primary/20',
                    active &&
                        (color === 'rose-500'
                            ? 'border-rose-500/40 bg-rose-500/5'
                            : 'border-primary/40 bg-primary/5'),
                )}
            >
                <Icon className={cn('h-6 w-6', active && 'fill-current')} />
            </div>
            {count !== undefined && (
                <span className="text-[10px] font-bold uppercase tracking-widest opacity-20 group-hover/btn:opacity-100 transition-opacity">
                    {count}
                </span>
            )}
        </button>
    );
}
