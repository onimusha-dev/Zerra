import { LoggerService } from '@platform/logger/logger.service';
import crypto from 'node:crypto';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { InternalServerError } from '@shared/json/apiError';

export class R2StorageService {
    private static instance: R2StorageService | null = null;
    private readonly client: S3Client;
    private readonly bucket: string;
    private readonly publicUrl: string;

    private constructor(private readonly logger: LoggerService) {
        this.bucket = process.env.R2_BUCKET_NAME!;
        this.publicUrl = process.env.R2_PUBLIC_URL!;

        this.client = new S3Client({
            region: 'auto',
            endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
            credentials: {
                accessKeyId: process.env.R2_ACCESS_KEY_ID!,
                secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
            },
        });
    }

    static getInstance(logger: LoggerService): R2StorageService {
        if (!R2StorageService.instance) {
            R2StorageService.instance = new R2StorageService(logger);
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
        };
        return map[ext.toLowerCase()] || 'application/octet-stream';
    }
}
