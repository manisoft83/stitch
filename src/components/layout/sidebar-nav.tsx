
"use client"

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { Home, Palette, ShoppingCart, PackageSearch, Users, Contact, Tag, Ruler, Clock, AlertCircle } from 'lucide-react';
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  roles: Array<'admin' | 'tailor'>;
}

const allNavItems: NavItem[] = [
  { href: '/', label: 'Home', icon: Home, roles: ['admin', 'tailor'] },
  { href: '/workflow/customer-step', label: 'Place Order', icon: Palette, roles: ['admin', 'tailor'] },
  { href: '/orders', label: 'Order Management', icon: ShoppingCart, roles: ['admin', 'tailor'] },
  { href: '/orders?status=active_default', label: 'Pending Orders', icon: Clock, roles: ['admin', 'tailor'] },
  { href: '/orders?status=overdue', label: 'Overdue Orders', icon: AlertCircle, roles: ['admin', 'tailor'] },
  { href: '/tracking', label: 'Order Tracking', icon: PackageSearch, roles: ['admin', 'tailor'] },
  { href: '/customers', label: 'Customers', icon: Contact, roles: ['admin']},
  { href: '/tailors', label: 'Tailor Hub', icon: Users, roles: ['admin'] },
  { href: '/admin/styles', label: 'Style Management', icon: Tag, roles: ['admin'] },
  { href: '/measurements', label: 'Measurements', icon: Ruler, roles: ['admin'] },
];

export default function SidebarNav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { role } = useAuth();
  
  const currentStatusParam = searchParams.get('status');

  const visibleNavItems = allNavItems.filter(item => {
    if (!role) return false;
    return item.roles.includes(role);
  });

  return (
    <SidebarMenu>
      {visibleNavItems.map((item) => {
        const [itemBaseHref, itemQuery] = item.href.split('?');
        const itemStatusParam = itemQuery ? new URLSearchParams(itemQuery).get('status') : null;
        
        // Determine if the item is active based on base path and status query param
        const isActive = pathname === itemBaseHref && currentStatusParam === itemStatusParam;
        
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
