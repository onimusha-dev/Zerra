import sharp from 'sharp';
import sizeOf from 'image-size';
import { fileTypeFromBuffer } from 'file-type';
import { LoggerService } from '@platform/logger/logger.service';
import ffmpeg from 'fluent-ffmpeg';
import { MediaError } from '@shared/json/apiError';

export interface ImageOptions {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'webp' | 'jpeg' | 'png';
    blur?: number;
    fit?: keyof sharp.FitEnum;
}

/**
 * @module MediaProcessor
 * @description Advanced media processing module using sharp for images and ffmpeg for videos.
 */
export class MediaProcessor {
    private static instance: MediaProcessor | null = null;

    private constructor(private readonly logger: LoggerService) {}

    static getInstance(logger: LoggerService): MediaProcessor {
        if (!MediaProcessor.instance) {
            MediaProcessor.instance = new MediaProcessor(logger);
        }
        return MediaProcessor.instance;
    }
    static resetInstance(): void {
        MediaProcessor.instance = null;
    }

    async processImage(buffer: Buffer, options: ImageOptions = {}): Promise<Buffer> {
        try {
            const { width, height, quality = 80, format = 'webp', blur, fit = 'cover' } = options;

            let pipeline = sharp(buffer);

            if (width || height) {
                pipeline = pipeline.resize({
                    width,
                    height,
                    fit,
                    withoutEnlargement: true,
                });
            }

            if (blur) {
                pipeline = pipeline.blur(blur);
            }

            switch (format) {
                case 'jpeg':
                    pipeline = pipeline.jpeg({ quality });
                    break;
                case 'png':
                    pipeline = pipeline.png({ quality: quality > 90 ? 100 : 80 });
                    break;
                default:
                    pipeline = pipeline.webp({ quality });
            }

            return await pipeline.toBuffer();
        } catch (error) {
            this.logger.error('Universal Image Processing failed', error);
            throw new MediaError(
                'Image processing failed',
                error instanceof Error ? error.message : error,
            );
        }
    }

    async getMetadata(buffer: Buffer) {
        try {
            const meta = await sharp(buffer).metadata();
            return {
                width: meta.width,
                height: meta.height,
                format: meta.format,
                hasAlpha: meta.hasAlpha,
                space: meta.space,
            };
        } catch (error) {
            return sizeOf(buffer);
        }
    }

    async validateType(buffer: Buffer, expected: 'image' | 'video' | 'audio'): Promise<boolean> {
        const type = await fileTypeFromBuffer(buffer);
        if (!type) return false;
        return type.mime.startsWith(`${expected}/`);
    }

    async getExtension(buffer: Buffer): Promise<string | undefined> {
        const type = await fileTypeFromBuffer(buffer);
        return type?.ext;
    }

    async generateVideoThumbnail(inputPath: string, outputPath: string): Promise<void> {
        return new Promise((resolve, reject) => {
            ffmpeg(inputPath)
                .screenshots({
                    count: 1,
                    folder: outputPath,
                    size: '1280x720',
                    filename: 'thumbnail.jpg',
                })
                .on('end', () => resolve())
                .on('error', (err) => {
                    this.logger.error('Video thumbnail generation failed', err);
                    reject(new MediaError('Video processing failed', err.message));
                });
        });
    }
}
