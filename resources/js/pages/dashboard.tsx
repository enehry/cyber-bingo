import { Head } from '@inertiajs/react';
import admin from '@/routes/admin';

export default function Dashboard() {
    return (
        <>
            <Head title="Command Center" />
            <div className="cyber-grid flex min-h-screen flex-col gap-10 p-6 text-foreground">
                {/* ... existing content ... */}
            </div>
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: admin.cards.index().url,
        },
    ],
};
