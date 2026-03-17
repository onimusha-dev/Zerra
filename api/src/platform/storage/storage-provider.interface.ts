export interface IStorageProvider {
    /**
     * Saves a file buffer to the storage.
     * @param buffer The file content as a Buffer
     * @param extension The file extension (e.g., 'webp', 'mp4')
     * @param folder The target folder (e.g., 'avatars', 'posts')
     * @returns The relative path or full URL to the saved file
     */
    save(buffer: Buffer, extension: string, folder: string): Promise<string>;

    /**
     * Deletes a file from the storage.
     * @param fileIdentifier The relative path or full URL of the file to delete
     */
    delete(fileIdentifier: string): Promise<void>;

    /**
     * (Optional) Returns statistics about the storage usage.
     */
    getStorageStats?(): Promise<Record<string, any>>;
}
