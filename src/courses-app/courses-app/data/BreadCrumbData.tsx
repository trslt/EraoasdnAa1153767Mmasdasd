import {
    Home,
    Layout,
} from 'lucide-react';


export const DashboardBreadcrumbData = [
    {
        label: 'Admin Dashboard',
        href: '#',
        icon: <Home className="shrink-0 me-3 size-4" />
    },
];

export const CreateCourseBreadcrumbData = [
    {
        label: 'Admin Dashboard',
        href: '/admin',
        icon: <Home className="shrink-0 me-3 size-4" />
    },
    {
        label: 'Crea Corso',
        href: '#',
        icon: <Layout className="shrink-0 me-3 size-4" />
    }
];

export const EditCourseBreadcrumbData = [
    {
        label: 'Admin Dashboard',
        href: '/admin',
        icon: <Home className="shrink-0 me-3 size-4" />
    },
    {
        label: 'Modifica Corso',
    },
];