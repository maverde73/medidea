'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  icon?: LucideIcon;
  badge?: string | number;
  className?: string;
  collapsed?: boolean;
}

export function NavLink({
  href,
  children,
  icon: Icon,
  badge,
  className,
  collapsed = false,
}: NavLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === href || (href !== '/' && pathname.startsWith(href));

  return (
    <Link
      href={href}
      className={cn(
        'flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm font-medium',
        'hover:bg-sidebar-hover',
        isActive && 'bg-sidebar-active text-white',
        !isActive && 'text-sidebar-text hover:text-white',
        className
      )}
      title={collapsed ? String(children) : undefined}
    >
      {Icon && <Icon size={20} className="shrink-0" />}
      {!collapsed && <span className="flex-1 truncate">{children}</span>}
      {!collapsed && badge && (
        <span className="px-2 py-0.5 text-xs rounded-full bg-primary-500 text-white">
          {badge}
        </span>
      )}
    </Link>
  );
}
