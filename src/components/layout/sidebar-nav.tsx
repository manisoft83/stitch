
"use client"

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Palette, ShoppingCart, PackageSearch, Users, Contact, Wand2, Tag, Ruler } from 'lucide-react'; // Added Ruler
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
  { href: '/tracking', label: 'Order Tracking', icon: PackageSearch, roles: ['admin', 'tailor'] },
  { href: '/customers', label: 'Customers', icon: Contact, roles: ['admin']},
  { href: '/tailors', label: 'Tailor Hub', icon: Users, roles: ['admin'] },
  { href: '/admin/styles', label: 'Style Management', icon: Tag, roles: ['admin'] },
  { href: '/measurements', label: 'Measurements', icon: Ruler, roles: ['admin'] },
];

export default function SidebarNav() {
  const pathname = usePathname();
  const { role } = useAuth();

  const visibleNavItems = allNavItems.filter(item => {
    if (!role) return false;
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
