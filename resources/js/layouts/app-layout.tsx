import AppLayoutTemplate from '@/layouts/app/app-floating-layout';
import type { BreadcrumbItem } from '@/types';

export default function AppLayout({
    children,
}: {
    breadcrumbs?: BreadcrumbItem[];
    children: React.ReactNode;
}) {
    return (
        <AppLayoutTemplate>
            {children}
        </AppLayoutTemplate>
    );
}
