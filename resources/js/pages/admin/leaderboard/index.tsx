import { Head, router } from '@inertiajs/react';
import { useEchoPresence } from '@laravel/echo-react';
import { Trophy, RefreshCcw } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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

export default function Index({
    card,
    submissions,
}: {
    card: any;
    submissions: Submission[];
}) {
    useEchoPresence('arena', 'LeaderboardUpdated', () => {
        router.reload({ only: ['submissions'] });
    });

    useEchoPresence('arena', 'GuestJoined', () => {
        router.reload({ only: ['submissions'] });
    });

    const refresh = () => {
        router.reload({ only: ['submissions'] });
    };

    return (
        <>
            <Head title="Admin Leaderboard" />
            <div className="cyber-grid mx-auto flex w-full max-w-7xl flex-1 flex-col gap-10 p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-5xl font-black tracking-tighter text-foreground uppercase italic">
                            Live{' '}
                            <span className="text-primary">Leaderboard</span>
                        </h2>
                        <p className="text-lg font-medium text-muted-foreground">
                            Monitoring session:{' '}
                            <span className="font-bold text-foreground uppercase italic">
                                {card?.title || 'None'}
                            </span>
                        </p>
                    </div>
                    <Button
                        variant="outline"
                        size="lg"
                        onClick={refresh}
                        className="h-14 border-2 font-black tracking-tighter uppercase italic shadow-lg hover:bg-primary/10"
                    >
                        <RefreshCcw className="mr-2 h-5 w-5" />
                        Sync Data
                    </Button>
                </div>

                <div className="grid gap-6">
                    <Card className="glass overflow-hidden border-white/10 shadow-xl">
                        <CardHeader className="border-b border-primary/20 bg-primary/10 py-4">
                            <CardTitle className="flex items-center gap-2 text-xl font-black tracking-tighter uppercase italic">
                                <Trophy className="h-5 w-5 text-primary" />
                                Top Recruits
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="relative overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="border-b border-border/50 text-xs font-medium text-muted-foreground uppercase">
                                            <th className="pr-4 pb-3 font-semibold">
                                                Rank
                                            </th>
                                            <th className="pr-4 pb-3 font-semibold">
                                                Player
                                            </th>
                                            <th className="pr-4 pb-3 text-center font-semibold">
                                                Guilty Count
                                            </th>
                                            <th className="pr-4 pb-3 text-center font-semibold">
                                                Risk Weight
                                            </th>
                                            <th className="pb-3 text-right font-semibold">
                                                Time Taken
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border/50">
                                        {submissions.length === 0 ? (
                                            <tr>
                                                <td
                                                    colSpan={5}
                                                    className="py-8 text-center text-muted-foreground"
                                                >
                                                    No submissions yet.
                                                </td>
                                            </tr>
                                        ) : (
                                            submissions.map((sub, idx) => (
                                                <tr
                                                    key={sub.id}
                                                    className="group transition-colors hover:bg-muted/30"
                                                >
                                                    <td className="py-4 pr-4 font-mono font-bold">
                                                        {idx < 3 ? (
                                                            <span className="text-xl">
                                                                {idx === 0
                                                                    ? '🥇'
                                                                    : idx === 1
                                                                      ? '🥈'
                                                                      : '🥉'}
                                                            </span>
                                                        ) : (
                                                            `#${idx + 1}`
                                                        )}
                                                    </td>
                                                    <td className="py-4 pr-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="relative">
                                                                <Avatar className="h-9 w-9 border border-border">
                                                                    <AvatarImage
                                                                        src={`/${sub.guest.avatar}`}
                                                                        alt={
                                                                            sub
                                                                                .guest
                                                                                .name
                                                                        }
                                                                    />
                                                                    <AvatarFallback>
                                                                        {sub.guest.name.charAt(
                                                                            0,
                                                                        )}
                                                                    </AvatarFallback>
                                                                </Avatar>
                                                                 {onlineUsers.some(
                                                                    (u: any) =>
                                                                        u.id ===
                                                                        sub.guest
                                                                            .id,
                                                                ) && (
                                                                    <span className="absolute -right-0.5 -bottom-0.5 h-3 w-3 rounded-full border-2 border-background bg-green-500" />
                                                                )}
                                                            </div>
                                                            <span className="font-bold">
                                                                {sub.guest.name}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="py-4 pr-4 text-center">
                                                        <span className="inline-flex items-center rounded-xl border-2 border-primary/30 bg-primary/10 px-3 py-1 text-xs font-black text-primary uppercase italic">
                                                            {sub.is_submitted ? `${sub.guilty_count} Entries` : 'PENDING'}
                                                        </span>
                                                    </td>
                                                    <td className="py-4 pr-4 text-center font-mono text-muted-foreground">
                                                        {sub.is_submitted ? sub.weighted_score : '--'}
                                                    </td>
                                                    <td className="py-4 text-right font-mono text-sm text-muted-foreground">
                                                        {sub.is_submitted && sub.submitted_at_seconds !== null ? (
                                                            <>
                                                                {Math.floor(sub.submitted_at_seconds / 60)}:{(sub.submitted_at_seconds % 60).toString().padStart(2, '0')}
                                                            </>
                                                        ) : (
                                                            <span className="animate-pulse text-xs font-bold text-primary">
                                                                PLAYING...
                                                            </span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}


