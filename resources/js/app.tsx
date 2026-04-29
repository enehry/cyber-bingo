import { createInertiaApp } from '@inertiajs/react';
import { configureEcho } from '@laravel/echo-react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { ConfirmProvider } from '@/components/confirm';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { initializeTheme } from '@/hooks/use-appearance';
import AppFloatingLayout from '@/layouts/app/app-floating-layout';
import AppLayout from '@/layouts/app-layout';
import AuthLayout from '@/layouts/auth-layout';
import GuestLayout from '@/layouts/guest-layout';
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
    authEndpoint: '/broadcasting/auth',
    auth: {
        headers: {
            'X-App-Name': env.VITE_APP_NAME,
        },
    },
});

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    resolve: (name) =>
        resolvePageComponent(
            `./pages/${name}.tsx`,
            import.meta.glob('./pages/**/*.tsx'),
        ).then((page: any) => {
            const layout = page.default.layout;
            const isLayoutObject = layout && typeof layout === 'object';

            if (!layout || isLayoutObject) {
                const layoutProps = isLayoutObject ? layout : {};

                if (name === 'welcome') {
                    page.default.layout = null;
                } else if (name.startsWith('auth/')) {
                    page.default.layout = (page: any) => (
                        <AuthLayout {...layoutProps}>{page}</AuthLayout>
                    );
                } else if (name.startsWith('admin/')) {
                    page.default.layout = (page: any) => (
                        <AppFloatingLayout {...layoutProps}>{page}</AppFloatingLayout>
                    );
                } else if (name.startsWith('game/')) {
                    page.default.layout = (page: any) => (
                        <GuestLayout {...layoutProps}>{page}</GuestLayout>
                    );
                } else if (name.startsWith('settings/')) {
                    page.default.layout = (page: any) => (
                        <AppLayout {...layoutProps}>
                            <SettingsLayout>{page}</SettingsLayout>
                        </AppLayout>
                    );
                } else {
                    page.default.layout = (page: any) => (
                        <AppLayout {...layoutProps}>{page}</AppLayout>
                    );
                }
            }
            
            return page;
        }),
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
