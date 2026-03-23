import { LoggerService } from '@platform/logger/logger.service';
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { MediaError, InternalServerError } from '@shared/json/apiError';

import { IStorageProvider } from './storage-provider.interface';

/**
 * @module StorageService
 * @description Handles physical file operations on the disk.
 *
 * LEARNING POINT:
 * We use 'node:crypto' to generate random filenames.
 * Never use the user's original filename (e.g. "my_cat.jpg") because:
 * 1. Two users might upload "image.jpg" and overwrite each other.
 * 2. Original filenames can contain special characters that break things.
 */
export class StorageService implements IStorageProvider {
    private static instance: StorageService | null = null;
    private readonly uploadDir: string;

    private constructor(private readonly logger: LoggerService) {
        // We resolve the path to the 'uploads' folder in your root
        this.uploadDir = path.resolve(process.cwd(), 'uploads');
        this.init();
    }

    static getInstance(logger: LoggerService): StorageService {
        if (!StorageService.instance) {
            StorageService.instance = new StorageService(logger);
        }
        return StorageService.instance;
    }

    private async ensureDir(dirPath: string) {
        try {
            await fs.mkdir(dirPath, { recursive: true });
        } catch (error) {
            this.logger.error(`Failed to create directory: ${dirPath}`, error);
        }
    }

    private async init() {
        await this.ensureDir(this.uploadDir);
    }

    async save(buffer: Buffer, extension: string, folder: string = 'general'): Promise<string> {
        const targetDir = path.join(this.uploadDir, folder);
        await this.ensureDir(targetDir);

        const fileId = crypto.randomUUID();
        const filename = `${fileId}.${extension}`;
        const filePath = path.join(targetDir, filename);

        try {
            await fs.writeFile(filePath, buffer);
            const relativePath = path.join(folder, filename);
            this.logger.info(`File saved to ${folder}: ${filename}`);
            return relativePath; // Returning "folder/filename.ext" for DB storage
        } catch (error) {
            this.logger.error(`Failed to save file to ${folder}`, error);
            throw new InternalServerError('Failed to save file to storage');
        }
    }

    async delete(fileRelativePath: string): Promise<void> {
        const filePath = path.join(this.uploadDir, fileRelativePath);
        try {
            await fs.unlink(filePath);
            this.logger.info(`Deleted file: ${fileRelativePath}`);
        } catch (error) {
            this.logger.warn(`Could not delete file: ${fileRelativePath}. It might not exist.`);
        }
    }

    async getStorageStats() {
        try {
            const folders = await fs.readdir(this.uploadDir);
            const summary: Record<string, { count: number; lastFiles: string[] }> = {};

            for (const folder of folders) {
                const folderPath = path.join(this.uploadDir, folder);
                const stat = await fs.stat(folderPath);

                if (stat.isDirectory()) {
                    const files = await fs.readdir(folderPath);
                    summary[folder] = {
                        count: files.length,
                        lastFiles: files.slice(-5).reverse(), // Last 5 uploaded
                    };
                }
            }
            return summary;
        } catch (error) {
            return { error: 'Could not retrieve storage stats' };
        }
    }
}
