import { Head, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import guest from '@/routes/guest';

export default function Welcome({ avatars }: { avatars: string[] }) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        avatar: avatars[0] || '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(guest.store().url);
    };

    return (
        <>
            <Head title="Join Cyber Bingo" />
            <div className="cyber-grid relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background p-4">
                {/* Background Glows */}
                <div className="absolute top-1/4 -left-20 h-64 w-64 animate-pulse rounded-full bg-primary/20 blur-[100px]" />
                <div className="absolute -right-20 bottom-1/4 h-64 w-64 animate-pulse rounded-full bg-cyber-pink/20 blur-[100px] delay-700" />

                <Card className="glass relative z-10 w-full max-w-md border-white/10 shadow-2xl dark:border-white/5">
                    <CardHeader className="space-y-1 text-center">
                        <div className="mx-auto mb-4 flex h-16 w-16 rotate-3 items-center justify-center rounded-2xl bg-primary shadow-lg shadow-primary/20">
                            <span className="text-3xl font-black text-primary-foreground">
                                B!
                            </span>
                        </div>
                        <CardTitle className="text-4xl font-black tracking-tighter uppercase italic">
                            Cyber <span className="text-primary">Bingo</span>
                        </CardTitle>
                        <CardDescription className="text-lg font-medium text-muted-foreground/80">
                            Check your habits. Master the grid.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={submit} className="space-y-8">
                            <div className="space-y-2">
                                <Label
                                    htmlFor="name"
                                    className="text-sm font-bold tracking-widest text-muted-foreground uppercase"
                                >
                                    Your Nickname
                                </Label>
                                <Input
                                    id="name"
                                    type="text"
                                    value={data.name}
                                    onChange={(e) =>
                                        setData('name', e.target.value)
                                    }
                                    placeholder="e.g., CyberNinja"
                                    className="h-12 border-border/50 bg-background/50 text-lg font-bold focus:border-primary"
                                    required
                                />
                                {errors.name && (
                                    <p className="text-xs text-destructive">
                                        {errors.name}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-4">
                                <Label className="text-sm font-bold tracking-widest text-muted-foreground uppercase">
                                    Choose Avatar
                                </Label>
                                <div className="scrollbar-thin scrollbar-thumb-primary/20 grid max-h-60 grid-cols-4 gap-4 overflow-y-auto p-1 pr-2 sm:grid-cols-5">
                                    {avatars.map((avatarPath) => (
                                        <button
                                            key={avatarPath}
                                            type="button"
                                            onClick={() =>
                                                setData('avatar', avatarPath)
                                            }
                                            className={`group relative aspect-square overflow-hidden rounded-2xl border-4 transition-all hover:scale-110 active:scale-95 ${
                                                data.avatar === avatarPath
                                                    ? 'border-primary shadow-[0_0_20px_rgba(var(--color-primary),0.4)]'
                                                    : 'border-transparent opacity-50 grayscale hover:opacity-100 hover:grayscale-0'
                                            }`}
                                        >
                                            <img
                                                src={`/${avatarPath}`}
                                                alt="Avatar"
                                                className="h-full w-full object-cover"
                                            />
                                        </button>
                                    ))}
                                </div>
                                {errors.avatar && (
                                    <p className="text-xs text-destructive">
                                        {errors.avatar}
                                    </p>
                                )}
                            </div>

                            <Button
                                type="submit"
                                disabled={processing}
                                className="h-14 w-full bg-primary text-xl font-black tracking-tighter uppercase transition-all hover:scale-[1.02] active:scale-95"
                            >
                                {processing
                                    ? 'Initializing...'
                                    : 'Enter the Arena'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
