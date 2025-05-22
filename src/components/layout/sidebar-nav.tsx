
"use client"

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Ruler, Palette, Wand2, ShoppingCart, PackageSearch, Users } from 'lucide-react';
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth'; // Import useAuth

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  roles: Array<'admin' | 'tailor'>; // Define roles that can see this item
}

const allNavItems: NavItem[] = [
  { href: '/', label: 'Home', icon: Home, roles: ['admin', 'tailor'] },
  { href: '/measurements', label: 'Precise Measurements', icon: Ruler, roles: ['admin', 'tailor'] },
  { href: '/design', label: 'Custom Design Studio', icon: Palette, roles: ['admin', 'tailor'] },
  { href: '/recommendations', label: 'AI Styles', icon: Wand2, roles: ['admin', 'tailor'] },
  { href: '/orders', label: 'Order Management', icon: ShoppingCart, roles: ['admin', 'tailor'] },
  { href: '/tracking', label: 'Order Tracking', icon: PackageSearch, roles: ['admin', 'tailor'] },
  { href: '/tailors', label: 'Tailor Hub', icon: Users, roles: ['admin'] }, // Admin only
];

export default function SidebarNav() {
  const pathname = usePathname();
  const { role } = useAuth(); // Get the current user's role

  // Filter navItems based on the user's role
  const visibleNavItems = allNavItems.filter(item => {
    if (!role) return false; // Should not happen if auth guard is effective
    return item.roles.includes(role);
  });

  return (
    <SidebarMenu>
      {visibleNavItems.map((item) => {
        const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
        return (
          <SidebarMenuItem key={item.href}>
            <Link href={item.href} legacyBehavior passHref>
              <SidebarMenuButton
                className={cn(
                  "w-full justify-start",
                  isActive && "bg-sidebar-accent text-sidebar-accent-foreground"
                )}
                isActive={isActive}
                tooltip={item.label}
              >
                <item.icon className="h-5 w-5" />
                <span className="truncate">{item.label}</span>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );
}
