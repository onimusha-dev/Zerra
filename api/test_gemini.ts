import { ConfigService } from './src/platform/config/config.service';
import { LoggerService } from './src/platform/logger/logger.service';
import { GeminiService } from './src/platform/ai/gemini.service';
import { configDotenv } from 'dotenv';
configDotenv();

async function main() {
    console.log('Starting test...');
    const config = ConfigService.getInstance();
    const logger = LoggerService.getInstance(config);
    const gemini = GeminiService.getInstance(logger, config);
    try {
        const response = await gemini.chat('Say hello!');
        console.log('Response:', response);
    } catch (e) {
        console.error('Error:', e);
    }
}

main();
