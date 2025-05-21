"use client"

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Ruler, Palette, Wand2, ShoppingCart, PackageSearch, Users } from 'lucide-react';
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/measurements', label: 'Measurements', icon: Ruler },
  { href: '/design', label: 'Design Studio', icon: Palette },
  { href: '/recommendations', label: 'AI Styles', icon: Wand2 },
  { href: '/orders', label: 'My Orders', icon: ShoppingCart },
  { href: '/tracking', label: 'Order Tracking', icon: PackageSearch },
  { href: '/tailors', label: 'Tailor Hub', icon: Users },
];

export default function SidebarNav() {
  const pathname = usePathname();

  return (
    <SidebarMenu>
      {navItems.map((item) => {
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
