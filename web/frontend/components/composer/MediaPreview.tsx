import React from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MediaPreviewProps {
    src: string;
    onRemove: () => void;
    aspectRatio?: string;
}

/**
 * Inline media preview card with remove button.
 * Shared between PostComposer and any other creation surfaces.
 */
export function MediaPreview({ src, onRemove, aspectRatio = 'aspect-video' }: MediaPreviewProps) {
    return (
        <div
            className={`relative rounded-2xl overflow-hidden border border-border/10 ${aspectRatio} group`}
        >
            <img
                src={src}
                alt="media preview"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.01]"
            />
            <div className="absolute inset-0 bg-linear-to-t from-background/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 h-8 w-8 rounded-full bg-background/60 backdrop-blur-md border border-border/10 hover:bg-background/90 transition-all shadow-lg"
                onClick={onRemove}
            >
                <X className="h-4 w-4" />
            </Button>
        </div>
    );
}
