import { Head, Link, router } from '@inertiajs/react';
import { useEchoPresence } from '@laravel/echo-react';
import { ChevronLeft, RefreshCcw, Trophy } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import admin from '@/routes/admin';

type Submission = {
    id: number;
    guest: {
        id: number;
        name: string;
        avatar: string;
    };
    guilty_count: number | null;
    weighted_score: number | null;
    submitted_at_seconds: number | null;
    is_submitted: boolean;
    created_at: string | null;
};

export default function Index({
    card,
    submissions,
}: {
    card: any;
    submissions: Submission[];
}) {
    const [onlineUsers, setOnlineUsers] = useState<any[]>([]);

    const { channel } = useEchoPresence(
        'arena',
        ['LeaderboardUpdated', 'GuestJoined', 'BingoStateChanged'],
        () => {
            router.reload({ only: ['submissions', 'card'] });
        },
    ) as any;

    useEffect(() => {
        channel()
            .here((users: any[]) => {
                setOnlineUsers(users);
            })
            .joining((user: any) => {
                setOnlineUsers((prev) => {
                    if (prev.find((u) => String(u.id) === String(user.id))) {
                        return prev;
                    }

                    return [...prev, user];
                });
            })
            .leaving((user: any) => {
                setOnlineUsers((prev) =>
                    prev.filter((u) => String(u.id) !== String(user.id)),
                );
            });
    }, [channel]);

    const refresh = () => {
        router.reload({ only: ['submissions', 'card'] });
    };

    const isPaused = card?.is_paused;
    const submittedSubmissions = submissions.filter((s) => s.is_submitted);

    return (
        <>
            <Head title="Admin Leaderboard" />
            <div className="cyber-grid flex min-h-screen flex-col items-center bg-background p-4 text-foreground sm:p-8">
                {/* Back Button & Actions */}
                <div className="mb-6 flex w-full max-w-4xl items-center justify-between">
                    <Link
                        href={admin.cards.index().url}
                        className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground transition-colors hover:text-primary"
                    >
                        <ChevronLeft className="h-4 w-4" />
                        Back to Management
                    </Link>

                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={refresh}
                        className="h-9 border border-primary/20 bg-primary/5 font-black tracking-tighter text-primary uppercase italic hover:bg-primary/10"
                    >
                        <RefreshCcw className="mr-2 h-4 w-4" />
                        Sync Data
                    </Button>
                </div>

                {/* Header Card */}
                <div className="glass relative mb-12 flex w-full max-w-4xl items-center justify-between overflow-hidden rounded-2xl border-white/10 p-6 shadow-xl">
                    <div className="absolute top-4 -right-2 translate-x-4 -translate-y-2 rotate-45 bg-primary p-1 px-8 text-[10px] font-black tracking-widest text-primary-foreground uppercase">
                        ADMIN
                    </div>

                    <div className="flex items-center gap-4">
                        <Trophy className="h-12 w-12 text-primary drop-shadow-[0_0_10px_rgba(var(--color-primary),0.5)]" />
                        <div>
                            <h2 className="text-4xl font-black tracking-tighter text-foreground uppercase italic">
                                Live{' '}
                                <span className="text-primary">
                                    Leaderboard
                                </span>
                            </h2>
                            <div className="flex items-center gap-3">
                                <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">
                                    {card?.title || 'No Active Session'}
                                </p>
                                {isPaused && (
                                    <Badge className="bg-amber-500 font-black text-white uppercase italic">
                                        PAUSED
                                    </Badge>
                                )}
                                <div className="flex items-center gap-1.5 rounded-full border border-green-500/30 bg-green-500/10 px-2 py-0.5">
                                    <span className="relative flex h-2 w-2">
                                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
                                        <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500"></span>
                                    </span>
                                    <span className="text-[10px] font-black tracking-tighter text-green-500 uppercase">
                                        {onlineUsers.filter((u: any) => !u.is_admin).length} Online
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Podium Section (Top 3) */}
                {submittedSubmissions.length > 0 && (
                    <div className="mb-12 flex w-full max-w-4xl flex-col items-center justify-center gap-8 sm:flex-row sm:items-end sm:gap-16">
                        {/* Silver - Rank 2 */}
                        {submittedSubmissions[1] && (
                            <div className="order-2 flex flex-col items-center sm:order-1 sm:mt-8">
                                <Link 
                                    href={admin.submissions.show(submittedSubmissions[1].id).url}
                                    className="relative mb-4 transition-transform hover:scale-105 active:scale-95 block"
                                >
                                    <img
                                        src={`/${submittedSubmissions[1].guest.avatar}`}
                                        className={cn(
                                            "h-20 w-20 shrink-0 rounded-2xl border-4 border-zinc-400 object-cover shadow-xl transition-all duration-500",
                                            !onlineUsers.some((u: any) => String(u.id) === String(submittedSubmissions[1].guest.id)) && "grayscale opacity-60"
                                        )}
                                    />
                                    <span className={cn(
                                        "absolute -right-1 -top-1 h-4 w-4 rounded-full border-2 border-background transition-colors duration-500",
                                        onlineUsers.some((u: any) => String(u.id) === String(submittedSubmissions[1].guest.id))
                                            ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" 
                                            : "bg-zinc-600"
                                    )} />
                                    <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-zinc-400 px-3 py-1 text-sm font-black text-zinc-900">
                                        2nd
                                    </div>
                                </Link>
                                <Link 
                                    href={admin.submissions.show(submittedSubmissions[1].id).url}
                                    className="line-clamp-1 text-center font-black tracking-tighter uppercase hover:text-primary transition-colors"
                                >
                                    {submittedSubmissions[1].guest.name}
                                </Link>
                                <div className="mt-1 flex flex-col items-center gap-2">
                                    <Badge className="bg-zinc-400 text-zinc-950 hover:bg-zinc-400">
                                        {Number(submittedSubmissions[1].weighted_score).toFixed(2)} GS
                                    </Badge>
                                </div>
                            </div>
                        )}

                        {/* Gold - Rank 1 */}
                        {submittedSubmissions[0] && (
                            <div className="order-1 flex flex-col items-center sm:scale-110">
                                <Link 
                                    href={admin.submissions.show(submittedSubmissions[0].id).url}
                                    className="relative mb-4 transition-transform hover:scale-105 active:scale-95 block"
                                >
                                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 animate-bounce text-amber-400">
                                        <Trophy className="h-8 w-8" />
                                    </div>
                                    <img
                                        src={`/${submittedSubmissions[0].guest.avatar}`}
                                        className={cn(
                                            "h-28 w-28 shrink-0 rounded-2xl border-4 border-amber-400 object-cover shadow-[0_0_30px_rgba(251,191,36,0.3)] transition-all duration-500",
                                            !onlineUsers.some((u: any) => String(u.id) === String(submittedSubmissions[0].guest.id)) && "grayscale opacity-60"
                                        )}
                                    />
                                    <span className={cn(
                                        "absolute -right-1 -top-1 h-5 w-5 rounded-full border-4 border-background transition-colors duration-500",
                                        onlineUsers.some((u: any) => String(u.id) === String(submittedSubmissions[0].guest.id))
                                            ? "bg-green-500 shadow-[0_0_12px_rgba(34,197,94,0.6)]" 
                                            : "bg-zinc-600"
                                    )} />
                                    <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-amber-400 px-4 py-1 text-base font-black text-amber-950">
                                        WINNER
                                    </div>
                                </Link>
                                <Link 
                                    href={admin.submissions.show(submittedSubmissions[0].id).url}
                                    className="line-clamp-1 text-center text-xl font-black tracking-tighter uppercase italic hover:text-primary transition-colors"
                                >
                                    {submittedSubmissions[0].guest.name}
                                </Link>
                                <div className="mt-1 flex flex-col items-center gap-2">
                                    <Badge className="bg-amber-400 text-amber-950 hover:bg-amber-400 text-lg py-1 px-4">
                                        {Number(submittedSubmissions[0].weighted_score).toFixed(2)} GS
                                    </Badge>
                                </div>
                            </div>
                        )}

                        {/* Bronze - Rank 3 */}
                        {submittedSubmissions[2] && (
                            <div className="order-3 flex flex-col items-center sm:mt-12">
                                <Link 
                                    href={admin.submissions.show(submittedSubmissions[2].id).url}
                                    className="relative mb-4 transition-transform hover:scale-105 active:scale-95 block"
                                >
                                    <img
                                        src={`/${submittedSubmissions[2].guest.avatar}`}
                                        className={cn(
                                            "h-20 w-20 shrink-0 rounded-2xl border-4 border-amber-700 object-cover shadow-xl transition-all duration-500",
                                            !onlineUsers.some((u: any) => String(u.id) === String(submittedSubmissions[2].guest.id)) && "grayscale opacity-60"
                                        )}
                                    />
                                    <span className={cn(
                                        "absolute -right-1 -top-1 h-4 w-4 rounded-full border-2 border-background transition-colors duration-500",
                                        onlineUsers.some((u: any) => String(u.id) === String(submittedSubmissions[2].guest.id))
                                            ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" 
                                            : "bg-zinc-600"
                                    )} />
                                    <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-amber-700 px-3 py-1 text-sm font-black text-white">
                                        3rd
                                    </div>
                                </Link>
                                <Link 
                                    href={admin.submissions.show(submittedSubmissions[2].id).url}
                                    className="line-clamp-1 text-center font-black tracking-tighter uppercase hover:text-primary transition-colors"
                                >
                                    {submittedSubmissions[2].guest.name}
                                </Link>
                                <div className="mt-1 flex flex-col items-center gap-2">
                                    <Badge className="mt-1 bg-amber-700 text-white hover:bg-amber-700">
                                        {Number(submittedSubmissions[2].weighted_score).toFixed(2)} GS
                                    </Badge>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Rest of the List */}
                <div className="glass w-full max-w-4xl overflow-hidden rounded-2xl border-white/10 shadow-2xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-muted/50 text-[10px] font-black tracking-[0.2em] text-muted-foreground uppercase">
                                    <th className="p-6 text-center">Rank</th>
                                    <th className="p-6">Player</th>
                                    <th className="p-6 text-center">Score</th>
                                    <th className="p-6 pr-12 text-right">Time</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/50">
                                {submissions
                                    .filter(
                                        (sub) =>
                                            !submittedSubmissions
                                                .slice(0, 3)
                                                .some((s) => s.id === sub.id),
                                    )
                                    .map((sub) => {
                                        const globalIndex = submissions.findIndex((s) => s.id === sub.id);
                                        const isOnline = onlineUsers.some(
                                            (u: any) => !u.is_admin && String(u.id) === String(sub.guest.id)
                                        );

                                        return (
                                            <tr
                                                key={sub.id}
                                                className={cn(
                                                    "group transition-colors hover:bg-muted/30",
                                                    !sub.is_submitted && !isOnline && "opacity-60"
                                                )}
                                            >
                                                <td className="p-4 text-center font-mono font-black text-muted-foreground">
                                                    #{globalIndex + 1}
                                                </td>
                                                <td className="p-4">
                                                    {sub.is_submitted ? (
                                                        <Link 
                                                            href={admin.submissions.show(sub.id).url}
                                                            className="flex items-center gap-3 group/player transition-transform active:scale-95"
                                                        >
                                                            <div className="relative h-10 w-10 shrink-0">
                                                                <img
                                                                    src={`/${sub.guest.avatar}`}
                                                                    className={cn(
                                                                        "h-10 w-10 rounded-xl border border-border object-cover transition-all group-hover/player:border-primary group-hover/player:ring-2 group-hover/player:ring-primary/20 duration-500",
                                                                        !isOnline && "grayscale opacity-60"
                                                                    )}
                                                                />
                                                                <span className={cn(
                                                                    "absolute -right-1 -bottom-1 h-3 w-3 rounded-full border-2 border-background transition-colors duration-500",
                                                                    isOnline 
                                                                        ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" 
                                                                        : "bg-zinc-600"
                                                                )} />
                                                            </div>
                                                            <span className="font-bold md:text-base text-sm text-foreground transition-colors group-hover/player:text-primary">
                                                                {sub.guest.name}
                                                            </span>
                                                        </Link>
                                                    ) : (
                                                        <div className="flex items-center gap-3">
                                                            <div className="relative h-10 w-10 shrink-0">
                                                                <img
                                                                    src={`/${sub.guest.avatar}`}
                                                                    className={cn(
                                                                        "h-10 w-10 rounded-xl border border-border object-cover transition-all duration-500",
                                                                        !isOnline && "opacity-50 grayscale"
                                                                    )}
                                                                />
                                                                <span className={cn(
                                                                    "absolute -right-1 -bottom-1 h-3 w-3 rounded-full border-2 border-background transition-colors duration-500",
                                                                    isOnline 
                                                                        ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" 
                                                                        : "bg-zinc-600"
                                                                )} />
                                                            </div>
                                                            <span className={cn(
                                                                "font-bold md:text-base text-sm transition-colors",
                                                                isOnline ? "text-foreground" : "text-muted-foreground italic"
                                                            )}>
                                                                {sub.guest.name}
                                                            </span>
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="p-4 text-center font-black text-primary italic">
                                                    {sub.is_submitted
                                                        ? `${Number(sub.weighted_score).toFixed(2)} GS`
                                                        : '--'}
                                                </td>
                                                <td className="p-4 pr-12 text-right font-mono text-xs text-muted-foreground">
                                                    {sub.is_submitted && sub.submitted_at_seconds !== null ? (
                                                        <div className="flex flex-col items-end">
                                                            <span className="font-bold text-foreground">
                                                                {Math.floor(sub.submitted_at_seconds / 60)}:
                                                                {(sub.submitted_at_seconds % 60).toString().padStart(2, '0')}
                                                            </span>
                                                            {sub.created_at && (
                                                                <span className="text-[10px] opacity-60">
                                                                    {new Date(sub.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                </span>
                                                            )}
                                                        </div>
                                                    ) : isOnline ? (
                                                        <div className="flex items-center justify-end gap-1.5">
                                                            <span className="relative flex h-1.5 w-1.5">
                                                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75"></span>
                                                                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary"></span>
                                                            </span>
                                                            <span className="text-[10px] font-black tracking-widest text-primary uppercase">Live</span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-[10px] font-black tracking-widest text-muted-foreground/30 uppercase">Offline</span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                {submissions.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={4}
                                            className="p-12 text-center text-muted-foreground"
                                        >
                                            No participants yet.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </>
    );
}


