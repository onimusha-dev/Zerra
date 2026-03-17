import { SupabaseStorageService } from '../src/platform/storage/supabase.storage.service';
import { ConfigService } from '../src/platform/config/config.service';
import { LoggerService } from '../src/platform/logger/logger.service';
import 'dotenv/config';

async function testSupabaseStorage() {
    const config = ConfigService.getInstance();
    const logger = LoggerService.getInstance(config);

    console.log('--- Supabase Storage Test ---');
    console.log('Project Ref:', config.supabase_project_ref);
    console.log('Bucket:', config.supabase_bucket);
    console.log('Region:', config.supabase_region);

    const storage = SupabaseStorageService.getInstance(config, logger);

    const testBuffer = Buffer.from('Hello Supabase Storage! Test file content.');
    const extension = 'txt';
    const folder = 'tests';

    try {
        console.log('\nUploading test file...');
        const url = await storage.save(testBuffer, extension, folder);
        console.log('✅ Upload Success!');
        console.log('Resulting URL:', url);

        console.log('\nStarting Cleanup (Deleting test file)...');
        await storage.delete(url);
        console.log('✅ Delete Success!');

        console.log('\n--- TEST PASSED ---');
    } catch (error) {
        console.error('\n❌ TEST FAILED');
        if (error instanceof Error) {
            console.error('Error Message:', error.message);
            console.error('Stack Trace:', error.stack);
        } else {
            console.error('Unknown Error:', error);
        }
        console.log('\nTIP: Make sure your bucket "zerra-media" exists and is Public in Supabase.');
    }
}

testSupabaseStorage();
