'use client';

import { type LucideIcon } from 'lucide-react';
import { NavLink } from './NavLink';

interface MenuItemProps {
  id: string;
  label: string;
  icon: LucideIcon;
  href: string;
  badge?: string | number;
  collapsed?: boolean;
}

export function MenuItem({ id, label, icon, href, badge, collapsed }: MenuItemProps) {
  return (
    <NavLink href={href} icon={icon} badge={badge} collapsed={collapsed}>
      {label}
    </NavLink>
  );
}
