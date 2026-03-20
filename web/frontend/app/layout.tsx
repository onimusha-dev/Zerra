import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import QueryProvider from '@/components/providers/query-provider';
import ThemeProvider from '@/components/providers/theme-provider';
import { AuthProvider } from '@/components/providers/auth-provider';

const geistSans = Geist({
    variable: '--font-geist-sans',
    subsets: ['latin'],
});

const geistMono = Geist_Mono({
    variable: '--font-geist-mono',
    subsets: ['latin'],
});

export const metadata: Metadata = {
    title: 'Zerra | Premium Social Clone',
    description: 'Experience the next generation of social interaction with Zerra.',
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <meta
                name="viewport"
                content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no"
            ></meta>
            <body
                className={`${geistSans.variable} ${geistMono.variable} antialiased selection:bg-primary-ui selection:text-background select-none`}
            >
                <QueryProvider>
                    <ThemeProvider>
                        <AuthProvider>{children}</AuthProvider>
                    </ThemeProvider>
                </QueryProvider>
            </body>
        </html>
    );
}
