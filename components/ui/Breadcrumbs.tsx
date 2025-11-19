'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items?: BreadcrumbItem[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  const pathname = usePathname();

  // Auto-generate breadcrumbs from pathname if not provided
  const breadcrumbItems =
    items ||
    (() => {
      const segments = pathname.split('/').filter(Boolean);

      const crumbs: BreadcrumbItem[] = [{ label: 'Home', href: '/' }];

      const labelMap: Record<string, string> = {
        attivita: 'Attività',
        apparecchiature: 'Apparecchiature',
        new: 'Nuova',
        clienti: 'Clienti',
      };

      let currentPath = '';
      segments.forEach((segment, index) => {
        currentPath += `/${segment}`;
        const isLast = index === segments.length - 1;

        // Skip numeric IDs in breadcrumb labels
        if (/^\d+$/.test(segment)) {
          crumbs.push({
            label: `#${segment}`,
            href: isLast ? undefined : currentPath,
          });
        } else {
          const label = labelMap[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
          crumbs.push({
            label,
            href: isLast ? undefined : currentPath,
          });
        }
      });

      return crumbs;
    })();

  return (
    <nav className="flex items-center space-x-2 text-sm">
      {breadcrumbItems.map((item, index) => {
        const isLast = index === breadcrumbItems.length - 1;
        const isHome = index === 0;

        return (
          <div key={item.href || item.label} className="flex items-center space-x-2">
            {index > 0 && <ChevronRight size={16} className="text-gray-400" />}

            {item.href ? (
              <Link
                href={item.href}
                className={cn(
                  'hover:text-indigo-600 transition-colors flex items-center gap-1',
                  isHome ? 'text-gray-600' : 'text-gray-500'
                )}
              >
                {isHome && <Home size={16} />}
                {item.label}
              </Link>
            ) : (
              <span className="text-gray-900 font-medium flex items-center gap-1">
                {isHome && <Home size={16} />}
                {item.label}
              </span>
            )}
          </div>
        );
      })}
    </nav>
  );
}
