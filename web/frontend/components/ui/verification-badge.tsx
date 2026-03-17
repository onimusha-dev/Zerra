import React from 'react';
import { BadgeCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VerificationBadgeProps {
    className?: string;
    size?: number;
}

export const VerificationBadge = ({ className, size = 18 }: VerificationBadgeProps) => {
    return (
        <div className={cn('inline-flex items-center', className)}>
            <BadgeCheck size={size} fill="#1d9bf0" className="text-white" strokeWidth={1.5} />
        </div>
    );
};
