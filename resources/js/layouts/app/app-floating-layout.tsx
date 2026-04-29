import { Link, usePage } from '@inertiajs/react';
import { useEchoPresence } from '@laravel/echo-react';
import { Trophy, LayoutGrid, Sun, Moon } from 'lucide-react';
import { ToastListener } from '@/components/toast-listener';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Toaster } from '@/components/ui/sonner';
import { UserMenuContent } from '@/components/user-menu-content';
import { useAppearance } from '@/hooks/use-appearance';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import admin from '@/routes/admin';
import type { SharedData } from '@/types';

export default function AppFloatingLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { auth } = usePage<SharedData>().props;
    const currentUrl = usePage().url;
    const isMobile = useIsMobile();
    const { appearance, updateAppearance } = useAppearance();

    // Persist admin presence in the arena
    useEchoPresence('arena');

    const toggleAppearance = () => {
        updateAppearance(appearance === 'dark' ? 'light' : 'dark');
    };

    return (
        <div className="relative flex min-h-screen flex-col bg-background">
            {/* Main Content Area */}
            <main
                className={cn(
                    'w-full flex-1 overflow-x-hidden transition-all duration-500',
                    auth?.user ? 'pb-24 lg:pb-0 lg:pl-28' : 'pb-0',
                )}
            >
                {children}
            </main>

            {/* Floating Navigation Dock */}
            {/* Mobile: Bottom Center | Desktop: Left Center */}
            {auth?.user && (
                <nav className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 flex-row items-center gap-1 rounded-full border border-white/30 bg-white/60 p-1.5 shadow-[0_0_50px_-12px_rgba(var(--primary),0.3)] backdrop-blur-2xl lg:top-1/2 lg:right-auto lg:bottom-auto lg:left-8 lg:translate-x-0 lg:-translate-y-1/2 lg:flex-col lg:gap-4 lg:p-2.5 dark:bg-black/20">
                    <div className="absolute inset-0 rounded-full bg-linear-to-b from-white/10 to-transparent pointer-events-none" />
                    {/* Leaderboard Link */}
                    <Link
                        href={admin.leaderboard.index().url}
                        className={cn(
                            'flex items-center justify-center rounded-full p-2.5 transition-all',
                            currentUrl.includes('/admin/leaderboard')
                                ? 'scale-105 bg-primary text-primary-foreground shadow-md'
                                : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                        )}
                        title="Live Leaderboard"
                    >
                        <Trophy className="h-5 w-5" />
                    </Link>

                    {/* Dashboard / Cards Link */}
                    <Link
                        href={admin.cards.index().url}
                        className={cn(
                            'flex items-center justify-center rounded-full p-2.5 transition-all',
                            currentUrl.includes('/admin/cards')
                                ? 'scale-105 bg-primary text-primary-foreground shadow-md'
                                : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                        )}
                        title="Manage Cards"
                    >
                        <LayoutGrid className="h-5 w-5" />
                    </Link>

                    {/* Theme Toggle */}
                    <button
                        onClick={toggleAppearance}
                        className="flex items-center justify-center rounded-full p-2.5 text-muted-foreground transition-all hover:bg-muted hover:text-foreground"
                        title={`Switch to ${appearance === 'dark' ? 'light' : 'dark'} mode`}
                    >
                        {appearance === 'dark' ? (
                            <Sun className="h-5 w-5" />
                        ) : (
                            <Moon className="h-5 w-5" />
                        )}
                    </button>

                    {/* Profile / Settings Dropdown */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className="overflow-hidden rounded-full p-0.5 ring-primary/50 transition-all outline-none hover:scale-105 hover:ring-2">
                                <Avatar className="h-8 w-8 cursor-pointer border border-border lg:h-9 lg:w-9">
                                    <AvatarImage
                                        src={auth.user.avatar}
                                        alt={auth.user.name}
                                    />
                                    <AvatarFallback className="bg-primary/10 font-bold text-primary">
                                        {auth.user.name.charAt(0)}
                                    </AvatarFallback>
                                </Avatar>
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            align={isMobile ? 'end' : 'center'}
                            className="mb-2 w-56 lg:mb-0 lg:ml-2"
                            side={isMobile ? 'top' : 'right'}
                            sideOffset={15}
                        >
                            <UserMenuContent user={auth.user} />
                        </DropdownMenuContent>
                    </DropdownMenu>
                </nav>
            )}
            <Toaster />
            <ToastListener />
        </div>
    );
}
