import { Link, usePage } from '@inertiajs/react';
import { useConnectionStatus, useEchoPresence } from '@laravel/echo-react';
import { Trophy, Sun, Moon, Gamepad2 } from 'lucide-react';
import { useState } from 'react';
import { GuestProfileModal } from '@/components/guest-profile-modal';
import { ToastListener } from '@/components/toast-listener';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Toaster } from '@/components/ui/sonner';
import { useAppearance } from '@/hooks/use-appearance';
import { cn } from '@/lib/utils';
import game from '@/routes/game';
import type { SharedData } from '@/types';

export default function GuestLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { guest } = usePage<SharedData>().props;
    const currentUrl = usePage().url;
    const { appearance, updateAppearance } = useAppearance();
    const status = useConnectionStatus();
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

    // Persist presence across all guest pages
    useEchoPresence('arena');

    const toggleAppearance = () => {
        updateAppearance(appearance === 'dark' ? 'light' : 'dark');
    };

    return (
        <div className="relative flex min-h-screen flex-col bg-background">
            {/* Main Content Area */}
            <main
                className={cn(
                    'w-full flex-1 overflow-x-hidden',
                    guest ? 'pb-24 lg:pb-0 lg:pl-24' : 'pb-0',
                )}
            >
                {children}
            </main>

            {/* Floating Navigation Dock for Guest */}
            {guest && (
                <nav className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 flex-row items-center gap-1.5 rounded-full border border-white/50 bg-white/40 p-1.5 shadow-2xl backdrop-blur-2xl lg:top-1/2 lg:right-auto lg:bottom-auto lg:left-6 lg:translate-x-0 lg:-translate-y-1/2 lg:flex-col lg:gap-3 lg:p-2 dark:bg-black/20">
                    <div className="absolute inset-0 rounded-full bg-linear-to-b from-white/10 to-transparent pointer-events-none" />                    {/* Play Game Link */}
                    <Link
                        href={game.play().url}
                        className={cn(
                            'flex items-center justify-center rounded-full p-2.5 transition-all',
                            currentUrl === '/play'
                                ? 'scale-105 bg-primary text-primary-foreground shadow-md'
                                : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                        )}
                        title="Enter Arena"
                    >
                        <Gamepad2 className="h-5 w-5" />
                    </Link>

                    {/* Leaderboard Link */}
                    <Link
                        href={game.leaderboard().url}
                        className={cn(
                            'flex items-center justify-center rounded-full p-2.5 transition-all',
                            currentUrl.includes('/leaderboard')
                                ? 'scale-105 bg-primary text-primary-foreground shadow-md'
                                : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                        )}
                        title="Live Leaderboard"
                    >
                        <Trophy className="h-5 w-5" />
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

                    {/* Guest Avatar (Click to edit) */}
                    <button 
                        onClick={() => setIsProfileModalOpen(true)}
                        className="relative flex items-center justify-center rounded-full p-0.5 ring-primary/30 ring-2 ring-offset-2 ring-offset-background transition-transform hover:scale-110 active:scale-95"
                    >
                        <Avatar className="h-8 w-8 lg:h-9 lg:w-9">
                            <AvatarImage
                                src={`/${guest.avatar}`}
                                alt={guest.name}
                            />
                            <AvatarFallback className="bg-primary/10 font-bold text-primary">
                                {guest.name.charAt(0)}
                            </AvatarFallback>
                        </Avatar>
                        <span className={cn(
                            "absolute bottom-1.5 right-1 animate-pulse size-2.5 rounded-full",
                            status === 'connected' ? 'bg-green-500' : 
                            status === 'connecting' ? 'bg-yellow-500' : 
                            status === 'reconnecting' ? 'bg-orange-500' : 
                            status === 'failed' ? 'bg-red-500' : 'bg-gray-500'
                        )} />
                    </button>

                    <GuestProfileModal 
                        isOpen={isProfileModalOpen} 
                        onClose={() => setIsProfileModalOpen(false)} 
                    />
                </nav>
            )}
            <Toaster />
            <ToastListener />
        </div>
    );
}
