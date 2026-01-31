import {
  ArrowLeftRight,
  BarChart3,
  Boxes,
  LayoutDashboard,
  ShoppingBag,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

interface NavItem {
  title: string
  icon?: LucideIcon
  href?: string
}

export const navLinks = {
  dashboard: { title: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
  products: { title: 'Products', icon: ShoppingBag, href: '/products' },
  inventory: { title: 'Inventory', icon: Boxes, href: '/inventory' },
  reports: { title: 'Reports', icon: BarChart3, href: '/reports' },
  'stock-movements': {
    title: 'Stock Movements',
    icon: ArrowLeftRight,
    href: '/stock-movements',
  },
  branches: { title: 'Branches', icon: BarChart3, href: '/branches' },
  categories: { title: 'Categories', icon: BarChart3, href: '/categories' },
  staff: { title: 'Staff Management', icon: BarChart3, href: '/staff' },
} as const satisfies Record<string, NavItem>

export type NavLinks = typeof navLinks
export type NavKey = keyof typeof navLinks
