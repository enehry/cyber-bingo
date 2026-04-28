import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { configureEcho } from '@laravel/echo-react';
import { ConfirmProvider } from '@/components/confirm';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { initializeTheme } from '@/hooks/use-appearance';
import AppLayout from '@/layouts/app-layout';
import AuthLayout from '@/layouts/auth-layout';
import SettingsLayout from '@/layouts/settings/layout';

declare global {
    interface Window {
        Laravel?: {
            env: {
                VITE_REVERB_APP_KEY: string;
                VITE_REVERB_HOST: string;
                VITE_REVERB_PORT: string;
                VITE_REVERB_SCHEME: string;
                VITE_APP_NAME: string;
            };
        };
    }
}

const env =
    typeof window !== 'undefined' && window.Laravel?.env
        ? window.Laravel.env
        : import.meta.env;

configureEcho({
    broadcaster: 'reverb',
    key: (env.VITE_REVERB_APP_KEY || '').replace(/['"]/g, ''),
    wsHost: (env.VITE_REVERB_HOST || window.location.hostname).replace(
        /['"]/g,
        '',
    ),
    // Cast to Number to prevent connection drops
    wsPort: Number(env.VITE_REVERB_PORT?.replace(/['"]/g, '')) || 80,
    wssPort: Number(env.VITE_REVERB_PORT?.replace(/['"]/g, '')) || 443,
    forceTLS: (env.VITE_REVERB_SCHEME || '').replace(/['"]/g, '') === 'https',
    enabledTransports: ['ws', 'wss'],
});

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    resolve: (name) =>
        resolvePageComponent(
            `./pages/${name}.tsx`,
            import.meta.glob('./pages/**/*.tsx'),
        ),
    layout: (name) => {
        switch (true) {
            case name === 'welcome':
                return null;
            case name.startsWith('auth/'):
                return AuthLayout;
            case name.startsWith('settings/'):
                return [AppLayout, SettingsLayout];
            default:
                return AppLayout;
        }
    },
    strictMode: true,
    withApp(app) {
        return (
            <TooltipProvider delayDuration={0}>
                {app}
                <Toaster />
                <ConfirmProvider />
            </TooltipProvider>
        );
    },
    progress: {
        color: '#4B5563',
    },
});

// This will set light / dark mode on load...
initializeTheme();
