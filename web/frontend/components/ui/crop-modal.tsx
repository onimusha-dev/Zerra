'use client';

import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2 } from 'lucide-react';
import getCroppedImg from '@/lib/cropImage';

interface CropModalProps {
    imageSrc: string;
    aspectRatio: number;
    onCropComplete: (croppedFile: File) => void;
    onClose: () => void;
}

export default function CropModal({
    imageSrc,
    aspectRatio,
    onCropComplete,
    onClose,
}: CropModalProps) {
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const handleCropComplete = useCallback((croppedArea: any, croppedPixels: any) => {
        setCroppedAreaPixels(croppedPixels);
    }, []);

    const handleSave = async () => {
        if (!croppedAreaPixels) return;
        try {
            setIsProcessing(true);
            const croppedFile = await getCroppedImg(imageSrc, croppedAreaPixels);
            if (croppedFile) {
                onCropComplete(croppedFile);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-background/90 backdrop-blur-sm"
                />
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="relative flex w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-background border border-border-ui shadow-2xl z-10"
                >
                    <div className="flex h-14 shrink-0 items-center justify-between border-b px-4">
                        <div className="flex items-center gap-6">
                            <button
                                onClick={onClose}
                                className="rounded-full p-2 transition-colors hover:bg-secondary-ui text-foreground"
                            >
                                <X className="h-5 w-5" />
                            </button>
                            <h2 className="text-xl font-bold">Crop Image</h2>
                        </div>
                        <button
                            onClick={handleSave}
                            disabled={isProcessing}
                            className="rounded-full bg-foreground px-5 py-1.5 font-bold text-background transition-transform hover:scale-105 active:scale-95 disabled:opacity-50"
                        >
                            {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Apply'}
                        </button>
                    </div>

                    <div className="relative w-full h-[60vh] bg-secondary-ui">
                        <Cropper
                            image={imageSrc}
                            crop={crop}
                            zoom={zoom}
                            aspect={aspectRatio}
                            onCropChange={setCrop}
                            onCropComplete={handleCropComplete}
                            onZoomChange={setZoom}
                        />
                    </div>

                    <div className="p-4 flex items-center justify-center gap-4">
                        <span className="text-sm font-medium">Zoom</span>
                        <input
                            type="range"
                            value={zoom}
                            min={1}
                            max={3}
                            step={0.1}
                            aria-labelledby="Zoom"
                            onChange={(e) => setZoom(Number(e.target.value))}
                            className="w-1/2"
                        />
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
