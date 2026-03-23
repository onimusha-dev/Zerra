import { cn } from '@/lib/utils';
import { INavItems } from '@/types/ui';
import { Link, Menu, X } from 'lucide-react';
import React from 'react';

export const MobileSideBar = ({ navItems }: { navItems: INavItems[] }) => {
    const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

    return (
        <>
            {/* MENU BUTTON */}
            <button
                onClick={() => setMobileMenuOpen(true)}
                className="z-45 sm:hidden rounded-full p-2 hover:bg-secondary-ui bg-background/80 backdrop-blur"
            >
                <Menu className="h-6 w-6" />
            </button>
            {/* OVERLAY */}
            {mobileMenuOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/50 sm:hidden w-full h-screen"
                    onClick={() => setMobileMenuOpen(false)}
                />
            )}

            {/* SIDEBAR */}
            <aside
                className={cn(
                    'fixed top-0 left-0 z-50 h-screen w-65 bg-background border-r p-4 transform transition-transform duration-300 sm:hidden flex flex-col',
                    mobileMenuOpen ? 'translate-x-0' : '-translate-x-full',
                )}
            >
                {/* HEADER */}
                <div className="flex items-center justify-between mb-6">
                    <span className="font-bold text-lg ml-3">Menu</span>
                    <button onClick={() => setMobileMenuOpen(false)}>
                        <X className="h-6 w-6" />
                    </button>
                </div>

                {/* NAV ITEMS (FIX: show ALL items) */}
                <nav className="flex flex-col gap-2">
                    {navItems.map((item) => (
                        <Link
                            key={item.label}
                            href={item.href}
                            onClick={() => setMobileMenuOpen(false)}
                            className="flex items-center gap-3 rounded-lg p-3 hover:bg-secondary-ui transition-colors"
                        >
                            <item.icon className="h-5 w-5" />
                            <span>{item.label}</span>
                        </Link>
                    ))}
                </nav>
            </aside>
        </>
    );
};
