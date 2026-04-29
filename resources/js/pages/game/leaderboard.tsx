import { Head, Link, router } from '@inertiajs/react';
import { useEchoPresence } from '@laravel/echo-react';
import { ChevronLeft, Trophy } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import game from '@/routes/game';

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
};

type Interpretation = {
    min_score: number;
    max_score: number;
    label: string;
};

export default function Leaderboard({
    card,
    submissions,
    has_submitted,
}: {
    guest: { name: string; avatar: string; id: number } | null;
    card: {
        id: number;
        title: string;
        description: string;
        is_paused: boolean;
        ends_at: string | null;
        score_interpretations: Interpretation[] | null;
    };
    submissions: Submission[];
    has_submitted: boolean;
}) {

    const [onlineUsers, setOnlineUsers] = useState<any[]>([]);

    // Presence list is managed here, join is triggered globally by the layout
    const { channel } = useEchoPresence(
        'arena',
        ['LeaderboardUpdated', 'GuestJoined', 'BingoStateChanged'],
        () => {
            router.reload();
        },
    );

    useEffect(() => {
        channel()
            .here((users: any[]) => setOnlineUsers(users))
            .joining((user: any) => setOnlineUsers((prev) => {
                if (prev.find((u) => String(u.id) === String(user.id))) {
                    return prev;
                }

                return [...prev, user];
            }))
            .leaving((user: any) => setOnlineUsers((prev) =>
                prev.filter((u) => String(u.id) !== String(user.id)),
            ));
    }, [channel]);

    const isFinished = !card?.is_paused && card?.ends_at && new Date(card.ends_at) < new Date();
    const isPaused = card?.is_paused;
    const submittedSubmissions = submissions.filter((s) => s.is_submitted);

    return (
        <>
            <Head title="Leaderboard" />
            <div className="cyber-grid flex min-h-screen flex-col items-center bg-background p-4 text-foreground sm:p-8">
                {/* Back Button */}
                {!isFinished && (
                    <div className="mb-4 w-full max-w-4xl">
                        <Link
                            href={game.play().url}
                            className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground transition-colors hover:text-primary"
                        >
                            <ChevronLeft className="h-4 w-4" />
                            Back to Game
                        </Link>
                    </div>
                )}

                {/* Session Ended Notice */}
                {isFinished && !has_submitted && (
                    <div className="glass mb-8 w-full max-w-4xl animate-in rounded-2xl border-2 border-destructive/50 bg-destructive/10 p-6 text-center text-destructive duration-500 slide-in-from-top">
                        <p className="mb-1 text-xl font-black tracking-tighter uppercase italic">
                            ⚠️ SESSION CONCLUDED
                        </p>
                        <p className="font-medium opacity-90">
                            You joined too late to participate, but you can
                            still view the final rankings.
                        </p>
                    </div>
                )}

                {/* Header Card */}
                <div className="glass relative mb-12 flex w-full max-w-4xl items-center justify-between overflow-hidden rounded-2xl border-white/10 p-6 shadow-xl">
                    <div className="absolute top-4 -right-2 translate-x-4 -translate-y-2 rotate-45 bg-primary p-1 px-8 text-[10px] font-black tracking-widest text-primary-foreground uppercase">
                        LIVE
                    </div>

                    <div className="flex items-center gap-4">
                        <Trophy className="h-12 w-12 text-primary drop-shadow-[0_0_10px_rgba(var(--color-primary),0.5)]" />
                        <div>
                            <h2 className="text-4xl font-black tracking-tighter text-foreground uppercase italic">
                                Cyber{' '}
                                <span className="text-primary">
                                    Hall of Fame
                                </span>
                            </h2>
                            <div className="flex items-center gap-3">
                                <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">
                                    {card?.title || 'Active Session'}
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
                                    <span className="text-[10px] text-nowrap font-black tracking-tighter text-green-500 uppercase">
                                        {onlineUsers.filter((u) => !u.is_admin).length} Online
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
                                <div className="relative mb-4">
                                    <img
                                        src={`/${submittedSubmissions[1].guest.avatar}`}
                                        className="h-20 w-20 shrink-0 rounded-2xl border-4 border-zinc-400 object-cover shadow-xl"
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
                                </div>
                                <p className="line-clamp-1 text-center font-black tracking-tighter uppercase">
                                    {submittedSubmissions[1].guest.name}
                                </p>
                                <Badge className="mt-1 bg-zinc-400 text-zinc-950 hover:bg-zinc-400">
                                    {Number(submittedSubmissions[1].weighted_score).toFixed(2)} GS
                                </Badge>
                            </div>
                        )}

                        {/* Gold - Rank 1 */}
                        {submittedSubmissions[0] && (
                            <div className="order-1 flex flex-col items-center sm:scale-110">
                                <div className="relative mb-4">
                                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 animate-bounce text-amber-400">
                                        <Trophy className="h-8 w-8" />
                                    </div>
                                    <img
                                        src={`/${submittedSubmissions[0].guest.avatar}`}
                                        className="h-28 w-28 shrink-0 rounded-2xl border-4 border-amber-400 object-cover shadow-[0_0_30px_rgba(251,191,36,0.3)]"
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
                                </div>
                                <p className="line-clamp-1 text-center text-xl font-black tracking-tighter uppercase italic">
                                    {submittedSubmissions[0].guest.name}
                                </p>
                                <div className="mt-1 flex flex-col items-center">
                                    <Badge className="bg-amber-400 text-amber-950 hover:bg-amber-400 text-lg py-1 px-4">
                                        {Number(submittedSubmissions[0].weighted_score).toFixed(2)} GS
                                    </Badge>
                                </div>
                            </div>
                        )}

                        {/* Bronze - Rank 3 */}
                        {submittedSubmissions[2] && (
                            <div className="order-3 flex flex-col items-center sm:mt-12">
                                <div className="relative mb-4">
                                    <img
                                        src={`/${submittedSubmissions[2].guest.avatar}`}
                                        className="h-20 w-20 shrink-0 rounded-2xl border-4 border-amber-700 object-cover shadow-xl"
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
                                </div>
                                <p className="line-clamp-1 text-center font-black tracking-tighter uppercase">
                                    {submittedSubmissions[2].guest.name}
                                </p>
                                <Badge className="mt-1 bg-amber-700 text-white hover:bg-amber-700">
                                    {Number(submittedSubmissions[2].weighted_score).toFixed(2)} GS
                                </Badge>
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
                                    <th className="p-6 pr-12 text-right">
                                        Time
                                    </th>
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
                                                    <div className="flex items-center gap-3">
                                                        <div className="relative h-10 w-10 shrink-0">
                                                            <img
                                                                src={`/${sub.guest.avatar}`}
                                                                className="h-10 w-10 rounded-xl border border-border object-cover"
                                                            />
                                                            <span className={cn(
                                                                "absolute -right-1 -bottom-1 h-3 w-3 rounded-full border-2 border-background transition-colors duration-500",
                                                                isOnline 
                                                                    ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" 
                                                                    : "bg-zinc-600"
                                                            )} />
                                                        </div>
                                                        <span className="font-bold md:text-base text-sm text-foreground">
                                                            {sub.guest.name}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="p-4 text-center font-black text-primary italic">
                                                    {sub.is_submitted
                                                        ? `${Number(sub.weighted_score).toFixed(2)} GS`
                                                        : '--'}
                                                </td>
                                                <td className="p-4 pr-6 text-right font-mono text-xs text-muted-foreground">
                                                    {sub.is_submitted &&
                                                    sub.submitted_at_seconds !==
                                                        null ? (
                                                        <>
                                                            {Math.floor(
                                                                sub.submitted_at_seconds /
                                                                    60,
                                                            )}
                                                            :
                                                            {(
                                                                sub.submitted_at_seconds %
                                                                60
                                                            )
                                                                .toString()
                                                                .padStart(2, '0')}
                                                        </>
                                                    ) : isOnline ? (
                                                        <div className="flex items-center justify-end gap-1.5">
                                                            <span className="relative flex h-1.5 w-1.5">
                                                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75"></span>
                                                                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary"></span>
                                                            </span>
                                                            <span className="text-[10px] font-black tracking-widest text-primary uppercase">
                                                                Live
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-[10px] font-black tracking-widest text-muted-foreground/30 uppercase">
                                                            Offline
                                                        </span>
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
