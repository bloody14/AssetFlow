import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  MonitorSmartphone,
  Bell,
} from 'lucide-react';

export interface NavItem {
  id: string;
  title: string;
  path: string;
  icon: React.ElementType;
  permission?: string;
  featureFlag?: string;
  badgeCount?: number;
  children?: Omit<NavItem, 'icon' | 'children'>[];
  isVisible: boolean;
  order: number;
}

export const navigationRegistry: NavItem[] = [
  {
    id: 'dashboard',
    title: 'Dashboard',
    path: '/dashboard',
    icon: LayoutDashboard,
    isVisible: true,
    order: 10,
  },
  {
    id: 'inventory',
    title: 'Inventory',
    path: '/inventory',
    icon: Package,
    permission: 'inventory.read',
    featureFlag: 'inventory',
    isVisible: true,
    order: 20,
  },
  {
    id: 'procurement',
    title: 'Procurement',
    path: '/procurement',
    icon: ShoppingCart,
    permission: 'procurement.read',
    featureFlag: 'procurement',
    isVisible: true,
    order: 30,
  },
  {
    id: 'assets',
    title: 'Assets',
    path: '/assets',
    icon: MonitorSmartphone,
    permission: 'asset.read',
    featureFlag: 'assets',
    isVisible: true,
    order: 40,
  },
  {
    id: 'notifications',
    title: 'Notifications',
    path: '/notifications',
    icon: Bell,
    badgeCount: 3, // placeholder
    isVisible: true,
    order: 50,
  },
];
