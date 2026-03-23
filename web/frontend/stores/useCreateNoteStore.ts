import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ComposeBoxState {
    isOpen: boolean;
    setOpen: (open: boolean) => void;
}

export const useComposeBoxStore = create<ComposeBoxState>()(
    persist(
        (set) => ({
            isOpen: false,
            setOpen: (open: boolean) => set({ isOpen: open }),
        }),
        { name: 'compose-box-storage' },
    ),
);
