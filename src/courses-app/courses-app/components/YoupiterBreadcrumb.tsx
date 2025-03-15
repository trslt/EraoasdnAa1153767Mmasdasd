import React from 'react';
import { Home, ChevronRight, Layout } from 'lucide-react';

interface BreadcrumbItem {
    label: string;
    href?: string;
    icon?: React.ReactNode;
}

export default function YoupiterBreadcrumb({ items }: { items: BreadcrumbItem[] }) {
    return (
        <ol className="flex items-center whitespace-nowrap">
            {items.map((item: BreadcrumbItem, index) => (
                <li key={index} className="inline-flex items-center">
                    {index < items.length - 1 ? (
                        <a
                            className="flex items-center text-sm text-gray-500 hover:text-blue-600 focus:outline-none focus:text-blue-600 dark:text-neutral-500 dark:hover:text-blue-500 dark:focus:text-blue-500"
                            href={item.href}
                        >
                            {item.icon}
                            {item.label}
                            <ChevronRight className="shrink-0 mx-2 size-4 text-gray-400 dark:text-neutral-600" />
                        </a>
                    ) : (
                        <span className="inline-flex items-center text-sm font-semibold text-gray-800 truncate dark:text-neutral-200">
                            {item.label}
                        </span>
                    )}
                </li>
            ))}
        </ol>
    );
};

// Example usage:
export const BreadcrumbExample: React.FC = () => {
    const breadcrumbItems: BreadcrumbItem[] = [
        {
            label: 'Home',
            href: '#',
            icon: <Home className="shrink-0 me-3 size-4" />
        },
        {
            label: 'App Center',
            href: '#',
            icon: <Layout className="shrink-0 me-3 size-4" />
        },
        {
            label: 'Application',
        }
    ];

    return <YoupiterBreadcrumb items={breadcrumbItems} />;
};
