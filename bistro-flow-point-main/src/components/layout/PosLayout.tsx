
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth';
import { Outlet, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarProvider, SidebarGroup, SidebarGroupContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarTrigger } from '@/components/ui/sidebar';
import { ShoppingCart, Package, Clock, FileText, User, LogOut, Settings, Users, BarChart3, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from "@/lib/utils";

export const PosLayout: React.FC = () => {
  const { user, loading, initialized, isAuthorized, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  console.log("PosLayout - Auth State:", { user: user?.email, loading, initialized });

  // Check if screen is mobile size
  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 768; // md breakpoint
      setIsMobile(mobile);
      // Auto-close sidebar on mobile, keep open on desktop
      if (mobile) {
        setSidebarOpen(false);
      } else {
        // On desktop, restore sidebar state from localStorage or default to open
        const savedState = localStorage.getItem('sidebarOpen');
        setSidebarOpen(savedState ? JSON.parse(savedState) : true);
      }
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Save sidebar state to localStorage when it changes (only for desktop)
  useEffect(() => {
    if (!isMobile) {
      localStorage.setItem('sidebarOpen', JSON.stringify(sidebarOpen));
    }
  }, [sidebarOpen, isMobile]);

  // Close sidebar when navigating on mobile
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [location.pathname, isMobile]);

  // Keyboard shortcut for toggling sidebar (Ctrl/Cmd + B)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 'b') {
        event.preventDefault();
        toggleSidebar();
      }
      // ESC to close sidebar on mobile
      if (event.key === 'Escape' && isMobile && sidebarOpen) {
        setSidebarOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isMobile, sidebarOpen]);
  
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

  // Toggle sidebar
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Check if user is owner for certain menu items
  const isOwner = user?.role === 'owner';

  // Main layout for authenticated users
  return (
    <TooltipProvider>
      <SidebarProvider>
        <div className="h-screen flex w-full overflow-hidden">
        {/* Mobile Overlay */}
        {isMobile && sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <div className={cn(
          "transition-all duration-300 ease-in-out shrink-0",
          "fixed left-0 top-0 h-full z-50 md:relative md:z-auto",
          sidebarOpen ? "translate-x-0 md:w-64" : "-translate-x-full md:w-0",
          isMobile && "w-64"
        )}>
          <Sidebar className={cn(
            "h-full border-r bg-background transition-all duration-300",
            sidebarOpen ? "w-64" : "w-0 md:w-0 overflow-hidden"
          )}>
            <SidebarHeader className="p-4 flex items-center justify-between border-b">
              <div className="text-sidebar-foreground text-xl font-bold truncate">
                SEBLAK LISTYANING
              </div>
              {/* Close button for mobile */}
              {isMobile && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSidebarOpen(false)}
                  className="md:hidden shrink-0 ml-2"
                >
                  <X className="h-5 w-5" />
                </Button>
              )}
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

                  {isAuthorized(['owner', 'warehouse_admin']) && (
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild isActive={location.pathname === '/purchases'}>
                        <Button
                          variant="ghost"
                          className={cn("w-full justify-start", location.pathname === '/purchases' && "bg-accent text-accent-foreground")}
                          onClick={() => navigate('/purchases')}
                        >
                          <ShoppingCart className="mr-2 h-5 w-5" />
                          <span>Purchases</span>
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
                      <SidebarMenuButton asChild isActive={location.pathname === '/dashboard'}>
                        <Button
                          variant="ghost"
                          className={cn("w-full justify-start", location.pathname === '/dashboard' && "bg-accent text-accent-foreground")}
                          onClick={() => navigate('/dashboard')}
                        >
                          <BarChart3 className="mr-2 h-5 w-5" />
                          <span>Dashboard</span>
                        </Button>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )}

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
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col h-screen">
          {/* Top Bar with Menu Toggle */}
          <header className="flex items-center justify-between p-4 border-b bg-background shrink-0">
            <div className="flex items-center gap-4">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleSidebar}
                    className="shrink-0"
                  >
                    <Menu className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Toggle Sidebar (Ctrl+B)</p>
                </TooltipContent>
              </Tooltip>
              <h1 className="text-lg font-semibold">
                {location.pathname === '/pos' && 'Point of Sale'}
                {location.pathname === '/dashboard' && 'Dashboard Owner'}
                {location.pathname === '/inventory' && 'Inventory Management'}
                {location.pathname === '/purchases' && 'Purchase Management'}
                {location.pathname === '/receipts' && 'Receipts'}
                {location.pathname === '/shifts' && 'Shift Management'}
                {location.pathname === '/customers' && 'Customer Management'}
                {location.pathname === '/users' && 'User Management'}
                {location.pathname === '/settings' && 'Settings'}
              </h1>
            </div>

            {/* User Info in Top Bar */}
            <div className="flex items-center gap-2">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-muted-foreground capitalize">
                  {user?.role.replace('_', ' ')}
                </p>
              </div>
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                {user?.firstName?.[0] || user?.email?.[0]?.toUpperCase() || '?'}
              </div>
            </div>
          </header>

          {/* Main Content Area */}
          <main className="flex-1 overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  </TooltipProvider>
  );
};
