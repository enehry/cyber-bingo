import { useForm, usePage } from '@inertiajs/react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import guestRoutes from '@/routes/guest';
import type { SharedData } from '@/types';

interface GuestProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function GuestProfileModal({ isOpen, onClose }: GuestProfileModalProps) {
    const { guest, avatars } = usePage<SharedData>().props;

    const { data, setData, patch, processing, errors } = useForm({
        name: guest?.name || '',
        avatar: guest?.avatar || '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        patch(guestRoutes.update.url(), {
            onSuccess: () => {
                toast.success('Profile updated!');
                onClose();
            },
        });
    };

    if (!guest) {
return null;
}

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="glass border-white/10 max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-black tracking-tighter uppercase italic">
                        Edit <span className="text-primary">Profile</span>
                    </DialogTitle>
                    <DialogDescription>
                        Update your appearance in the arena.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={submit} className="space-y-6 pt-4">
                    <div className="space-y-2">
                        <Label
                            htmlFor="name"
                            className="text-xs font-bold tracking-widest text-muted-foreground uppercase"
                        >
                            Nickname
                        </Label>
                        <Input
                            id="name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            className="h-11 border-border/50 bg-background/50 font-bold focus:border-primary"
                            required
                        />
                        {errors.name && (
                            <p className="text-xs text-destructive">{errors.name}</p>
                        )}
                    </div>

                    <div className="space-y-3">
                        <Label className="text-xs font-bold tracking-widest text-muted-foreground uppercase">
                            Choose Avatar
                        </Label>
                        <div className="scrollbar-thin scrollbar-thumb-primary/20 grid max-h-58 grid-cols-5 gap-3 overflow-y-auto p-1">
                            {avatars.map((avatarPath) => (
                                <button
                                    key={avatarPath}
                                    type="button"
                                    onClick={() => setData('avatar', avatarPath)}
                                    className={`group relative aspect-square overflow-hidden rounded-xl border-2 transition-all hover:scale-105 active:scale-95 ${
                                        data.avatar === avatarPath
                                            ? 'border-primary shadow-[0_0_15px_rgba(var(--color-primary),0.3)]'
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
                            <p className="text-xs text-destructive">{errors.avatar}</p>
                        )}
                    </div>

                    <Button
                        type="submit"
                        disabled={processing}
                        className="h-12 w-full font-black tracking-tighter uppercase"
                    >
                        {processing ? 'Saving...' : 'Update Identity'}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
