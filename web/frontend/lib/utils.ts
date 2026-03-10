import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date) {
    if (!date) return '';
    const d = new Date(date);
    const now = new Date();

    const options: Intl.DateTimeFormatOptions = {
        month: 'short',
        day: 'numeric',
    };

    if (d.getFullYear() !== now.getFullYear()) {
        options.year = 'numeric';
    }

    return d.toLocaleDateString('en-US', options);
}
