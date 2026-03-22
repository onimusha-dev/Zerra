'use client';

import { useComposeBoxStore } from '@/stores/useCreateNoteStore';
import { Plus } from 'lucide-react';

export const CreatePost = () => {
    const { isOpen, setOpen } = useComposeBoxStore();

    return (
        <div
            className={`fixed flex md:hidden bottom-20 right-5 z-50 p-3 items-center justify-center rounded-full bg-primary-ui cursor-pointer shadow-lg hover:scale-105 transition-transform duration-500
        ${isOpen ? 'rotate-45' : ''}`}
            onClick={() => setOpen(!isOpen)}
        >
            <Plus size={36} className="text-background" />
        </div>
    );
};
