import { Application } from '@platform/Application';

const app = Application.getInstance();

(async function main() {
    await app.bootstrap();
})().catch((e: Error) => {
    console.log('Application initialisation failed: ', e);
    process.exit(1);
});
