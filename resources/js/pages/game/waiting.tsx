import { useEchoPresence } from '@laravel/echo-react';
import { Head } from '@inertiajs/react';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';

export default function Waiting({
    guest,
}: {
    guest: { name: string; avatar: string } | null;
}) {
    useEchoPresence('arena');
    return (
        <>
            <Head title="Awaiting Orders" />
            <div className="cyber-grid relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background p-4 text-foreground">
                <div className="absolute top-1/4 -left-20 h-64 w-64 animate-pulse rounded-full bg-primary/10 blur-[100px]" />
                <div className="absolute -right-20 bottom-1/4 h-64 w-64 animate-pulse rounded-full bg-cyber-pink/10 blur-[100px] delay-700" />

                <Card className="glass relative z-10 w-full max-w-md border-white/10 shadow-2xl">
                    <CardHeader className="space-y-1 text-center">
                        <div className="relative mx-auto mb-6">
                            <img
                                src={`/${guest?.avatar || 'assets/avatar/default.svg'}`}
                                alt="Avatar"
                                className="h-24 w-24 rounded-3xl border-4 border-primary shadow-2xl shadow-primary/30"
                            />
                            <div className="absolute -right-2 -bottom-2 flex h-8 w-8 items-center justify-center rounded-xl bg-primary font-bold text-primary-foreground shadow-lg">
                                <span className="h-3 w-3 animate-ping rounded-full bg-white" />
                            </div>
                        </div>
                        <CardTitle className="text-4xl font-black tracking-tighter uppercase italic">
                            Welcome,{' '}
                            <span className="text-primary">{guest?.name || 'Admin'}</span>
                        </CardTitle>
                        <CardDescription className="text-lg font-medium tracking-widest text-muted-foreground/80 uppercase">
                            Stand by for mission start...
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center justify-center py-8">
                        <div className="mb-6 flex gap-3">
                            <div className="h-4 w-4 animate-bounce rounded-full bg-primary shadow-[0_0_10px_rgba(var(--color-primary),0.5)]" />
                            <div className="h-4 w-4 animate-bounce rounded-full bg-primary shadow-[0_0_10px_rgba(var(--color-primary),0.5)] [animation-delay:200ms]" />
                            <div className="h-4 w-4 animate-bounce rounded-full bg-primary shadow-[0_0_10px_rgba(var(--color-primary),0.5)] [animation-delay:400ms]" />
                        </div>
                        <p className="max-w-[200px] text-center text-xs leading-relaxed font-bold tracking-wider text-muted-foreground uppercase">
                            The Game Master is currently calibrating the Bingo
                            Card Matrix.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
