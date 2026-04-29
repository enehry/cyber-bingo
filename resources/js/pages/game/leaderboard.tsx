import { Head, Link, router } from '@inertiajs/react';
import { useEchoPresence } from '@laravel/echo-react';
import { ChevronLeft, Trophy } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
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

export default function Leaderboard({
    card,
    submissions,
    has_submitted,
}: {
    guest: { name: string; avatar: string; id: number } | null;
    card: any;
    submissions: Submission[];
    has_submitted: boolean;
}) {
    // Single presence channel subscription — handles online tracking + event listening
    useEchoPresence('arena', 'LeaderboardUpdated', () => {
        console.log('LeaderboardUpdated');
        router.reload({ only: ['submissions'] });
    });

    useEchoPresence('arena', 'GuestJoined', () => {
        console.log('GuestJoined');
        router.reload({ only: ['submissions'] });
    });

    useEchoPresence('arena', 'BingoStateChanged', () => {
        console.log('BingoStateChanged');
        router.reload();
    });

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
                            <div className="flex items-center gap-2">
                                <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">
                                    {card?.title || 'Active Session'}
                                </p>
                                {isPaused && (
                                    <Badge className="bg-amber-500 font-black text-white uppercase italic">
                                        PAUSED
                                    </Badge>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Podium Section (Top 3) */}
                {submittedSubmissions.length > 0 && (
                    <div className="mb-12 grid w-full max-w-4xl grid-cols-1 gap-6 sm:grid-cols-3">
                        {/* Silver - Rank 2 */}
                        {submittedSubmissions[1] && (
                            <div className="order-2 flex flex-col items-center sm:order-1 sm:mt-8">
                                <div className="relative mb-4">
                                    <img
                                        src={`/${submittedSubmissions[1].guest.avatar}`}
                                        className="h-20 w-20 shrink-0 rounded-2xl border-4 border-zinc-400 object-cover shadow-xl"
                                    />
                                    <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-zinc-400 px-3 py-1 text-sm font-black text-zinc-900">
                                        2nd
                                    </div>
                                </div>
                                <p className="line-clamp-1 text-center font-black tracking-tighter uppercase">
                                    {submittedSubmissions[1].guest.name}
                                </p>
                                <Badge
                                    variant="outline"
                                    className="mt-1 border-zinc-400 text-zinc-400"
                                >
                                    {submittedSubmissions[1].guilty_count}{' '}
                                    Guilty
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
                                    <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-amber-400 px-4 py-1 text-base font-black text-amber-950">
                                        WINNER
                                    </div>
                                </div>
                                <p className="line-clamp-1 text-center text-xl font-black tracking-tighter uppercase italic">
                                    {submittedSubmissions[0].guest.name}
                                </p>
                                <Badge className="mt-1 bg-amber-400 text-amber-950 hover:bg-amber-400">
                                    {submittedSubmissions[0].guilty_count}{' '}
                                    Guilty
                                </Badge>
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
                                    <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-amber-700 px-3 py-1 text-sm font-black text-white">
                                        3rd
                                    </div>
                                </div>
                                <p className="line-clamp-1 text-center font-black tracking-tighter uppercase">
                                    {submittedSubmissions[2].guest.name}
                                </p>
                                <Badge
                                    variant="outline"
                                    className="mt-1 border-amber-700 text-amber-700"
                                >
                                    {submittedSubmissions[2].guilty_count}{' '}
                                    Guilty
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

                                        return (
                                            <tr
                                                key={sub.id}
                                                className="group transition-colors hover:bg-muted/30"
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
                                                        </div>
                                                        <span className="font-bold md:text-base text-sm text-foreground">
                                                            {sub.guest.name}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="p-4 text-center font-black text-primary italic">
                                                    {sub.is_submitted
                                                        ? sub.guilty_count
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
                                                    ) : (
                                                        <span className="animate-pulse text-[10px] font-black tracking-widest text-primary uppercase">
                                                            Playing
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
