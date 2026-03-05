import { defineConfig } from 'tsdown';

export default defineConfig({
    entry: ['src/main.ts'],
    outDir: 'dist',
    format: 'cjs',
    target: 'es2022',
    minify: false,
    sourcemap: true,
    clean: true,
});
