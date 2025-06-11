
import React from 'react';
import { useAuth } from '@/contexts/auth';
import { Outlet, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarProvider, SidebarGroup, SidebarGroupContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar';
import { ShoppingCart, Package, Clock, FileText, User, LogOut, Settings, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from "@/lib/utils";

export const PosLayout: React.FC = () => {
  const { user, loading, initialized, isAuthorized, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  console.log("PosLayout - Auth State:", { user: user?.email, loading, initialized });
  
  // Wait for auth state to be fully initialized before making any decisions
  if (!initialized || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading authentication...</p>
      </div>
    );
  }
  
  // If no user is logged in after initialization, redirect to login
  if (!user && initialized) {
    console.log("No authenticated user found in PosLayout, redirecting to login");
    return <Navigate to="/login" replace />;
  }

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  // Check if user is owner for certain menu items
  const isOwner = user?.role === 'owner';

  // Main layout for authenticated users
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <Sidebar className="h-screen">
          <SidebarHeader className="p-4 flex items-center">
            <div className="text-sidebar-foreground text-2xl font-bold">
              SEBLAK LISTYANING
            </div>
          </SidebarHeader>
          
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={location.pathname === '/pos'}>
                      <Button 
                        variant="ghost" 
                        className={cn("w-full justify-start", location.pathname === '/pos' && "bg-accent text-accent-foreground")}
                        onClick={() => navigate('/pos')}
                      >
                        <ShoppingCart className="mr-2 h-5 w-5" />
                        <span>POS</span>
                      </Button>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  
                  {isAuthorized(['owner', 'warehouse_admin']) && (
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild isActive={location.pathname === '/inventory'}>
                        <Button 
                          variant="ghost" 
                          className={cn("w-full justify-start", location.pathname === '/inventory' && "bg-accent text-accent-foreground")}
                          onClick={() => navigate('/inventory')}
                        >
                          <Package className="mr-2 h-5 w-5" />
                          <span>Inventory</span>
                        </Button>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )}
                  
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={location.pathname === '/receipts'}>
                      <Button 
                        variant="ghost" 
                        className={cn("w-full justify-start", location.pathname === '/receipts' && "bg-accent text-accent-foreground")}
                        onClick={() => navigate('/receipts')}
                      >
                        <FileText className="mr-2 h-5 w-5" />
                        <span>Receipts</span>
                      </Button>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={location.pathname === '/shifts'}>
                      <Button 
                        variant="ghost" 
                        className={cn("w-full justify-start", location.pathname === '/shifts' && "bg-accent text-accent-foreground")}
                        onClick={() => navigate('/shifts')}
                      >
                        <Clock className="mr-2 h-5 w-5" />
                        <span>Shifts</span>
                      </Button>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  
                  {isOwner && (
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild isActive={location.pathname === '/customers'}>
                        <Button 
                          variant="ghost" 
                          className={cn("w-full justify-start", location.pathname === '/customers' && "bg-accent text-accent-foreground")}
                          onClick={() => navigate('/customers')}
                        >
                          <Users className="mr-2 h-5 w-5" />
                          <span>Customers</span>
                        </Button>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )}
                  
                  {isOwner && (
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild isActive={location.pathname === '/settings'}>
                        <Button 
                          variant="ghost" 
                          className={cn("w-full justify-start", location.pathname === '/settings' && "bg-accent text-accent-foreground")}
                          onClick={() => navigate('/settings')}
                        >
                          <Settings className="mr-2 h-5 w-5" />
                          <span>Settings</span>
                        </Button>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )}
                  
                  {isOwner && (
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild isActive={location.pathname === '/users'}>
                        <Button 
                          variant="ghost" 
                          className={cn("w-full justify-start", location.pathname === '/users' && "bg-accent text-accent-foreground")}
                          onClick={() => navigate('/users')}
                        >
                          <User className="mr-2 h-5 w-5" />
                          <span>Users</span>
                        </Button>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          
          <SidebarFooter className="p-4 border-t border-sidebar-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-sidebar-accent flex items-center justify-center text-sidebar-accent-foreground">
                  {user?.firstName?.[0] || user?.email?.[0]?.toUpperCase() || '?'}
                </div>
                <div className="ml-2">
                  <p className="text-sm font-medium text-sidebar-foreground">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-xs text-sidebar-foreground/70 capitalize">
                    {user?.role.replace('_', ' ')}
                  </p>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleSignOut} 
                className="text-sidebar-foreground/70 hover:text-sidebar-foreground"
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </SidebarFooter>
        </Sidebar>
        
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </SidebarProvider>
  );
};
