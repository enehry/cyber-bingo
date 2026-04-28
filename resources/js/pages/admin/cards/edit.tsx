import { Head, useForm } from '@inertiajs/react';
import { Minus, Plus, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import admin from '@/routes/admin';

type Cell = {
    id: number;
    row_index: number;
    col_index: number;
    label: string;
    risk_weight: number;
};

type CardData = {
    id: number;
    title: string;
    description: string | null;
    time_limit_seconds: number;
    cells: Cell[];
};

export default function Edit({ card }: { card: CardData }) {
    const { data, setData, put, processing, errors } = useForm({
        title: card.title,
        description: card.description || '',
        time_limit_seconds: card.time_limit_seconds,
        cells: card.cells.map((c) => ({
            row_index: c.row_index,
            col_index: c.col_index,
            label: c.label,
            risk_weight: c.risk_weight,
        })),
    });

    const updateCellLabel = (row: number, col: number, label: string) => {
        const newCells = [...data.cells];
        const index = newCells.findIndex(
            (c) => c.row_index === row && c.col_index === col,
        );

        if (index !== -1) {
            // Check for %weight pattern (e.g., "Weak Password%3")
            const match = label.match(/^(.*)%(\d+)$/);

            if (match) {
                newCells[index].label = match[1].trim();
                newCells[index].risk_weight = parseInt(match[2]);
            } else {
                newCells[index].label = label;
            }

            setData('cells', newCells);
        }
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        put(admin.cards.update(card.id).url);
    };

    return (
        <>
            <Head title="Edit Bingo Card" />
            <div className="cyber-grid mx-auto flex w-full max-w-7xl flex-1 flex-col gap-10 p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-5xl font-black tracking-tighter text-foreground uppercase italic">
                            Card <span className="text-primary">Editor</span>
                        </h2>
                        <p className="text-lg font-medium text-muted-foreground">
                            Update the grid and mission parameters.
                        </p>
                    </div>
                </div>

                <form onSubmit={submit} className="grid gap-10 lg:grid-cols-2">
                    {/* Left: Settings */}
                    <div className="space-y-8">
                        <Card className="glass overflow-hidden border-white/10 pt-0 shadow-xl">
                            <CardHeader className="border-b border-primary/20 bg-primary/10 px-6 py-3">
                                <CardTitle className="text-xl font-black tracking-tighter uppercase italic">
                                    Bingo Card Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6 pt-6">
                                <div className="space-y-2">
                                    <Label
                                        htmlFor="title"
                                        className="text-xs font-bold tracking-widest text-muted-foreground uppercase"
                                    >
                                        Card Title
                                    </Label>
                                    <Input
                                        id="title"
                                        value={data.title}
                                        onChange={(e) =>
                                            setData('title', e.target.value)
                                        }
                                        placeholder="e.g., Privacy & Security 2024"
                                        className="h-12 border-border/50 bg-background/50 font-bold focus:border-primary dark:border-white/20"
                                        required
                                    />
                                    {errors.title && (
                                        <p className="text-xs text-destructive">
                                            {errors.title}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label
                                        htmlFor="description"
                                        className="text-xs font-bold tracking-widest text-muted-foreground uppercase"
                                    >
                                        Description
                                    </Label>
                                    <Textarea
                                        id="description"
                                        value={data.description}
                                        onChange={(e) =>
                                            setData(
                                                'description',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="What is this session about?"
                                        className="min-h-[100px] border-border/50 bg-background/50 font-medium focus:border-primary dark:border-white/20"
                                    />
                                    {errors.description && (
                                        <p className="text-xs text-destructive">
                                            {errors.description}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label
                                        htmlFor="time_limit"
                                        className="text-xs font-bold tracking-widest text-muted-foreground uppercase"
                                    >
                                        Duration (Minutes)
                                    </Label>
                                    <div className="flex items-center gap-3">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="icon"
                                            className="h-12 w-12 border-2"
                                            onClick={() =>
                                                setData(
                                                    'time_limit_seconds',
                                                    Math.max(
                                                        60,
                                                        data.time_limit_seconds -
                                                            60,
                                                    ),
                                                )
                                            }
                                        >
                                            <Minus className="h-4 w-4" />
                                        </Button>

                                        <div className="relative flex-1">
                                            <Input
                                                id="time_limit"
                                                type="number"
                                                value={
                                                    data.time_limit_seconds / 60
                                                }
                                                onChange={(e) =>
                                                    setData(
                                                        'time_limit_seconds',
                                                        Math.max(
                                                            1,
                                                            parseInt(
                                                                e.target.value,
                                                            ) || 0,
                                                        ) * 60,
                                                    )
                                                }
                                                className="h-12 border-border/50 bg-background/50 text-center text-xl font-black focus:border-primary dark:border-white/20"
                                                required
                                            />
                                            <span className="absolute top-1/2 right-4 -translate-y-1/2 text-[10px] font-black text-muted-foreground uppercase">
                                                Min
                                            </span>
                                        </div>

                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="icon"
                                            className="h-12 w-12 border-2"
                                            onClick={() =>
                                                setData(
                                                    'time_limit_seconds',
                                                    data.time_limit_seconds +
                                                        60,
                                                )
                                            }
                                        >
                                            <Plus className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    {errors.time_limit_seconds && (
                                        <p className="text-xs text-destructive">
                                            {errors.time_limit_seconds}
                                        </p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        <div className="flex gap-4">
                            <Button
                                type="submit"
                                disabled={processing}
                                className="h-14 flex-1 bg-primary text-xl font-black tracking-tighter uppercase italic shadow-lg transition-all hover:scale-[1.02] active:scale-95"
                            >
                                {processing
                                    ? 'Updating...'
                                    : 'Save Changes'}
                            </Button>
                            <Button
                                variant="outline"
                                asChild
                                className="h-14 border-2 font-bold tracking-widest uppercase"
                            >
                                <Button
                                    variant="outline"
                                    onClick={() => window.history.back()}
                                >
                                    Cancel
                                </Button>
                            </Button>
                        </div>
                    </div>

                    {/* Right: Grid Editor */}
                    <Card className="glass overflow-hidden border-white/10 pt-0 shadow-xl">
                        <CardHeader className="flex flex-row items-center justify-between border-b border-primary/20 bg-primary/10 py-4">
                            <div className="flex flex-col">
                                <CardTitle className="text-xl font-black tracking-tighter uppercase italic">
                                    Bingo Card Grid Matrix
                                </CardTitle>
                                <p className="mt-0.5 text-[9px] leading-none font-bold text-muted-foreground uppercase">
                                    Append{' '}
                                    <Badge className="text-[9px]">%1-9</Badge>{' '}
                                    to auto-set weight
                                </p>
                            </div>
                            <Badge
                                variant="outline"
                                className="border-primary font-bold text-primary"
                            >
                                5 X 5
                            </Badge>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="grid grid-cols-5 gap-3">
                                {Array.from({ length: 25 }).map((_, i) => {
                                    const row = Math.floor(i / 5);
                                    const col = i % 5;
                                    const isFree = row === 2 && col === 2;

                                    return (
                                        <div
                                            key={i}
                                            className={`relative flex aspect-square flex-col items-center justify-center rounded-xl border-2 p-1 transition-all ${
                                                isFree
                                                    ? 'border-cyber-pink bg-cyber-pink/10 shadow-[0_0_15px_rgba(var(--color-cyber-pink),0.3)]'
                                                    : 'border-border/50 bg-background/50 focus-within:border-primary hover:border-primary/30 dark:border-white/20'
                                            }`}
                                        >
                                            {isFree ? (
                                                <Star className="h-6 w-6 animate-pulse text-cyber-pink" />
                                            ) : (
                                                <>
                                                    <div className="absolute top-1 right-1 flex items-center gap-0.5 opacity-40">
                                                        <span className="text-[6px] font-black text-primary uppercase">
                                                            Wt
                                                        </span>
                                                        <span className="text-[8px] font-black">
                                                            {data.cells.find(
                                                                (c) =>
                                                                    c.row_index ===
                                                                        row &&
                                                                    c.col_index ===
                                                                        col,
                                                            )?.risk_weight || 1}
                                                        </span>
                                                    </div>
                                                    <textarea
                                                        value={
                                                            data.cells.find(
                                                                (c) =>
                                                                    c.row_index ===
                                                                        row &&
                                                                    c.col_index ===
                                                                        col,
                                                            )?.label || ''
                                                        }
                                                        onChange={(e) =>
                                                            updateCellLabel(
                                                                row,
                                                                col,
                                                                e.target.value,
                                                            )
                                                        }
                                                        className="w-full resize-none border-none bg-transparent text-center text-[10px] leading-tight font-black uppercase placeholder:opacity-30 focus:ring-0 focus:outline-none focus-visible:ring-0 focus-visible:outline-none"
                                                        placeholder="ENTRY"
                                                        rows={3}
                                                    />
                                                </>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>
                </form>
            </div>
        </>
    );
}

Edit.layout = {
    breadcrumbs: [
        {
            title: 'Bingo Cards',
            href: admin.cards.index().url,
        },
        {
            title: 'Editor',
            href: '#',
        },
    ],
};
