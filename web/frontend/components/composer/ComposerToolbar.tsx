import React from 'react';
import { ImageIcon, Smile, List, Calendar, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ComposerToolbarProps {
    banner: string;
    setBanner: (val: string) => void;
    onSubmitLabel?: React.ReactNode;
}

/**
 * Toolbar for the post composer — media, emojis, poll, and media link input.
 * Extracted from PostCreation for single-responsibility.
 */
export function ComposerToolbar({ banner, setBanner, onSubmitLabel }: ComposerToolbarProps) {
    return (
        <div className="flex items-center gap-1 -ml-2 flex-wrap">
            <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 text-primary hover:bg-primary/10 rounded-full transition-colors"
                title="Attach media"
            >
                <ImageIcon className="h-5 w-5" />
            </Button>
            <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 text-primary hover:bg-primary/10 rounded-full transition-colors hidden sm:flex"
                title="Poll"
            >
                <List className="h-5 w-5" />
            </Button>
            <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 text-primary hover:bg-primary/10 rounded-full transition-colors hidden sm:flex"
                title="Emoji"
            >
                <Smile className="h-5 w-5" />
            </Button>
            <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 text-primary hover:bg-primary/10 rounded-full transition-colors hidden sm:flex"
                title="Schedule"
            >
                <Calendar className="h-5 w-5" />
            </Button>
            <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 text-primary hover:bg-primary/10 rounded-full transition-colors opacity-50 cursor-not-allowed"
                title="Location (unavailable)"
                disabled
            >
                <MapPin className="h-5 w-5" />
            </Button>

            <div className="h-8 w-px bg-border/10 mx-2" />

            {/* Inline media link input */}
            <div className="flex items-center h-8 px-3 rounded-full bg-muted/20 border border-border/10 focus-within:border-primary/40 transition-colors">
                <input
                    type="text"
                    placeholder="Media Link"
                    className="bg-transparent border-none text-[10px] font-bold uppercase tracking-wider text-foreground focus:outline-none placeholder:text-muted-foreground/30 w-24 sm:w-32"
                    value={banner}
                    onChange={(e) => setBanner(e.target.value)}
                />
            </div>
        </div>
    );
}
