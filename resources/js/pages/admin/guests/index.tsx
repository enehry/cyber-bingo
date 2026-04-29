import { Head, Link, router } from '@inertiajs/react';
import { ChevronLeft, Search, Trash2, Users, UserX } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { confirm } from '@/components/confirm';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import admin from '@/routes/admin';

type Guest = {
    id: string;
    name: string;
    avatar: string;
    submissions_count: number;
    created_at: string;
};

export default function Index({ guests }: { guests: Guest[] }) {
    const [search, setSearch] = useState('');

    const filteredGuests = guests.filter(g => 
        g.name.toLowerCase().includes(search.toLowerCase())
    );

    const deleteGuest = (id: string) => {
        confirm({
            title: 'Delete Player',
            body: 'Are you sure you want to delete this player? They will be forced to re-register.',
            confirmText: 'Delete',
            cancelText: 'Cancel',
            icon: 'danger',
        }).then((isConfirmed) => {
            if (isConfirmed) {
                router.delete(admin.guests.destroy(id).url, {
                    onSuccess: () => toast.success('Player deleted'),
                });
            }
        });
    };

    const clearAll = () => {
        confirm({
            title: 'Clear All Players',
            body: 'CRITICAL ACTION: This will delete ALL players and their submissions. Every player will be forced to re-register. Continue?',
            confirmText: 'Clear All',
            cancelText: 'Cancel',
            icon: 'danger',
        }).then((isConfirmed) => {
            if (isConfirmed) {
                router.post(admin.guests.clear().url, {}, {
                    onSuccess: () => toast.success('All players cleared'),
                });
            }
        });
        
    };

    return (
        <>
            <Head title="Guest Management" />
            <div className="cyber-grid flex min-h-screen flex-col items-center bg-background p-4 text-foreground sm:p-8">
                <div className="w-full max-w-5xl">
                    {/* Header */}
                    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <Link
                                href={admin.cards.index().url}
                                className="mb-2 inline-flex items-center gap-2 text-sm font-bold text-muted-foreground transition-colors hover:text-primary"
                            >
                                <ChevronLeft className="h-4 w-4" />
                                Back to Management
                            </Link>
                            <h1 className="text-4xl font-black tracking-tighter uppercase italic">
                                Player <span className="text-primary">Management</span>
                            </h1>
                            <p className="text-muted-foreground font-medium">
                                View and manage all active arena participants.
                            </p>
                        </div>

                        <Button 
                            variant="destructive" 
                            size="lg" 
                            className="font-black tracking-tighter uppercase italic shadow-lg shadow-destructive/20"
                            onClick={clearAll}
                            disabled={guests.length === 0}
                        >
                            <UserX className="mr-2 h-5 w-5" />
                            Clear All Players
                        </Button>
                    </div>

                    {/* Controls */}
                    <Card className="glass mb-8 border-white/10 shadow-xl">
                        <CardContent className="pt-6">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input 
                                    placeholder="Search by nickname..." 
                                    className="h-12 pl-10 font-bold bg-background/50 border-white/5 focus:border-primary"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Guest Grid */}
                    {filteredGuests.length > 0 ? (
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {filteredGuests.map((guest) => (
                                <Card key={guest.id} className="glass group relative overflow-hidden border-white/10 transition-all hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/10">
                                    <div className="pointer-events-none absolute inset-0 bg-linear-to-br from-primary/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                                    <CardHeader className="flex flex-row items-center gap-4 pb-2">
                                        <div className="relative">
                                            <Avatar className="h-12 w-12 border-2 border-primary/20">
                                                <AvatarImage src={`/${guest.avatar}`} />
                                                <AvatarFallback>{guest.name.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                        </div>
                                        <div className="flex-1 overflow-hidden">
                                            <CardTitle className="truncate text-xl font-black tracking-tighter uppercase italic">
                                                {guest.name}
                                            </CardTitle>
                                            <CardDescription className="text-[10px] font-bold tracking-widest uppercase">
                                                Joined {new Date(guest.created_at).toLocaleDateString()}
                                            </CardDescription>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="pb-4">
                                        <div className="flex items-center justify-between">
                                            <Badge variant="outline" className="border-primary/20 bg-primary/5 font-bold">
                                                {guest.submissions_count} Submissions
                                            </Badge>
                                            <Button 
                                                variant="ghost" 
                                                size="icon" 
                                                className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                                                onClick={() => deleteGuest(guest.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <Card className="glass border-dashed border-white/10 py-12 text-center">
                            <CardContent className="flex flex-col items-center gap-4">
                                <Users className="h-12 w-12 text-muted-foreground opacity-20" />
                                <div>
                                    <p className="text-xl font-bold text-muted-foreground">No players found</p>
                                    <p className="text-sm text-muted-foreground/60">The arena is currently empty or no players match your search.</p>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </>
    );
}
