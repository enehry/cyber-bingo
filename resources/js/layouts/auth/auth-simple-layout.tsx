import { Link } from '@inertiajs/react';
import AppLogoIcon from '@/components/app-logo-icon';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';

export default function AuthSimpleLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    return (
        <div className="cyber-grid relative flex min-h-svh flex-col items-center justify-center bg-background p-6 md:p-10">
            <div className="relative w-full max-w-md">
                {/* Decorative glowing background */}
                <div className="absolute -inset-4 rounded-4xl bg-linear-to-tr from-primary/20 via-transparent to-cyber-pink/20 blur-2xl" />
                
                <div className="relative flex flex-col gap-8 rounded-4xl border border-border/50 bg-card/80 p-8 shadow-2xl backdrop-blur-xl md:p-12">
                    <div className="flex flex-col items-center gap-6">
                        <Link
                            href={home()}
                            className="group flex flex-col items-center gap-2 font-medium transition-transform hover:scale-105"
                        >
                            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 shadow-[0_0_20px_rgba(var(--primary),0.2)] transition-shadow group-hover:shadow-[0_0_30px_rgba(var(--primary),0.4)]">
                                <AppLogoIcon className="size-10 fill-current text-primary" />
                            </div>
                            <span className="sr-only">{title}</span>
                        </Link>

                        <div className="space-y-2 text-center">
                            <h1 className="text-3xl font-black tracking-tight text-foreground uppercase italic">
                                {title}
                            </h1>
                            <p className="text-sm font-medium text-muted-foreground/80">
                                {description}
                            </p>
                        </div>
                    </div>
                    
                    <div className="grid gap-6">
                        {children}
                    </div>
                </div>
            </div>

            {/* Footer decoration */}
            <div className="mt-8 text-center text-xs font-bold tracking-widest text-muted-foreground/40 uppercase">
                &copy; {new Date().getFullYear()} Cyber Bingo &bull; System Auth
            </div>
        </div>
    );
}
