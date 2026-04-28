import { Head, router, useForm } from '@inertiajs/react';
import { useEcho, useEchoPresence, useEchoPublic } from '@laravel/echo-react';
import { Check, Timer } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
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
    cells: Cell[];
};

export default function Play({
    guest,
    card,
}: {
    guest: { name: string; avatar: string };
    card: Card;
}) {
    useEchoPresence('arena');
    const { data, setData, post, processing } = useForm({
        card_id: card.id,
        selected_cells: [] as number[],
    });

    useEcho('arena', 'LeaderboardUpdated', () => {
        console.log('reload');
        router.reload({ only: ['card'] });
    });

    useEcho('arena', 'BingoStateChanged', (e: any) => {
        console.log('BingoStateChanged', e);
        router.reload({ only: ['card'] });
    });

    const [timeLeft, setTimeLeft] = useState<number>(0);

    // Parse ends_at and calculate timer
    useEffect(() => {
        if (!card.ends_at || card.is_paused) {
            return;
        }

        const updateTimer = () => {
            const end = new Date(card.ends_at).getTime();
            const now = new Date().getTime();
            const diff = Math.max(0, Math.floor((end - now) / 1000));
            setTimeLeft(diff);

            if (diff === 0 && !processing) {
                // Auto submit when time runs out
                post(game.submit().url);
            }
        };

        updateTimer();
        const interval = setInterval(updateTimer, 1000);

        return () => clearInterval(interval);
    }, [card.ends_at, card.is_paused, processing, post]);

    const toggleCell = (cellId: number) => {
        // Find if this is the "FREE SPACE" (weight 0)
        const cell = card.cells.find((c) => c.id === cellId);

        if (cell?.risk_weight === 0) {
            return;
        } // Can't toggle free space manually

        setData(
            'selected_cells',
            data.selected_cells.includes(cellId)
                ? data.selected_cells.filter((id) => id !== cellId)
                : [...data.selected_cells, cellId],
        );
    };

    // Auto-select FREE SPACE
    useEffect(() => {
        const freeSpaces = card.cells
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
    }, [card.cells, data.selected_cells, setData]);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(game.submit().url);
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
            card.cells
                .filter((c) => c.row_index === i)
                .sort((a, b) => a.col_index - b.col_index),
        );
    }

    return (
        <>
            <Head title="Play Bingo" />
            <div className="cyber-grid relative flex min-h-screen flex-col items-center bg-background p-4 text-foreground sm:p-8">
                {!card.starts_at && (
                    <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-xl">
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
                {card.starts_at && card.is_paused && (
                    <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-md">
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
                {/* Header Section */}
                <div className="glass mb-6 flex w-full max-w-4xl items-center justify-between rounded-2xl border-white/10 p-4 shadow-xl">
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <img
                                src={`/${guest.avatar}`}
                                alt="Avatar"
                                className="h-14 w-14 rounded-2xl border-2 border-primary shadow-lg"
                            />
                            <Badge className="absolute -right-2 -bottom-2 border-none bg-primary font-bold text-primary-foreground">
                                LIVE
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
                            Time Left
                        </div>
                        <p
                            className={`font-mono text-4xl font-black tracking-tighter ${timeLeft <= 30 ? 'animate-pulse text-destructive' : 'text-primary'}`}
                        >
                            {formatTime(timeLeft)}
                        </p>
                    </div>
                </div>

                {/* Card Title Section */}
                <div className="mb-8 w-full max-w-4xl space-y-2 text-center">
                    <h1 className="text-4xl font-black tracking-tighter text-foreground uppercase italic drop-shadow-sm sm:text-6xl">
                        {card.title}
                    </h1>
                    <p className="text-lg font-medium text-muted-foreground">
                        {card.description}
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
                                        <span className="w-full text-[10px] leading-tight font-black tracking-tighter break-words wrap-break-word uppercase italic transition-transform group-hover:scale-105 sm:text-[13px]">
                                            {cell.label}
                                        </span>
                                    </button>
                                );
                            }),
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={processing}
                        className="group relative mb-12 overflow-hidden rounded-2xl bg-primary px-16 py-6 text-2xl font-black tracking-tighter text-primary-foreground uppercase italic shadow-2xl transition-all hover:scale-105 active:scale-95 disabled:grayscale"
                    >
                        <div className="absolute inset-0 translate-y-full bg-white/20 transition-transform duration-300 group-hover:translate-y-0" />
                        <span className="relative z-10">BINGO! (Submit)</span>
                    </button>
                </form>
            </div>
        </>
    );
}
