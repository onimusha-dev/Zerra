import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { Sidebar } from '@/components/Sidebar';
import { cn } from '@/lib/utils';
import { Providers } from '@/components/Providers';
import { MobileNav } from '@/components/layout/MobileNav';

export const metadata: Metadata = {
    title: 'Zerra | Core Transmission Node',
    description: 'Decentralized Signal Network',
};

const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' });
const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className="dark">
            <body
                className={cn(
                    inter.className,
                    'bg-background text-foreground antialiased selection:bg-primary/30 selection:text-primary',
                )}
            >
                <Providers>
                    <div className="flex justify-center min-h-screen">
                        <div className="flex w-full max-w-screen-2xl">
                            <aside className="shrink-0">
                                <Sidebar />
                            </aside>
                            <main className="flex-1 w-full min-w-0 max-w-6xl mx-auto border-x border-border/5">
                                {children}
                            </main>
                        </div>
                    </div>
                    <MobileNav />
                </Providers>
            </body>
        </html>
    );
}
