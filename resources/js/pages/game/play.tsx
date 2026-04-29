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

type Interpretation = {
    min_score: number;
    max_score: number;
    label: string;
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
    score_interpretations: Interpretation[] | null;
};

export default function Play({
    guest,
    card,
    isPreview = false,
    hasSubmitted = false,
    score = null,
}: {
    guest: { name: string; avatar: string };
    card: Card;
    isPreview?: boolean;
    hasSubmitted?: boolean;
    score?: number | null;
}) {

    const getInterpretation = (currentScore: number | null) => {
        if (currentScore === null || !card.score_interpretations) {
            return null;
        }

        return card.score_interpretations.find(
            (i) => currentScore >= i.min_score && currentScore <= i.max_score
        );
    };

    const interpretation = getInterpretation(score);

    const { data, setData, post, processing } = useForm({
        card_id: card.id,
        selected_cells: [] as number[],
        click_history: {} as Record<number, number>,
    });

    const [localCard, setLocalCard] = useState(card);

    // Adjust state when props change
    if (card !== localCard && card.id === localCard.id) {
        setLocalCard(card);
    }

    useEchoPresence('arena', 'BingoStateChanged', (e: any) => {
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

        if (localCard.is_paused === true && localCard.paused_at) {
            const pausedAt = new Date(localCard.paused_at).getTime();

            return Math.max(0, Math.floor((end - pausedAt) / 1000));
        }

        const now = Date.now();

        return Math.max(0, Math.floor((end - now) / 1000));
    }, [localCard.ends_at, localCard.is_paused, localCard.paused_at]);

    const [timeLeft, setTimeLeft] = useState<number>(calculateTimeLeft);
    const [prevLocalCardForTimer, setPrevLocalCardForTimer] = useState(localCard);

    if (localCard !== prevLocalCardForTimer) {
        setPrevLocalCardForTimer(localCard);
        const newInitial = calculateTimeLeft();

        if (timeLeft !== newInitial) {
            setTimeLeft(newInitial);
        }
    }

    useEffect(() => {
        if (!localCard.ends_at || localCard.is_paused === true) {
            return;
        }

        const interval = setInterval(() => {
            const remaining = calculateTimeLeft();
            setTimeLeft(remaining);

            if (remaining <= 0 && !processing && !isPreview && !hasSubmitted) {
                post(game.submit().url);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [localCard.ends_at, localCard.is_paused, processing, post, calculateTimeLeft, isPreview, hasSubmitted]);

    const toggleCell = useCallback(
        (cellId: number) => {
            const cell = localCard.cells.find((c) => c.id === cellId);

            if (cell?.risk_weight === 0) {
                return;
            }

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
        [localCard.cells, localCard.starts_at, data.selected_cells, data.click_history, setData],
    );

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

    const gridRows = [];

    for (let i = 0; i < 5; i++) {
        gridRows.push(
            localCard.cells
                .filter((c) => c.row_index === i)
                .sort((a, b) => a.col_index - b.col_index),
        );
    }

    const showOverlay = (localCard.ends_at !== null && timeLeft === 0) || hasSubmitted;

    const getInterpretationStyle = (currentScore: number | null) => {
        if (currentScore === null) {
            return 'text-primary border-primary/20 bg-primary/5';
        }

        if (currentScore <= 5) {
            return 'text-emerald-400 border-emerald-400/20 bg-emerald-400/10 shadow-[0_0_20px_rgba(52,211,153,0.2)]';
        }

        if (currentScore <= 10) {
            return 'text-blue-400 border-blue-400/20 bg-blue-400/10 shadow-[0_0_20px_rgba(96,165,250,0.2)]';
        }

        if (currentScore <= 15) {
            return 'text-amber-400 border-amber-400/20 bg-amber-400/10 shadow-[0_0_20px_rgba(251,191,36,0.2)]';
        }

        if (currentScore <= 20) {
            return 'text-orange-500 border-orange-500/20 bg-orange-500/10 shadow-[0_0_20px_rgba(249,115,22,0.2)]';
        }

        return 'text-destructive border-destructive/20 bg-destructive/10 shadow-[0_0_20px_rgba(239,68,68,0.2)]';
    };

    return (
        <>
            <Head title="Play Bingo" />
            <div className="cyber-grid relative flex min-h-screen flex-col items-center bg-background p-4 text-foreground sm:p-8">
                {isPreview && (
                    <div className="fixed top-0 left-0 z-100 flex w-full items-center justify-center bg-primary p-2 text-center text-[10px] font-black tracking-[0.3em] text-primary-foreground uppercase italic shadow-2xl">
                        <span className="animate-pulse">
                            PREVIEW MODE — SUBMISSIONS DISABLED
                        </span>
                    </div>
                )}

                {showOverlay && (
                    <div className="fixed inset-0 z-60 flex items-center justify-center bg-background/80 backdrop-blur-md p-4">
                        <Card className="glass w-full max-w-lg border-primary/50 shadow-2xl shadow-primary/20 animate-in zoom-in-95 duration-500 overflow-hidden">
                            <div className="absolute inset-0 bg-linear-to-b from-primary/5 to-transparent pointer-events-none" />
                            <CardHeader className="relative text-center space-y-4 pt-12">
                                <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-2xl bg-primary/10 ring-2 ring-primary/20 rotate-12 transition-transform hover:rotate-0 duration-500">
                                    <Trophy className="h-12 w-12 text-primary drop-shadow-[0_0_10px_rgba(var(--color-primary),0.5)]" />
                                </div>
                                <div className="space-y-1">
                                    <CardTitle className="text-7xl font-black tracking-tighter text-foreground uppercase italic leading-none">
                                        {hasSubmitted ? 'BINGO!' : 'TIME UP!'}
                                    </CardTitle>
                                    <p className="text-sm font-black tracking-[0.4em] text-primary uppercase opacity-50">Session Finalized</p>
                                </div>
                            </CardHeader>
                            <CardContent className="relative flex flex-col items-center gap-8 py-8">
                                {interpretation ? (
                                    <div className={cn(
                                        "w-full rounded-2xl border-2 p-6 text-center transition-all duration-1000 animate-in fade-in slide-in-from-bottom-4",
                                        getInterpretationStyle(score)
                                    )}>
                                        <span className="mb-2 block text-xs font-black tracking-[0.3em] uppercase opacity-70">Digital Audit Results</span>
                                        <div className="text-lg font-black leading-snug uppercase italic tracking-tight">
                                            {interpretation.label}
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-center font-bold text-muted-foreground uppercase italic">
                                        {hasSubmitted 
                                            ? "Your entry has been processed by the arena." 
                                            : "The session has concluded. Analyzing results..."}
                                    </p>
                                )}

                                <div className="w-full space-y-4">
                                    <Button 
                                        size="lg"
                                        onClick={() => router.get(game.leaderboard().url)}
                                        className="w-full h-20 text-2xl font-black tracking-tighter uppercase italic bg-primary text-primary-foreground hover:scale-[1.02] transition-all"
                                    >
                                        View Hall of Fame
                                    </Button>
                                    
                                    <div className="flex justify-between items-center px-2">
                                        <p className="text-[10px] font-black tracking-[0.3em] text-muted-foreground uppercase opacity-50">
                                            Cyber Bingo Arena v1.0
                                        </p>
                                        <div className="h-px flex-1 mx-4 bg-border/50" />
                                        <Badge variant="outline" className="text-[10px] border-primary/20 text-primary/70">
                                            {score !== null ? Number(score).toFixed(2) : '0.00'} GS
                                        </Badge>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {!localCard.starts_at && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-xl">
                        <Card className="glass w-full max-md border-primary/50 shadow-2xl shadow-primary/20">
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

                <div className="glass mb-6 flex w-full max-w-4xl items-center justify-between rounded-2xl border-white/10 p-4 shadow-xl">
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <img src={`/${guest.avatar}`} alt="Avatar" className="h-14 w-14 rounded-2xl border-2 border-primary shadow-lg" />
                            <Badge className={cn("absolute -right-2 -bottom-2 border-none font-bold text-primary-foreground", isPreview ? "bg-amber-500" : "bg-primary")}>
                                {isPreview ? 'ADMIN' : 'LIVE'}
                            </Badge>
                        </div>
                        <div>
                            <p className="text-xl font-black tracking-tighter uppercase italic">{guest.name}</p>
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
                        <p className={`font-mono text-4xl font-black tracking-tighter ${timeLeft <= 30 && !localCard.is_paused ? 'animate-pulse text-destructive' : 'text-primary'}`}>
                            {localCard.is_paused ? 'PAUSED' : formatTime(timeLeft)}
                        </p>
                    </div>
                </div>

                <div className="mb-8 w-full max-w-4xl space-y-2 text-center">
                    <h1 className="text-4xl font-black tracking-tighter text-foreground uppercase italic drop-shadow-sm sm:text-6xl">{localCard.title}</h1>
                    <p className="text-lg font-medium text-muted-foreground">{localCard.description}</p>
                </div>

                <form onSubmit={submit} className="flex w-full max-w-4xl flex-col items-center">
                    <div className="mb-10 grid w-full grid-cols-5 auto-rows-fr gap-2 sm:gap-4 lg:gap-6">
                        {gridRows.map((row) => row.map((cell) => {
                            const isSelected = data.selected_cells.includes(cell.id);
                            const isFree = cell.risk_weight === 0;

                            return (
                                <button key={cell.id} type="button" onClick={() => toggleCell(cell.id)}
                                    className={`group relative flex h-full w-full items-center justify-center rounded-2xl border-2 border-b-4 p-1 text-center transition-all active:translate-y-[2px] active:border-b-0 sm:p-6 ${isSelected ? 'scale-105 border-black bg-primary/20 shadow-lg shadow-primary/20' : 'border-border bg-card/50 hover:-translate-y-1 hover:border-primary/50 hover:bg-muted/50'} ${isFree ? 'scale-105 animate-pulse border-cyber-pink bg-cyber-pink/10 font-black text-cyber-pink ring-4 ring-cyber-pink/20' : ''}`}>
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
                        }))}
                    </div>

                    <button type="submit" disabled={isPreview || processing || (localCard.ends_at !== null && timeLeft === 0) || data.selected_cells.filter(id => (localCard.cells.find(c => c.id === id)?.risk_weight ?? 0) > 0).length === 0}
                        className={cn("group relative mb-8 overflow-hidden rounded-2xl px-16 py-6 text-2xl font-black tracking-tighter uppercase italic shadow-2xl transition-all active:scale-95 disabled:scale-100 disabled:grayscale disabled:opacity-50", isPreview ? "bg-muted text-muted-foreground" : "bg-primary text-primary-foreground hover:scale-105")}>
                        <div className="absolute inset-0 translate-y-full bg-white/20 transition-transform duration-300 group-hover:translate-y-0" />
                        <span className="relative z-10">{isPreview ? 'PREVIEW MODE' : 'BINGO! (Submit)'}</span>
                    </button>

                    {localCard.ends_at !== null && timeLeft === 0 && (
                        <button type="button" onClick={() => router.get(game.leaderboard().url)} className="text-sm font-black tracking-widest text-primary uppercase italic underline hover:text-primary/80">
                            View Results
                        </button>
                    )}
                </form>
            </div>
        </>
    );
}
