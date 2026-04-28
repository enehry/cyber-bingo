import { Head } from '@inertiajs/react';
import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import { dashboard } from '@/routes';

export default function Dashboard() {
    return (
        <>
            <Head title="Command Center" />
            <div className="cyber-grid flex min-h-screen flex-col gap-10 p-6 text-foreground">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-5xl font-black tracking-tighter text-foreground uppercase italic">
                            Command <span className="text-primary">Center</span>
                        </h2>
                        <p className="text-lg font-medium text-muted-foreground">
                            Operation overview and system diagnostics.
                        </p>
                    </div>
                </div>

                <div className="grid auto-rows-min gap-6 md:grid-cols-3">
                    <Card className="glass aspect-video overflow-hidden border-white/10 shadow-xl">
                        <div className="relative flex h-full items-center justify-center">
                            <PlaceholderPattern className="absolute inset-0 size-full stroke-primary/10" />
                            <p className="z-10 text-xs font-black tracking-widest text-muted-foreground uppercase opacity-50">
                                Stats_Matrix_01
                            </p>
                        </div>
                    </Card>
                    <Card className="glass aspect-video overflow-hidden border-white/10 shadow-xl">
                        <div className="relative flex h-full items-center justify-center">
                            <PlaceholderPattern className="absolute inset-0 size-full stroke-primary/10" />
                            <p className="z-10 text-xs font-black tracking-widest text-muted-foreground uppercase opacity-50">
                                Activity_Log_02
                            </p>
                        </div>
                    </Card>
                    <Card className="glass aspect-video overflow-hidden border-white/10 shadow-xl">
                        <div className="relative flex h-full items-center justify-center">
                            <PlaceholderPattern className="absolute inset-0 size-full stroke-primary/10" />
                            <p className="z-10 text-xs font-black tracking-widest text-muted-foreground uppercase opacity-50">
                                Network_Status_03
                            </p>
                        </div>
                    </Card>
                </div>

                <Card className="glass relative min-h-[500px] flex-1 overflow-hidden border-white/10 shadow-2xl">
                    <div className="relative flex h-full items-center justify-center">
                        <PlaceholderPattern className="absolute inset-0 size-full stroke-primary/5" />
                        <div className="z-10 flex flex-col items-center gap-4">
                            <div className="h-2 w-48 overflow-hidden rounded-full bg-muted/50">
                                <div className="h-full w-1/3 animate-pulse bg-primary shadow-[0_0_10px_rgba(var(--color-primary),0.5)]" />
                            </div>
                            <p className="text-xs font-black tracking-widest text-muted-foreground uppercase opacity-50">
                                Awaiting Operational Data...
                            </p>
                        </div>
                    </div>
                </Card>
            </div>
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
    ],
};
