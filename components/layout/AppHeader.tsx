'use client';

/**
 * App Header using shadcn/ui components
 * Top navigation with user menu and notifications
 */


import { User } from '@/types';
import { getRoleDisplayName } from '@/lib/auth';
import { Bell, Search, User as UserIcon, LogOut, Settings, ChevronDown } from 'lucide-react';
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

interface AppHeaderProps {
  user: User;
  onLogout?: () => void;
}

export function AppHeader({ user, onLogout }: AppHeaderProps) {


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
    <header className="flex h-16 shrink-0 items-center gap-2 border-b border-border/50 bg-background/95 backdrop-blur-sm shadow-sm px-4">
      <div className="flex items-center gap-3">
        <SidebarTrigger className="-ml-1 h-9 w-9 rounded-lg hover:bg-accent/50 transition-colors duration-200" />
        
        <div className="hidden lg:block">
          <div className="flex items-center gap-2">
            <div className="h-1 w-1 rounded-full bg-green-500 animate-pulse"></div>
            <h1 className="text-lg font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
              E-Track
            </h1>
          </div>
          <p className="text-xs text-muted-foreground font-medium">{getRoleDisplayName(user.role)}</p>
        </div>
      </div>

      {/* Search */}
      <div className="flex-1 max-w-md mx-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search..."
            className="pl-10 h-10 rounded-xl border-border/50 bg-background/50 backdrop-blur-sm focus:bg-background transition-all duration-200"
          />
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2">
        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="relative h-10 w-10 rounded-xl hover:bg-accent/50 transition-all duration-200 hover:shadow-md hover:shadow-primary/10"
            >
              <Bell className="h-4 w-4" />
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs bg-gradient-to-r from-red-500 to-red-600 shadow-sm"
              >
                3
              </Badge>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="space-y-2 p-2">
              <div className="rounded-md bg-blue-50 p-3 dark:bg-blue-950">
                <p className="text-sm text-blue-800 dark:text-blue-200">New project submission requires approval</p>
                <p className="text-xs text-blue-600 dark:text-blue-400">2 minutes ago</p>
              </div>
              <div className="rounded-md bg-green-50 p-3 dark:bg-green-950">
                <p className="text-sm text-green-800 dark:text-green-200">Budget report generated successfully</p>
                <p className="text-xs text-green-600 dark:text-green-400">1 hour ago</p>
              </div>
              <div className="rounded-md bg-yellow-50 p-3 dark:bg-yellow-950">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">Meeting scheduled for tomorrow</p>
                <p className="text-xs text-yellow-600 dark:text-yellow-400">3 hours ago</p>
              </div>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              className="flex items-center gap-3 px-3 py-2 h-11 rounded-xl hover:bg-accent/50 transition-all duration-200 hover:shadow-md hover:shadow-primary/10"
            >
              <Avatar className="h-8 w-8 ring-2 ring-primary/20">
                <AvatarImage src="" alt={user.name} />
                <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground font-semibold">
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>
              <div className="hidden md:block text-left">
                <p className="text-sm font-semibold">{user.name}</p>
                <p className="text-xs text-muted-foreground">{getRoleDisplayName(user.role)}</p>
              </div>
              <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform duration-200" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">{user.name}</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <UserIcon className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-red-600">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sign out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
