import { LoggerService } from '@platform/logger/logger.service';
import crypto from 'node:crypto';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { InternalServerError } from '@shared/json/apiError';

import { ConfigService } from '@platform/config';
import { IStorageProvider } from './storage-provider.interface';

export class R2StorageService implements IStorageProvider {
    private static instance: R2StorageService | null = null;
    private readonly client: S3Client;
    private readonly bucket: string;
    private readonly publicUrl: string;

    private constructor(
        private readonly config: ConfigService,
        private readonly logger: LoggerService,
    ) {
        this.bucket = config.r2_bucket_name!;
        this.publicUrl = config.r2_public_url || '';

        this.client = new S3Client({
            region: 'auto',
            endpoint: `https://${config.r2_account_id}.r2.cloudflarestorage.com`,
            credentials: {
                accessKeyId: config.r2_access_key_id!,
                secretAccessKey: config.r2_secret_access_key!,
            },
        });
    }

    static getInstance(config: ConfigService, logger: LoggerService): R2StorageService {
        if (!R2StorageService.instance) {
            R2StorageService.instance = new R2StorageService(config, logger);
        }
        return R2StorageService.instance;
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

            this.logger.info(`File uploaded to R2: ${key}`);

            return `${this.publicUrl}/${key}`;
        } catch (error) {
            this.logger.error('Failed to upload file to R2', error);
            throw new InternalServerError('Failed to upload file');
        }
    }

    async delete(fileUrl: string): Promise<void> {
        try {
            const key = fileUrl.replace(`${this.publicUrl}/`, '');

            await this.client.send(
                new DeleteObjectCommand({
                    Bucket: this.bucket,
                    Key: key,
                }),
            );

            this.logger.info(`Deleted file from R2: ${key}`);
        } catch (error) {
            this.logger.warn(`Failed to delete file: ${fileUrl}`);
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
