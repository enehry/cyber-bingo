import { Link, usePage } from '@inertiajs/react';
import { Trophy, Sun, Moon, Gamepad2 } from 'lucide-react';
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
                <nav className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 flex-row items-center gap-1.5 rounded-full border border-border bg-background/60 p-1.5 shadow-2xl backdrop-blur-md lg:top-1/2 lg:right-auto lg:bottom-auto lg:left-6 lg:translate-x-0 lg:-translate-y-1/2 lg:flex-col lg:gap-3 lg:p-2">
                    {/* Play Game Link */}
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

                    {/* Guest Avatar (Visual Only) */}
                    <div className="flex items-center justify-center rounded-full p-0.5 ring-primary/30 ring-2 ring-offset-2 ring-offset-background">
                        <Avatar className="h-8 w-8 lg:h-9 lg:w-9">
                            <AvatarImage
                                src={`/${guest.avatar}`}
                                alt={guest.name}
                            />
                            <AvatarFallback className="bg-primary/10 font-bold text-primary">
                                {guest.name.charAt(0)}
                            </AvatarFallback>
                        </Avatar>
                    </div>
                </nav>
            )}
            <Toaster />
            <ToastListener />
        </div>
    );
}
