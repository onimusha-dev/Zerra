import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { Sidebar } from '@/components/Sidebar';
import { Providers } from '@/components/Providers';
import { MobileNav } from '@/components/layout/MobileNav';
import { cn } from '@/lib/utils';

export const metadata: Metadata = {
    title: 'Zerra | Core Transmission Node',
    description: 'Decentralized Signal Network',
};

const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' });
const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

// Run before React hydration to prevent flash of wrong theme
const themeScript = `
(function(){
  try {
    var m = localStorage.getItem('zerra-mode') || 'dark';
    if (m === 'dark') document.documentElement.classList.add('dark');
    var s = localStorage.getItem('zerra-scheme');
    if (s) {
      var schemes = {
        mono:    { p: '0.92 0 0', fg: '0.13 0 0' },
        violet:  { p: '0.65 0.22 285', fg: '0.98 0 0' },
        rose:    { p: '0.65 0.20 10',  fg: '0.98 0 0' },
        sky:     { p: '0.65 0.13 220', fg: '0.98 0 0' },
        emerald: { p: '0.60 0.15 150', fg: '0.98 0 0' },
        amber:   { p: '0.72 0.16 75',  fg: '0.13 0 0' },
      };
      var c = schemes[s];
      if (c) {
        document.documentElement.style.setProperty('--primary', 'oklch(' + c.p + ')');
        document.documentElement.style.setProperty('--primary-foreground', 'oklch(' + c.fg + ')');
      }
    }
  } catch(e) {}
})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en" suppressHydrationWarning>
            <head>
                {/* Theme init script — prevents flash of wrong theme */}
                <script dangerouslySetInnerHTML={{ __html: themeScript }} />
            </head>
            <body
                className={cn(
                    inter.variable,
                    jetbrainsMono.variable,
                    'font-sans bg-background text-foreground antialiased',
                )}
            >
                <Providers>
                    <div className="flex justify-center min-h-screen">
                        <div className="flex relative items-start w-full max-w-[1400px]">
                            <Sidebar />
                            <main className="flex-1 max-w-xl min-h-screen border-x border-border/8 bg-background">
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
