import { Head, router, useForm } from '@inertiajs/react';
import { useEchoPresence } from '@laravel/echo-react';
import { Check, Timer, Trophy } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { cn } from '@/lib/utils';
import game from '@/routes/game';

type Cell = {
    id: number;
    row_index: number;
    col_index: number;
    label: string;
    description: string | null;
    risk_weight: number;
};

type Card = {
    id: number;
    title: string;
    description: string;
    time_limit_seconds: number;
    starts_at: string | null;
    ends_at: string | null;
    is_paused: boolean;
    paused_at: string | null;
    cells: Cell[];
};

export default function Play({
    guest,
    card,
    isPreview = false,
    hasSubmitted = false,
}: {
    guest: { name: string; avatar: string };
    card: Card;
    isPreview?: boolean;
    hasSubmitted?: boolean;
}) {

    const { data, setData, post, processing } = useForm({
        card_id: card.id,
        selected_cells: [] as number[],
        click_history: {} as Record<number, number>,
    });

    const [localCard, setLocalCard] = useState(card);

    // Adjust state when props change (Official React pattern for syncing state with props)
    if (card !== localCard && card.id === localCard.id) {
        setLocalCard(card);
    }

    // useEchoPresence('arena', 'LeaderboardUpdated', () => {
    //     console.log('reload');
    //     router.reload({ only: ['card'] });
    // });

    useEchoPresence('arena', 'BingoStateChanged', (e: any) => {
        console.log('BingoStateChanged', e);

        if (e.card) {
            setLocalCard(e.card);
        }

        router.reload({ only: ['card'] });
    });

    const calculateTimeLeft = useCallback(() => {
        if (!localCard.ends_at) {
            return 0;
        }

        const end = new Date(localCard.ends_at).getTime();

        // If paused, we freeze the timer at the paused_at moment
        if (localCard.is_paused === true && localCard.paused_at) {
            const pausedAt = new Date(localCard.paused_at).getTime();

            return Math.max(0, Math.floor((end - pausedAt) / 1000));
        }

        // Otherwise, it's relative to current time
        const now = Date.now();

        return Math.max(0, Math.floor((end - now) / 1000));
    }, [localCard.ends_at, localCard.is_paused, localCard.paused_at]);

    const [timeLeft, setTimeLeft] = useState<number>(calculateTimeLeft);

    // Sync timeLeft when localCard changes during render
    const [prevLocalCardForTimer, setPrevLocalCardForTimer] =
        useState(localCard);

    if (localCard !== prevLocalCardForTimer) {
        setPrevLocalCardForTimer(localCard);
        const newInitial = calculateTimeLeft();

        if (timeLeft !== newInitial) {
            setTimeLeft(newInitial);
        }
    }

    // Timer logic that handles pause/resume correctly
    useEffect(() => {
        if (!localCard.ends_at || localCard.is_paused === true) {
            return;
        }

        const interval = setInterval(() => {
            const remaining = calculateTimeLeft();

            setTimeLeft(remaining);

            if (remaining <= 0 && !processing && !isPreview) {
                post(game.submit().url);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [
        localCard.ends_at,
        localCard.is_paused,
        processing,
        post,
        calculateTimeLeft,
        isPreview,
    ]);

    const toggleCell = useCallback(
        (cellId: number) => {
            // Find if this is the "FREE SPACE" (weight 0)
            const cell = localCard.cells.find((c) => c.id === cellId);

            if (cell?.risk_weight === 0) {
                return;
            } // Can't toggle free space manually

            const isSelected = data.selected_cells.includes(cellId);
            const newSelected = isSelected
                ? data.selected_cells.filter((id) => id !== cellId)
                : [...data.selected_cells, cellId];

            const newHistory = { ...data.click_history };

            if (!isSelected) {
                const now = Date.now();
                const start = localCard.starts_at
                    ? new Date(localCard.starts_at).getTime()
                    : now;
                const elapsed = Math.max(0, (now - start) / 1000);
                newHistory[cellId] = parseFloat(elapsed.toFixed(2));
            } else {
                delete newHistory[cellId];
            }

            setData((prev) => ({
                ...prev,
                selected_cells: newSelected,
                click_history: newHistory,
            }));
        },
        [
            localCard.cells,
            localCard.starts_at,
            data.selected_cells,
            data.click_history,
            setData,
        ],
    );

    // Auto-select FREE SPACE
    useEffect(() => {
        const freeSpaces = localCard.cells
            .filter((c) => c.risk_weight === 0)
            .map((c) => c.id);

        if (freeSpaces.length > 0) {
            const missingFreeSpaces = freeSpaces.filter(
                (id) => !data.selected_cells.includes(id),
            );

            if (missingFreeSpaces.length > 0) {
                setData('selected_cells', [
                    ...data.selected_cells,
                    ...missingFreeSpaces,
                ]);
            }
        }
    }, [localCard.cells, data.selected_cells, setData]);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        const now = Date.now();
        const start = localCard.starts_at ? new Date(localCard.starts_at).getTime() : now;
        const elapsed = Math.max(0, Math.floor((now - start) / 1000));

        router.post(game.submit().url, {
            ...data,
            submitted_at: elapsed,
        });
    };

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;

        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    // Group cells by row
    const gridRows = [];

    for (let i = 0; i < 5; i++) {
        gridRows.push(
            localCard.cells
                .filter((c) => c.row_index === i)
                .sort((a, b) => a.col_index - b.col_index),
        );
    }

    return (
        <>
            <Head title="Play Bingo" />
            <div className="cyber-grid relative flex min-h-screen flex-col items-center bg-background p-4 text-foreground sm:p-8">
                {/* Preview Banner */}
                {isPreview && (
                    <div className="fixed top-0 left-0 z-100 flex w-full items-center justify-center bg-primary p-2 text-center text-[10px] font-black tracking-[0.3em] text-primary-foreground uppercase italic shadow-2xl">
                        <span className="animate-pulse">
                            PREVIEW MODE — SUBMISSIONS DISABLED
                        </span>
                    </div>
                )}

                {/* Game Ended Overlay */}
                {((localCard.ends_at !== null && timeLeft === 0) || hasSubmitted) && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-background/80 backdrop-blur-md p-4">
                        <Card className="glass w-full max-w-lg border-primary shadow-2xl shadow-primary/20 animate-in zoom-in-95 duration-500">
                            <CardHeader className="text-center space-y-2">
                                <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary/20 ring-4 ring-primary/10">
                                    <Trophy className="h-10 w-10 text-primary" />
                                </div>
                                <CardTitle className="text-6xl font-black tracking-tighter text-foreground uppercase italic">
                                    {hasSubmitted ? 'BINGO!' : 'TIME UP!'}
                                </CardTitle>
                                <CardDescription className="text-xl font-bold text-muted-foreground uppercase">
                                    {hasSubmitted 
                                        ? "Your entry has been submitted successfully." 
                                        : "The arena session has officially ended."}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="flex flex-col items-center gap-6 py-10">
                                <Button 
                                    size="lg"
                                    onClick={() => router.get(game.leaderboard().url)}
                                    className="w-full h-16 text-xl font-black tracking-widest uppercase italic bg-primary text-primary-foreground hover:scale-105 transition-transform"
                                >
                                    View Leaderboard
                                </Button>
                                <p className="text-[10px] font-black tracking-[0.3em] text-muted-foreground uppercase opacity-50">
                                    Cyber Bingo Arena v1.0
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                )}
                {!localCard.starts_at && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-xl">
                        <Card className="glass w-full max-w-md border-primary/50 shadow-2xl shadow-primary/20">
                            <CardHeader className="text-center">
                                <CardTitle className="text-5xl font-black tracking-tighter text-primary uppercase italic">
                                    STAND BY
                                </CardTitle>
                                <CardDescription className="text-xl font-bold text-muted-foreground uppercase">
                                    Waiting for Game Master to Start
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="flex flex-col items-center gap-6 py-10">
                                <div className="flex gap-4">
                                    <div className="h-16 w-4 animate-bounce bg-primary" />
                                    <div className="h-16 w-4 animate-bounce bg-primary [animation-delay:200ms]" />
                                    <div className="h-16 w-4 animate-bounce bg-primary [animation-delay:400ms]" />
                                </div>
                                <p className="text-sm font-bold tracking-widest text-muted-foreground uppercase animate-pulse">
                                    Arena Initialized: Prepare for engagement
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                )}
                {localCard.starts_at && localCard.is_paused && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-md">
                        <Card className="glass w-full max-w-sm border-amber-500/50 shadow-2xl shadow-amber-500/20">
                            <CardHeader className="text-center">
                                <CardTitle className="text-4xl font-black tracking-tighter text-amber-500 uppercase italic">
                                    PAUSED
                                </CardTitle>
                                <CardDescription className="text-lg font-bold text-muted-foreground uppercase">
                                    Session suspended
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="flex justify-center py-6">
                                <div className="flex gap-4">
                                    <div className="h-12 w-3 animate-pulse bg-amber-500" />
                                    <div className="h-12 w-3 animate-pulse bg-amber-500 [animation-delay:200ms]" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}
                {localCard.ends_at && timeLeft === 0 && !localCard.is_paused && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-xl">
                        <Card className="glass w-full max-w-md border-destructive/50 shadow-2xl shadow-destructive/20">
                            <CardHeader className="text-center">
                                <CardTitle className="text-5xl font-black tracking-tighter text-destructive uppercase italic">
                                    SESSION ENDED
                                </CardTitle>
                                <CardDescription className="text-xl font-bold text-muted-foreground uppercase">
                                    The arena is closed.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="flex flex-col items-center gap-6 py-10">
                                <p className="text-center text-sm font-bold tracking-widest text-muted-foreground uppercase">
                                    Time has expired for this session. You can no longer submit your entries.
                                </p>
                                <button
                                    onClick={() => router.get(game.leaderboard().url)}
                                    className="group relative overflow-hidden rounded-xl bg-foreground px-8 py-4 text-lg font-black tracking-tighter text-background uppercase italic shadow-lg transition-all hover:scale-105 active:scale-95"
                                >
                                    View Leaderboard
                                </button>
                            </CardContent>
                        </Card>
                    </div>
                )}
                {/* Header Section */}
                <div className="glass mb-6 flex w-full max-w-4xl items-center justify-between rounded-2xl border-white/10 p-4 shadow-xl">
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <img
                                src={`/${guest.avatar}`}
                                alt="Avatar"
                                className="h-14 w-14 rounded-2xl border-2 border-primary shadow-lg"
                            />
                            <Badge className={cn(
                                "absolute -right-2 -bottom-2 border-none font-bold text-primary-foreground",
                                isPreview ? "bg-amber-500" : "bg-primary"
                            )}>
                                {isPreview ? 'ADMIN' : 'LIVE'}
                            </Badge>
                        </div>
                        <div>
                            <p className="text-xl font-black tracking-tighter uppercase italic">
                                {guest.name}
                            </p>
                            <p className="flex items-center gap-1 text-xs font-bold tracking-widest text-primary uppercase">
                                <span className="h-2 w-2 animate-ping rounded-full bg-primary" />
                                {data.selected_cells.length} Active
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col items-end">
                        <div className="mb-1 flex items-center gap-1.5 text-xs font-bold tracking-widest text-muted-foreground uppercase">
                            <Timer className="h-3 w-3" />
                            {localCard.is_paused ? 'Session Paused' : 'Time Left'}
                        </div>
                        <p
                            className={`font-mono text-4xl font-black tracking-tighter ${timeLeft <= 30 && !localCard.is_paused ? 'animate-pulse text-destructive' : 'text-primary'}`}
                        >
                            {localCard.is_paused ? 'PAUSED' : formatTime(timeLeft)}
                        </p>
                    </div>
                </div>
                {/* Check if at least one non-free cell is selected */}
                {(() => {
                    const nonFreeSelectedCount = data.selected_cells.filter((id) => {
                        const cell = localCard.cells.find((c) => c.id === id);

                        return cell && cell.risk_weight > 0;
                    }).length;

                    return (
                        <div className="hidden" data-non-free-count={nonFreeSelectedCount} />
                    );
                })()}

                {/* Card Title Section */}
                <div className="mb-8 w-full max-w-4xl space-y-2 text-center">
                    <h1 className="text-4xl font-black tracking-tighter text-foreground uppercase italic drop-shadow-sm sm:text-6xl">
                        {localCard.title}
                    </h1>
                    <p className="text-lg font-medium text-muted-foreground">
                        {localCard.description}
                    </p>
                </div>

                <form
                    onSubmit={submit}
                    className="flex w-full max-w-4xl flex-col items-center"
                >
                    <div className="mb-10 grid w-full grid-cols-5 gap-2 sm:gap-4 lg:gap-6">
                        {gridRows.map((row) =>
                            row.map((cell) => {
                                const isSelected = data.selected_cells.includes(
                                    cell.id,
                                );
                                const isFree = cell.risk_weight === 0;

                                return (
                                    <button
                                        key={cell.id}
                                        type="button"
                                        onClick={() => toggleCell(cell.id)}
                                        className={`group relative flex aspect-square items-center justify-center rounded-2xl border-2 border-b-4 p-2 text-center transition-all active:translate-y-[2px] active:border-b-0 sm:p-4 ${
                                            isSelected
                                                ? 'scale-105 border-black bg-primary/20 shadow-lg shadow-primary/20'
                                                : 'border-border bg-card/50 hover:-translate-y-1 hover:border-primary/50 hover:bg-muted/50'
                                        } ${isFree ? 'scale-105 animate-pulse border-cyber-pink bg-cyber-pink/10 font-black text-cyber-pink ring-4 ring-cyber-pink/20' : ''}`}
                                    >
                                        {isSelected && !isFree && (
                                            <div className="absolute -top-2 -right-2 animate-in rounded-full bg-primary p-1 shadow-lg duration-300 zoom-in">
                                                <Check className="h-3 w-3 stroke-[4px] text-primary-foreground" />
                                            </div>
                                        )}
                                        <span className="w-full text-[10px] leading-tight font-black tracking-tighter wrap-break-word uppercase italic transition-transform group-hover:scale-105 sm:text-[13px]">
                                            {cell.label}
                                        </span>
                                    </button>
                                );
                            }),
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={
                            isPreview ||
                            processing ||
                            (localCard.ends_at !== null && timeLeft === 0) ||
                            data.selected_cells.filter((id) => {
                                const cell = localCard.cells.find(
                                    (c) => c.id === id,
                                );

                                return cell && cell.risk_weight > 0;
                            }).length === 0
                        }
                        className={cn(
                            "group relative mb-8 overflow-hidden rounded-2xl px-16 py-6 text-2xl font-black tracking-tighter uppercase italic shadow-2xl transition-all active:scale-95 disabled:scale-100 disabled:grayscale disabled:opacity-50",
                            isPreview 
                                ? "bg-muted text-muted-foreground" 
                                : "bg-primary text-primary-foreground hover:scale-105"
                        )}
                    >
                        <div className="absolute inset-0 translate-y-full bg-white/20 transition-transform duration-300 group-hover:translate-y-0" />
                        <span className="relative z-10">
                            {isPreview ? 'PREVIEW MODE' : 'BINGO! (Submit)'}
                        </span>
                    </button>

                    {localCard.ends_at !== null && timeLeft === 0 && (
                        <button
                            type="button"
                            onClick={() => router.get(game.leaderboard().url)}
                            className="text-sm font-black tracking-widest text-primary uppercase italic underline hover:text-primary/80"
                        >
                            View Results
                        </button>
                    )}
                </form>
            </div>
        </>
    );
}
