import { Form, Head } from '@inertiajs/react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { store } from '@/routes/login';
import { request } from '@/routes/password';

type Props = {
    status?: string;
    canResetPassword: boolean;
};

export default function Login({ status, canResetPassword }: Props) {
    return (
        <>
            <Head title="Log in" />

            <Form
                {...store.form()}
                resetOnSuccess={['password']}
                className="flex flex-col gap-6"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-6">
                            <div className="grid gap-2">
                                <Label 
                                    htmlFor="email" 
                                    className="text-xs font-black tracking-widest text-muted-foreground uppercase"
                                >
                                    Admin Email
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    name="email"
                                    required
                                    autoFocus
                                    tabIndex={1}
                                    autoComplete="email"
                                    placeholder="admin@cyberbingo.com"
                                    className="h-12 border-primary/20 bg-primary/5 font-bold focus:border-primary/50 focus:ring-primary/20"
                                />
                                <InputError message={errors.email} />
                            </div>

                            <div className="grid gap-2">
                                <div className="flex items-center justify-between">
                                    <Label 
                                        htmlFor="password"
                                        className="text-xs font-black tracking-widest text-muted-foreground uppercase"
                                    >
                                        Security Code
                                    </Label>
                                    {canResetPassword && (
                                        <TextLink
                                            href={request()}
                                            className="text-xs font-bold text-primary transition-colors hover:text-cyber-pink"
                                            tabIndex={5}
                                        >
                                            Forgot Access?
                                        </TextLink>
                                    )}
                                </div>
                                <PasswordInput
                                    id="password"
                                    name="password"
                                    required
                                    tabIndex={2}
                                    autoComplete="current-password"
                                    placeholder="••••••••"
                                    className="h-12 border-primary/20 bg-primary/5 font-bold focus:border-primary/50 focus:ring-primary/20"
                                />
                                <InputError message={errors.password} />
                            </div>

                            <div className="flex items-center space-x-3 rounded-xl border border-border/50 bg-muted/30 p-3">
                                <Checkbox
                                    id="remember"
                                    name="remember"
                                    tabIndex={3}
                                    className="border-primary/50 data-[state=checked]:bg-primary"
                                />
                                <Label 
                                    htmlFor="remember"
                                    className="text-xs font-bold text-muted-foreground cursor-pointer"
                                >
                                    Stay logged into terminal
                                </Label>
                            </div>

                            <Button
                                type="submit"
                                className="group relative mt-2 h-14 overflow-hidden rounded-2xl bg-primary px-8 text-lg font-black tracking-tighter text-primary-foreground uppercase italic shadow-[0_0_20px_rgba(var(--primary),0.3)] transition-all hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(var(--primary),0.5)] active:scale-95 disabled:opacity-50"
                                tabIndex={4}
                                disabled={processing}
                                data-test="login-button"
                            >
                                <span className="relative z-10 flex items-center gap-2">
                                    {processing ? <Spinner className="size-5" /> : 'Initialize System'}
                                </span>
                                {/* Button glow effect */}
                                <div className="absolute inset-0 z-0 bg-linear-to-tr from-white/20 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                            </Button>
                        </div>
                    </>
                )}
            </Form>

            {status && (
                <div className="mb-4 text-center text-sm font-medium text-green-600">
                    {status}
                </div>
            )}
        </>
    );
}

Login.layout = {
    title: 'Log in to your account',
    description: 'Enter your email and password below to log in',
};
