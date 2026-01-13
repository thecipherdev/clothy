import { Link, useLocation } from '@tanstack/react-router';
// import { useAuth } from '@/hooks/useAuth';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import {
  Package,
  LayoutDashboard,
  Store,
  ShoppingBag,
  Boxes,
  ArrowLeftRight,
  BarChart3,
  Users,
  LogOut,
  FolderTree,
} from 'lucide-react';

const mainMenuItems = [
  { title: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
  { title: 'Products', icon: ShoppingBag, href: '/products' },
  { title: 'Inventory', icon: Boxes, href: '/inventory' },
  { title: 'Stock Movements', icon: ArrowLeftRight, href: '/movements' },
  { title: 'Reports', icon: BarChart3, href: '/reports' },
];

const adminMenuItems = [
  { title: 'Branches', icon: Store, href: '/branches' },
  { title: 'Categories', icon: FolderTree, href: '/categories' },
  { title: 'Staff', icon: Users, href: '/staff' },
];

export function AppSidebar() {
  const location = useLocation();
  // const { signOut, role, user } = useAuth();


  function signOut() {
    console.log('signout')
  }

  const isActive = (href: string) => location.pathname === href;

  return (
    <Sidebar>
      <SidebarHeader className="border-b px-6 py-4">
        <Link to="/dashboard" className="flex items-center gap-2">
          <div className="p-2 bg-primary rounded-lg">
            <Package className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-semibold text-lg">Inventory</span>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Main Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.href)}>
                    <Link to={item.href}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {true && (
          <SidebarGroup>
            <SidebarGroupLabel>Admin</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminMenuItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive(item.href)}>
                      <Link to={item.href}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="border-t p-4">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-sm font-medium">{'email.com'}</span>
            <span className="text-xs text-muted-foreground capitalize">{'admin'}</span>
          </div>
          <Button variant="ghost" size="icon" onClick={signOut}>
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
