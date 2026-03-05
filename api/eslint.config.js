import tseslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import prettier from 'eslint-config-prettier';
import globals from 'globals';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default [
    {
        ignores: ['dist/**', 'node_modules/**', 'src/platform/database/client/**'],
    },

    {
        files: ['src/**/*.ts'],

        languageOptions: {
            parser: tsParser,

            parserOptions: {
                project: './tsconfig.json',
                tsconfigRootDir: __dirname,
                sourceType: 'module',
                ecmaVersion: 'latest',
            },

            globals: {
                ...globals.node,
            },
        },

        plugins: {
            '@typescript-eslint': tseslint,
        },

        rules: {
            'no-undef': 'off',

            '@typescript-eslint/no-unused-vars': [
                'warn',
                {
                    argsIgnorePattern: '^_',
                    varsIgnorePattern: '^_',
                },
            ],

            '@typescript-eslint/no-explicit-any': 'error',
        },
    },

    prettier,
];
