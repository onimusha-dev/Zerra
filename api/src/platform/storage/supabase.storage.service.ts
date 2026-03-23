import { LoggerService } from '@platform/logger/logger.service';
import crypto from 'node:crypto';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { InternalServerError } from '@shared/json/apiError';
import { ConfigService } from '@platform/config';
import { IStorageProvider } from './storage-provider.interface';

/**
 * @module SupabaseStorageService
 * @description S3-compatible storage service for Supabase.
 * No Credit Card required for the 1GB free tier!
 */
export class SupabaseStorageService implements IStorageProvider {
    private static instance: SupabaseStorageService | null = null;
    private readonly client: S3Client;
    private readonly bucket: string;
    private readonly projectRef: string;

    private constructor(
        private readonly config: ConfigService,
        private readonly logger: LoggerService,
    ) {
        this.projectRef = config.supabase_project_ref!;
        this.bucket = config.supabase_bucket!;

        this.client = new S3Client({
            region: config.supabase_region,
            endpoint: `https://${this.projectRef}.storage.supabase.co/storage/v1/s3`,
            credentials: {
                accessKeyId: config.supabase_access_key_id!,
                secretAccessKey: config.supabase_secret_access_key!,
            },
            forcePathStyle: true, // Supabase requires this
        });
    }

    static getInstance(config: ConfigService, logger: LoggerService): SupabaseStorageService {
        if (!SupabaseStorageService.instance) {
            SupabaseStorageService.instance = new SupabaseStorageService(config, logger);
        }
        return SupabaseStorageService.instance;
    }

    async save(buffer: Buffer, extension: string, folder: string = 'general'): Promise<string> {
        const fileId = crypto.randomUUID();
        const key = `${folder}/${fileId}.${extension}`;

        try {
            await this.client.send(
                new PutObjectCommand({
                    Bucket: this.bucket,
                    Key: key,
                    Body: buffer,
                    ContentType: this.getMimeType(extension),
                }),
            );

            this.logger.info(`File uploaded to Supabase Storage: ${key}`);

            // Construct Public URL
            return `https://${this.projectRef}.supabase.co/storage/v1/object/public/${this.bucket}/${key}`;
        } catch (error) {
            this.logger.error('Failed to upload file to Supabase Storage', error);
            throw new InternalServerError('Failed to upload file to remote storage');
        }
    }

    async delete(fileUrl: string): Promise<void> {
        try {
            // Extract key from URL
            const prefix = `https://${this.projectRef}.supabase.co/storage/v1/object/public/${this.bucket}/`;
            const key = fileUrl.replace(prefix, '');

            await this.client.send(
                new DeleteObjectCommand({
                    Bucket: this.bucket,
                    Key: key,
                }),
            );

            this.logger.info(`Deleted file from Supabase: ${key}`);
        } catch (error) {
            this.logger.warn(`Failed to delete file from Supabase: ${fileUrl}`);
        }
    }

    private getMimeType(ext: string): string {
        const map: Record<string, string> = {
            jpg: 'image/jpeg',
            jpeg: 'image/jpeg',
            png: 'image/png',
            webp: 'image/webp',
            gif: 'image/gif',
            mp4: 'video/mp4',
            webm: 'video/webm',
            mov: 'video/quicktime',
        };
        return map[ext.toLowerCase()] || 'application/octet-stream';
    }
}
