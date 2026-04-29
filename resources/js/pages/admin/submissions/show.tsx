import { Head, Link } from '@inertiajs/react';
import { ChevronLeft, Trophy, Clock, Check } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import admin from '@/routes/admin';

type Cell = {
    id: number;
    row_index: number;
    col_index: number;
    label: string;
    description: string | null;
    risk_weight: number;
};

type Submission = {
    id: number;
    guest: {
        name: string;
        avatar: string;
    };
    card: {
        id: number;
        title: string;
        description: string;
        cells: Cell[];
    };
    selected_cells_json: {
        ids: number[];
        history: Record<string, number>;
    };
    guilty_count: number;
    weighted_score: string;
    submitted_at_seconds: number;
    created_at: string;
};

export default function Show({ submission }: { submission: Submission }) {
    const selectedCells = submission.selected_cells_json?.ids || [];
    
    
    // Group cells by row
    const gridRows = [];

    for (let i = 0; i < 5; i++) {
        gridRows.push(
            submission.card.cells
                .filter((c) => c.row_index === i)
                .sort((a, b) => a.col_index - b.col_index)
        );
    }

    return (
        <>
            <Head title={`Submission - ${submission.guest.name}`} />
            <div className="cyber-grid flex min-h-screen flex-col items-center bg-background p-4 text-foreground sm:p-8">
                <div className="w-full max-w-5xl">
                    {/* Header */}
                    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <Link
                                href={admin.leaderboard.index().url}
                                className="mb-2 inline-flex items-center gap-2 text-sm font-bold text-muted-foreground transition-colors hover:text-primary"
                            >
                                <ChevronLeft className="h-4 w-4" />
                                Back to Leaderboard
                            </Link>
                            <h1 className="text-4xl font-black tracking-tighter uppercase italic">
                                Player <span className="text-primary">Submission</span>
                            </h1>
                        </div>

                        <div className="flex items-center gap-4">
                             <div className="glass flex items-center gap-4 rounded-2xl border-white/10 p-4 px-6 shadow-xl">
                                <Avatar className="h-12 w-12 border-2 border-primary">
                                    <AvatarImage src={`/${submission.guest.avatar}`} />
                                    <AvatarFallback>{submission.guest.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="text-xl font-black tracking-tighter uppercase italic">
                                        {submission.guest.name}
                                    </p>
                                    <p className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
                                        Submission View
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Stats Bar */}
                    <div className="grid grid-cols-1 gap-4 mb-8 sm:grid-cols-4">
                        <Card className="glass border-white/10 shadow-lg">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-xs font-bold tracking-widest text-muted-foreground uppercase flex items-center gap-2">
                                    <Trophy className="h-3 w-3 text-primary" />
                                    Final Score
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-3xl font-black tracking-tighter text-primary uppercase italic">
                                    {submission.weighted_score} GS
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="glass border-white/10 shadow-lg">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-xs font-bold tracking-widest text-muted-foreground uppercase flex items-center gap-2">
                                    <Check className="h-3 w-3 text-primary" />
                                    Guilty
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-3xl font-black tracking-tighter text-foreground uppercase italic">
                                    {submission.guilty_count}
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="glass border-white/10 shadow-lg">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-xs font-bold tracking-widest text-muted-foreground uppercase flex items-center gap-2">
                                    <Clock className="h-3 w-3 text-primary" />
                                    Finish Time
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-3xl font-black tracking-tighter text-foreground uppercase italic">
                                    {Math.floor(submission.submitted_at_seconds / 60)}:
                                    {(submission.submitted_at_seconds % 60).toString().padStart(2, '0')}
                                </p>
                                <p className="text-[10px] font-bold text-muted-foreground uppercase mt-1">
                                    At {new Date(submission.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="glass border-white/10 shadow-lg">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-xs font-bold tracking-widest text-muted-foreground uppercase flex items-center gap-2">
                                    <Trophy className="h-3 w-3 text-primary" />
                                    Answer Time
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-3xl font-black tracking-tighter text-primary uppercase italic">
                                    {(() => {
                                        const times = Object.values(submission.selected_cells_json?.history || {});

                                        if (times.length < 1) {
return "0s";
}
                                        
                                        const start = Math.min(...times);
                                        const end = Math.max(...times);
                                        const duration = Math.round(end - start);

                                        return `${duration}s`;
                                    })()}
                                </p>
                                <p className="text-[10px] font-bold text-muted-foreground uppercase mt-1">
                                    Action Duration
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Bingo Card View */}
                    <div className="flex flex-col items-center">
                        <div className="mb-8 w-full max-w-4xl space-y-2 text-center">
                            <h2 className="text-3xl font-black tracking-tighter text-foreground uppercase italic drop-shadow-sm">
                                {submission.card.title}
                            </h2>
                            <p className="text-muted-foreground font-medium">
                                RECONSTRUCTED BOARD
                            </p>
                        </div>

                        <div className="mb-10 grid w-full max-w-4xl grid-cols-5 gap-2 sm:gap-4 lg:gap-6">
                            {gridRows.map((row) =>
                                row.map((cell) => {
                                    const isSelected = selectedCells.includes(cell.id);
                                    const isFree = cell.risk_weight === 0;

                                    return (
                                        <div
                                            key={cell.id}
                                            className={`relative flex aspect-square items-center justify-center rounded-2xl border-2 border-b-4 p-2 text-center transition-all sm:p-4 ${
                                                isSelected
                                                    ? 'scale-105 border-black bg-primary/20 shadow-lg shadow-primary/20'
                                                    : 'border-border bg-card/30 opacity-40 grayscale-[0.5]'
                                            } ${isFree ? 'scale-105 border-cyber-pink bg-cyber-pink/10 font-black text-cyber-pink ring-4 ring-cyber-pink/20' : ''}`}
                                        >
                                            {isSelected && !isFree && (
                                                <div className="absolute -top-2 -right-2 rounded-full bg-primary p-1 shadow-lg">
                                                    <Check className="h-3 w-3 stroke-[4px] text-primary-foreground" />
                                                </div>
                                            )}
                                            <span className="w-full text-[10px] leading-tight font-black tracking-tighter wrap-break-word uppercase italic sm:text-[13px]">
                                                {cell.label}
                                            </span>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
