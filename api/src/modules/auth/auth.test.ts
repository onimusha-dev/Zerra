import { registerSchema, loginSchema } from './auth.validator';

const testCases = {
    register: [
        {
            name: 'Valid Registration (Success)',
            payload: {
                name: 'John Doe',
                email: 'john@example.com',
                username: 'johndoe',
                password: 'password123',
                confirmPassword: 'password123',
            },
            expectSuccess: true,
        },
        {
            name: 'Registration Missing Username (Error)',
            payload: {
                name: 'John Doe',
                email: 'john@example.com',
                password: 'password123',
                confirmPassword: 'password123',
            },
            expectSuccess: false,
        },
        {
            name: 'Registration Empty Username (Error)',
            payload: {
                name: 'John Doe',
                email: 'john@example.com',
                username: '',
                password: 'password123',
                confirmPassword: 'password123',
            },
            expectSuccess: false,
        },
        {
            name: 'Registration Passwords Mismatch (Error)',
            payload: {
                name: 'John Doe',
                email: 'john@example.com',
                username: 'johndoe',
                password: 'password123',
                confirmPassword: 'password456',
            },
            expectSuccess: false,
        },
    ],
    login: [
        {
            name: 'Login with Email Only (Success)',
            payload: {
                email: 'john@example.com',
                password: 'password123',
            },
            expectSuccess: true,
        },
        {
            name: 'Login with Username Only (Success)',
            payload: {
                username: 'johndoe',
                password: 'password123',
            },
            expectSuccess: true,
        },
        {
            name: 'Login with Username + Empty Email (Success)',
            payload: {
                email: '',
                username: 'johndoe',
                password: 'password123',
            },
            expectSuccess: true,
        },
        {
            name: 'Login with Both Missing (Error)',
            payload: {
                password: 'password123',
            },
            expectSuccess: false,
        },
        {
            name: 'Login with Both Empty (Error)',
            payload: {
                email: '',
                username: '',
                password: 'password123',
            },
            expectSuccess: false,
        },
    ],
};

console.log('--- STARTING AUTH SCHEMA VALIDATION TESTS ---');

Object.entries(testCases).forEach(([schemaType, cases]) => {
    console.log(`\nTesting ${schemaType.toUpperCase()} Schema:`);
    const schema = schemaType === 'register' ? registerSchema : loginSchema;

    cases.forEach((tc) => {
        const result = schema.safeParse(tc.payload);
        if (result.success === tc.expectSuccess) {
            console.log(`✅ [PASS] ${tc.name}`);
            if (result.success) {
                // To check transformations like lowercase or converting '' to undefined
                // console.log(`   Transformed:`, result.data);
            }
        } else {
            console.log(`❌ [FAIL] ${tc.name}`);
            if (!result.success) {
                console.log(`   Errors:`, JSON.stringify(result.error.format(), null, 2));
            } else {
                console.log(`   Unexpectedly succeeded:`, result.data);
            }
        }
    });
});

console.log('\n--- TESTS COMPLETE ---');
