import type { PageProps as InertiaPageProps } from '@inertiajs/core';
import type { Auth, Guest } from './auth';

export interface SharedData extends InertiaPageProps {
    name: string;
    auth: Auth;
    guest: Guest | null;
    sidebarOpen: boolean;
    flash: {
        message: string | null;
        success: string | null;
        error: string | null;
    };
    [key: string]: unknown;
}

export type PageProps<
    T extends Record<string, unknown> = Record<string, unknown>,
> = T & SharedData;
