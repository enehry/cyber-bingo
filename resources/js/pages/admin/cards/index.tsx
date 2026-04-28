import { Head, Link, router } from '@inertiajs/react';
import { useEchoPublic } from '@laravel/echo-react';
import {
    Clock,
    Copy,
    Edit2,
    Grid,
    Pause,
    Play,
    Plus,
    RotateCcw,
    Trash2,
    Users,
} from 'lucide-react';
import { confirm } from '@/components/confirm';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { dashboard } from '@/routes';
import admin from '@/routes/admin';
import game from '@/routes/game';

type CardData = {
    id: number;
    title: string;
    description: string | null;
    is_active: boolean;
    is_paused: boolean;
    starts_at: string | null;
    time_limit_seconds: number;
    cells_count: number;
    submissions_count: number;
    created_at: string;
};

type Stats = {
    total_players: number;
    active_submissions: number;
};

export default function Index({
    cards,
    stats,
}: {
    cards: CardData[];
    stats: Stats;
}) {
    useEchoPublic('leaderboard', 'GuestJoined', () => {
        router.reload({ only: ['stats'] });
    });

    useEchoPublic('leaderboard', 'LeaderboardUpdated', () => {
        router.reload({ only: ['stats', 'cards'] });
    });

    useEchoPublic('leaderboard', 'BingoStateChanged', () => {
        router.reload();
    });

    const activate = async (cardId: number) => {
        if (
            await confirm({
                title: 'Deploy Arena',
                body: 'Are you sure you want to activate this card? It will deactivate all other cards and reset the game timer.',
                confirmText: 'Deploy Now',
                icon: 'warning',
            })
        ) {
            router.post(admin.cards.activate(cardId).url);
        }
    };

    const pause = (cardId: number) => {
        router.post(admin.cards.pause(cardId).url);
    };

    const resume = (cardId: number) => {
        router.post(admin.cards.resume(cardId).url);
    };

    const start = async (cardId: number) => {
        if (
            await confirm({
                title: 'Start Session',
                body: 'Are you sure you want to start the game timer? Players will be able to begin their submissions immediately.',
                confirmText: 'Start Game',
                icon: 'info',
            })
        ) {
            router.post(admin.cards.start(cardId).url);
        }
    };

    const destroy = async (cardId: number) => {
        if (
            await confirm({
                title: 'Delete Arena',
                body: 'Are you sure you want to delete this arena? This action cannot be undone.',
                confirmText: 'Delete Forever',
                icon: 'danger',
            })
        ) {
            router.delete(admin.cards.destroy(cardId).url);
        }
    };

    const duplicate = async (cardId: number) => {
        if (
            await confirm({
                title: 'Duplicate Arena',
                body: 'Are you sure you want to duplicate this arena? It will create a fresh copy with the same layout.',
                confirmText: 'Duplicate',
                icon: 'info',
            })
        ) {
            router.post(admin.cards.duplicate(cardId).url);
        }
    };

    const restart = async (cardId: number) => {
        if (
            await confirm({
                title: 'Restart Session',
                body: 'WARNING: This will reset the timer AND clear all current submissions for this session. Use this for a fresh game start.',
                confirmText: 'Restart Fresh',
                icon: 'danger',
            })
        ) {
            router.post(admin.cards.restart(cardId).url);
        }
    };

    return (
        <>
            <Head title="Bingo Cards" />
            <div className="cyber-grid mx-auto flex w-full max-w-7xl flex-1 flex-col gap-12 p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-5xl font-black tracking-tighter text-foreground uppercase italic">
                            Bingo Card{' '}
                            <span className="text-primary">Management</span>
                        </h2>
                        <p className="text-lg font-medium text-muted-foreground">
                            Configure and deploy bingo card sessions.
                        </p>
                    </div>

                    <div className="flex gap-4">
                        {/* Live Player Count */}
                        <div className="glass flex items-center gap-4 rounded-2xl border-white/10 p-4 px-6 shadow-xl">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/20 text-primary">
                                <Users className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-2xl leading-none font-black tracking-tighter text-foreground uppercase italic">
                                    {stats.total_players}
                                </p>
                                <p className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
                                    Active Operators
                                </p>
                            </div>
                        </div>

                        {/* Submission Monitor */}
                        <div className="glass flex min-w-[200px] flex-col justify-center rounded-2xl border-white/10 p-4 px-6 shadow-xl">
                            <div className="mb-2 flex items-center justify-between gap-4">
                                <p className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
                                    Submission Progress
                                </p>
                                <p className="font-mono text-xs font-bold text-primary">
                                    {stats.total_players > 0
                                        ? Math.round(
                                              (stats.active_submissions /
                                                  stats.total_players) *
                                                  100,
                                          )
                                        : 0}
                                    %
                                </p>
                            </div>
                            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                                <div
                                    className="h-full bg-primary transition-all duration-500"
                                    style={{
                                        width: `${
                                            stats.total_players > 0
                                                ? (stats.active_submissions /
                                                      stats.total_players) *
                                                  100
                                                : 0
                                        }%`,
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {cards.length === 0 ? (
                        <div className="glass col-span-full flex flex-col items-center justify-center rounded-3xl border-4 border-dashed border-border p-20 text-center">
                            <Grid className="mb-6 h-16 w-16 text-muted-foreground/30" />
                            <h3 className="text-2xl font-black tracking-tighter uppercase italic">
                                No Arenas Initialized
                            </h3>
                            <p className="mb-8 text-muted-foreground">
                                Create your first bingo card to start the game.
                            </p>
                            <Button
                                asChild
                                size="lg"
                                className="h-14 bg-primary px-8 text-xl font-black tracking-tighter uppercase italic shadow-lg"
                            >
                                <Link href={admin.cards.create().url}>
                                    <Plus className="mr-2 h-6 w-6" />
                                    Create Arena
                                </Link>
                            </Button>
                        </div>
                    ) : (
                        cards.map((card) => (
                            <Card
                                key={card.id}
                                className={`group relative overflow-hidden border-2 transition-all duration-300 hover:-translate-y-2 ${
                                    card.is_active
                                        ? 'border-primary bg-primary/5 shadow-2xl ring-4 shadow-primary/20 ring-primary/20'
                                        : 'glass border-white/10 hover:border-primary/50'
                                }`}
                            >
                                {card.is_active && (
                                    <div className="absolute top-0 right-0 flex gap-2 p-3">
                                        {card.is_paused ? (
                                            <Badge className="bg-amber-500 font-black text-white uppercase italic">
                                                PAUSED
                                            </Badge>
                                        ) : (
                                            <Badge className="animate-pulse bg-primary font-black text-primary-foreground uppercase italic">
                                                ACTIVE
                                            </Badge>
                                        )}
                                    </div>
                                )}
                                <CardHeader className="pb-2">
                                    <CardTitle className="line-clamp-1 text-2xl font-black tracking-tighter uppercase italic transition-colors group-hover:text-primary">
                                        {card.title}
                                    </CardTitle>
                                    <CardDescription className="line-clamp-2 font-medium">
                                        {card.description ||
                                            'No briefing provided.'}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="pb-4">
                                    <div className="flex items-center gap-6 text-sm font-bold tracking-widest text-muted-foreground uppercase">
                                        <div className="flex items-center gap-2">
                                            <Grid className="h-4 w-4 text-primary" />
                                            <span>
                                                {card.cells_count} Cells
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Clock className="h-4 w-4 text-primary" />
                                            <span>
                                                {card.time_limit_seconds}s
                                            </span>
                                        </div>
                                    </div>
                                </CardContent>
                                <CardFooter className="flex flex-col gap-3 border-t border-border/50 bg-muted/30 p-4 pt-4">
                                    <div className="flex w-full gap-3">
                                        {card.is_active ? (
                                            !card.starts_at ? (
                                                <Button
                                                    size="sm"
                                                    onClick={() =>
                                                        start(card.id)
                                                    }
                                                    className="w-full bg-green-600 font-black tracking-tighter text-white uppercase italic shadow-md hover:bg-green-700"
                                                >
                                                    <Play className="mr-2 h-4 w-4" />
                                                    Start Session
                                                </Button>
                                            ) : card.is_paused ? (
                                                <Button
                                                    size="sm"
                                                    onClick={() =>
                                                        resume(card.id)
                                                    }
                                                    className="w-full bg-amber-500 font-black tracking-tighter text-white uppercase italic shadow-md hover:bg-amber-600"
                                                >
                                                    <Play className="mr-2 h-4 w-4" />
                                                    Resume
                                                </Button>
                                            ) : (
                                                <>
                                                    <Button
                                                        size="sm"
                                                        onClick={() =>
                                                            pause(card.id)
                                                        }
                                                        className="w-full bg-zinc-700 font-black tracking-tighter text-white uppercase italic shadow-md hover:bg-zinc-800"
                                                    >
                                                        <Pause className="mr-2 h-4 w-4" />
                                                        Pause
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() =>
                                                            restart(card.id)
                                                        }
                                                        className="border-destructive/50 text-destructive hover:bg-destructive hover:text-destructive-foreground"
                                                    >
                                                        <RotateCcw className="mr-2 h-4 w-4" />
                                                        Restart
                                                    </Button>
                                                </>
                                            )
                                        ) : (
                                            <Button
                                                size="sm"
                                                onClick={() =>
                                                    activate(card.id)
                                                }
                                                className="w-full bg-primary font-black tracking-tighter uppercase italic shadow-md"
                                            >
                                                <Play className="mr-2 h-4 w-4" />
                                                Deploy
                                            </Button>
                                        )}
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            asChild
                                            className="w-full border-2 font-black tracking-tighter uppercase italic"
                                        >
                                            <Link
                                                href={
                                                    admin.cards.edit(card.id)
                                                        .url
                                                }
                                            >
                                                <Edit2 className="mr-2 h-4 w-4" />
                                                Edit
                                            </Link>
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => destroy(card.id)}
                                            className="border-2 border-destructive/20 text-destructive hover:bg-destructive hover:text-destructive-foreground"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => duplicate(card.id)}
                                            className="border-2 border-primary/20 text-primary hover:bg-primary hover:text-primary-foreground"
                                            title="Duplicate"
                                        >
                                            <Copy className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    <Button
                                        size="sm"
                                        variant="secondary"
                                        asChild
                                        className="w-full font-black tracking-tighter uppercase italic"
                                    >
                                        <Link href={game.play().url}>
                                            Preview Arena
                                        </Link>
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))
                    )}
                </div>
            </div>

            {/* Floating Action Button */}
            <Link
                href={admin.cards.create().url}
                className="fixed right-8 bottom-8 z-50 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-2xl transition-transform hover:scale-110 active:scale-95"
                title="Create New Bingo Card"
            >
                <Plus className="h-8 w-8" />
            </Link>
        </>
    );
}

Index.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard().url,
        },
    ],
};
