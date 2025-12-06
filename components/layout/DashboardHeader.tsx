'use client';

/**
 * Dashboard Header - Modern header component with search, notifications, and user menu
 * Fresh design with improved visual hierarchy and spacing
 */

import { User } from '@/types';
import { getRoleDisplayName } from '@/lib/auth';
import { Bell, Search, User as UserIcon, LogOut, Settings, ChevronDown, Menu } from 'lucide-react';
import {
  SidebarTrigger,
} from '@/components/ui/sidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar';
import {
  Button,
} from '@/components/ui/button';
import {
  Input,
} from '@/components/ui/input';
import {
  Badge,
} from '@/components/ui/badge';

interface DashboardHeaderProps {
  user: User;
  onLogout?: () => void;
}

export function DashboardHeader({ user, onLogout }: DashboardHeaderProps) {
  const handleLogout = () => {
    onLogout?.();
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center gap-4 px-6">
        {/* Left Section - Sidebar Trigger & Branding */}
        <div className="flex items-center gap-4 flex-shrink-0">
          <SidebarTrigger className="h-9 w-9 rounded-md border border-border/40 hover:bg-accent/80 transition-all duration-200 hover:border-primary/30">
            <Menu className="h-4 w-4" />
          </SidebarTrigger>
          
          <div className="hidden md:flex items-center gap-3">
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <div className="h-2 w-2 rounded-full bg-primary animate-pulse"></div>
                <div className="absolute inset-0 h-2 w-2 rounded-full bg-primary/40 animate-ping"></div>
              </div>
              <h1 className="text-xl font-bold tracking-tight">
                E-Track
              </h1>
            </div>
            <div className="h-4 w-px bg-border/60"></div>
            <span className="text-sm text-muted-foreground font-medium">
              {getRoleDisplayName(user.role)}
            </span>
          </div>
        </div>

        {/* Center Section - Search */}
        <div className="flex-1 max-w-2xl mx-8">
          <div className="relative group">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input
              type="text"
              placeholder="Search projects, users, or documents..."
              className="pl-10 pr-4 h-10 w-full rounded-lg border-border/60 bg-muted/30 focus:bg-background focus:border-primary/50 transition-all duration-200 placeholder:text-muted-foreground/60"
            />
          </div>
        </div>

        {/* Right Section - Actions */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="relative h-10 w-10 rounded-lg hover:bg-accent/80 transition-all duration-200 hover:scale-105 active:scale-95"
              >
                <Bell className="h-4.5 w-4.5" />
                <Badge 
                  variant="destructive" 
                  className="absolute -top-0.5 -right-0.5 h-5 w-5 p-0 flex items-center justify-center text-[10px] font-semibold border-2 border-background"
                >
                  3
                </Badge>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 mt-2">
              <DropdownMenuLabel className="text-base font-semibold">Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="space-y-1.5 p-2 max-h-[400px] overflow-y-auto">
                <div className="rounded-lg bg-blue-50/80 dark:bg-blue-950/50 p-3 border border-blue-200/50 dark:border-blue-800/50 hover:bg-blue-100/80 dark:hover:bg-blue-900/50 transition-colors cursor-pointer">
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-100">New project submission requires approval</p>
                  <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">2 minutes ago</p>
                </div>
                <div className="rounded-lg bg-green-50/80 dark:bg-green-950/50 p-3 border border-green-200/50 dark:border-green-800/50 hover:bg-green-100/80 dark:hover:bg-green-900/50 transition-colors cursor-pointer">
                  <p className="text-sm font-medium text-green-900 dark:text-green-100">Budget report generated successfully</p>
                  <p className="text-xs text-green-700 dark:text-green-300 mt-1">1 hour ago</p>
                </div>
                <div className="rounded-lg bg-yellow-50/80 dark:bg-yellow-950/50 p-3 border border-yellow-200/50 dark:border-yellow-800/50 hover:bg-yellow-100/80 dark:hover:bg-yellow-900/50 transition-colors cursor-pointer">
                  <p className="text-sm font-medium text-yellow-900 dark:text-yellow-100">Meeting scheduled for tomorrow</p>
                  <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">3 hours ago</p>
                </div>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                className="flex items-center gap-2.5 px-3 py-2 h-10 rounded-lg hover:bg-accent/80 transition-all duration-200 hover:scale-105 active:scale-95"
              >
                <Avatar className="h-7 w-7 border-2 border-primary/20">
                  <AvatarImage src="" alt={user.name} />
                  <AvatarFallback className="bg-gradient-to-br from-primary via-primary/90 to-primary/70 text-primary-foreground font-semibold text-xs">
                    {getInitials(user.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden lg:block text-left">
                  <p className="text-sm font-semibold leading-tight">{user.name}</p>
                  <p className="text-xs text-muted-foreground leading-tight">{getRoleDisplayName(user.role)}</p>
                </div>
                <ChevronDown className="h-4 w-4 text-muted-foreground ml-1 transition-transform duration-200" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 mt-2">
              <DropdownMenuLabel className="p-3">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-semibold">{user.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer">
                <UserIcon className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={handleLogout} 
                className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sign out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

