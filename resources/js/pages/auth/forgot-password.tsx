// Components
import { Form, Head } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { login } from '@/routes';
import { email } from '@/routes/password';

export default function ForgotPassword({ status }: { status?: string }) {
    return (
        <>
            <Head title="Forgot password" />

            {status && (
                <div className="mb-4 text-center text-sm font-medium text-green-600">
                    {status}
                </div>
            )}

            <div className="space-y-6">
                <Form {...email.form()}>
                    {({ processing, errors }) => (
                        <>
                            <div className="grid gap-2">
                                <Label 
                                    htmlFor="email"
                                    className="text-xs font-black tracking-widest text-muted-foreground uppercase"
                                >
                                    Recovery Email
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    name="email"
                                    autoComplete="off"
                                    autoFocus
                                    placeholder="admin@cyberbingo.com"
                                    className="h-12 border-primary/20 bg-primary/5 font-bold focus:border-primary/50 focus:ring-primary/20"
                                />

                                <InputError message={errors.email} />
                            </div>

                            <div className="my-6 flex items-center justify-start">
                                <Button
                                    className="group relative h-14 w-full overflow-hidden rounded-2xl bg-primary px-8 text-lg font-black tracking-tighter text-primary-foreground uppercase italic shadow-[0_0_20px_rgba(var(--primary),0.3)] transition-all hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(var(--primary),0.5)] active:scale-95 disabled:opacity-50"
                                    disabled={processing}
                                    data-test="email-password-reset-link-button"
                                >
                                    <span className="relative z-10 flex items-center gap-2">
                                        {processing ? (
                                            <LoaderCircle className="h-5 w-5 animate-spin" />
                                        ) : 'Send Reset Signal'}
                                    </span>
                                    <div className="absolute inset-0 z-0 bg-linear-to-tr from-white/20 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                                </Button>
                            </div>
                        </>
                    )}
                </Form>

                <div className="flex items-center justify-center space-x-2 rounded-xl border border-border/50 bg-muted/30 p-4 text-sm font-bold">
                    <span className="text-muted-foreground uppercase tracking-widest text-[10px]">Return to</span>
                    <TextLink href={login()} className="text-primary hover:text-cyber-pink transition-colors">TERMINAL ACCESS</TextLink>
                </div>
            </div>
        </>
    );
}

ForgotPassword.layout = {
    title: 'Forgot password',
    description: 'Enter your email to receive a password reset link',
};
