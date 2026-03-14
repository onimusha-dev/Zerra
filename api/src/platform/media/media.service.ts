import { LoggerService } from '@platform/logger/logger.service';
import { MediaProcessor, ImageOptions } from './media.processor';
import { StorageService } from '../storage/storage.service';
import { MediaError, UnsupportedMediaTypeError } from '@shared/json/apiError';
import { ConfigService } from '@platform/config';

export interface MediaProfile {
    type: 'image' | 'video';
    folder: string;
    options: ImageOptions;
    validateSquare?: boolean;
}

const UPLOAD_PROFILES: Record<string, MediaProfile> = {
    avatar: {
        type: 'image',
        folder: 'avatars',
        validateSquare: true,
        options: { width: 400, height: 400, format: 'webp', fit: 'cover' },
    },
    banner: {
        type: 'image',
        folder: 'banners',
        options: { width: 1500, height: 500, format: 'webp', fit: 'cover' },
    },
    post: {
        type: 'image',
        folder: 'posts',
        options: { width: 1200, format: 'webp' },
    },
    thumbnail: {
        type: 'image',
        folder: 'thumbnails',
        options: { width: 300, height: 300, blur: 5, format: 'jpeg' },
    },
};

export class MediaService {
    private static instance: MediaService | null = null;

    private constructor(
        private readonly processor: MediaProcessor,
        private readonly storage: StorageService,
        private readonly config: ConfigService,
        private readonly logger: LoggerService,
    ) {}

    static getInstance(
        processor: MediaProcessor,
        storage: StorageService,
        config: ConfigService,
        logger: LoggerService,
    ): MediaService {
        if (!MediaService.instance) {
            MediaService.instance = new MediaService(processor, storage, config, logger);
        }
        return MediaService.instance;
    }

    static resetInstance(): void {
        MediaService.instance = null;
    }

    /**
     * @param file The raw file from Hono body
     * @param profileKey One of 'avatar', 'banner', 'post'
     */
    async upload(file: File, profileKey: keyof typeof UPLOAD_PROFILES): Promise<string> {
        const profile = UPLOAD_PROFILES[profileKey];
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const isValid = await this.processor.validateType(buffer, profile.type);
        if (!isValid) throw new UnsupportedMediaTypeError(`File is not a valid ${profile.type}`);

        // Profile-specific logic
        if (profile.validateSquare) {
            const meta = await this.processor.getMetadata(buffer);
            if (meta.width !== meta.height) {
                // Allow small 5% margin for "near-square"
                const ratio = (meta.width || 1) / (meta.height || 1);
                if (Math.abs(1 - ratio) > 0.05) throw new MediaError('Image must be square');
            }
        }

        // Process according to profile
        const processed = await this.processor.processImage(buffer, profile.options);

        const relativePath = await this.storage.save(
            processed,
            profile.options.format || 'webp',
            profile.folder,
        );
        return this.resolveUrl(relativePath) as string;
    }

    /**
     * Converts a relative path (avatars/x.webp) to a full URL
     */
    resolveUrl(relativePath: string | null): string | null {
        if (!relativePath) return null;
        if (relativePath.startsWith('http')) return relativePath;

        const baseUrl = this.config.appUrl;
        // Ensure no double slashes
        const cleanBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
        return `${cleanBase}/uploads/${relativePath}`;
    }

    async remove(filename: string): Promise<void> {
        await this.storage.delete(filename);
    }

    async getStats() {
        return await this.storage.getStorageStats();
    }
}
