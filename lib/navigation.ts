/**
 * Navigation Configuration
 * Permission-based navigation filtering for RBAS
 */

import { hasAnyPermission } from '@/lib/permissions';
import type { User } from '@/types';
import type { PermissionKey } from '@/types/permissions';
import {
  LayoutDashboard,
  Users,
  Building2,
  FolderOpen,
  CheckSquare,
  DollarSign,
  ShoppingCart,
  Calendar,
  Shield,
  FileSpreadsheet,
  Upload,
  Award,
  MessageSquare,
} from "lucide-react";

export interface NavigationItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  permissions?: PermissionKey[]; // Empty array means always accessible when authenticated
  children?: NavigationItem[];
}

/**
 * Navigation configuration with permission requirements
 */
export const navigationConfig: NavigationItem[] = [
  // Dashboard - Always accessible to authenticated users
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    href: '/dashboard',
    permissions: [], // Empty array means always accessible when authenticated
  },
  // Events
  {
    id: 'events',
    label: 'Events',
    icon: Calendar,
    href: '/events',
    permissions: ['view_event'],
  },
  // Users Module
  {
    id: 'users',
    label: 'Users',
    icon: Users,
    href: '/users',
    permissions: ['view_user'],
  },
  // MDAs Module
  {
    id: 'mdas',
    label: 'MDAs',
    icon: Building2,
    href: '/mdas',
    permissions: ['view_mda'],
  },
  // Projects Module
  {
    id: 'projects',
    label: 'Projects',
    icon: FolderOpen,
    href: '/projects',
    permissions: ['view_project'],
  },
  // Submissions Module
  {
    id: 'submissions',
    label: 'Submissions',
    icon: CheckSquare,
    href: '/submissions',
    permissions: ['view_submission'],
  },
  // Budget Module
  {
    id: 'budget',
    label: 'Budget',
    icon: Upload,
    href: '/budget',
    permissions: ['view_budget'],
  },
  // Expenditure Module
  {
    id: 'expenditure',
    label: 'Expenditure',
    icon: DollarSign,
    href: '/expenditure',
    permissions: ['view_expenditure'],
  },
  // Revenue Module
  {
    id: 'revenue',
    label: 'Revenue',
    icon: DollarSign,
    href: '/revenue',
    permissions: ['view_revenue'],
  },
  // Tenders Module
  {
    id: 'tenders',
    label: 'Tenders',
    icon: ShoppingCart,
    href: '/tenders',
    permissions: ['view_tender'],
  },
  // Awards Module
  {
    id: 'awards',
    label: 'Awards',
    icon: Award,
    href: '/awards',
    permissions: ['view_award'],
  },
  // Contract Module
  {
    id: 'contract',
    label: 'Contract',
    icon: Award,
    href: '/contract',
    permissions: ['view_contract'],
  },
  // Meetings Module
  {
    id: 'meetings',
    label: 'Meetings',
    icon: Calendar,
    href: '/meetings',
    permissions: ['view_meeting'],
  },
  // Audit Module
  {
    id: 'audit',
    label: 'Audit',
    icon: Shield,
    href: '/audit',
    permissions: ['view_audit'],
  },
  // Reports Module
  {
    id: 'reports',
    label: 'Reports',
    icon: FileSpreadsheet,
    href: '/reports',
    permissions: ['view_dashboard'], // Use dashboard view permission for reports
  },
  // AI Assistant Module
  {
    id: 'ai-assistant',
    label: 'AI Assistant',
    icon: MessageSquare,
    href: '/ai-assistant',
    permissions: ['view_ai_assistant'],
  },
];

/**
 * Get navigation items filtered by user permissions
 * 
 * @param user - User object or null
 * @returns Filtered array of navigation items user can access
 */
export function getNavigationForPermissions(
  user: User | null
): NavigationItem[] {
  if (!user) {
    return [];
  }

  return navigationConfig
    .filter(item => {
      // Dashboard is always available to authenticated users
      if (item.id === 'dashboard') {
        return true;
      }

      // If no permissions required, show item (shouldn't happen but safety check)
      if (!item.permissions || item.permissions.length === 0) {
        return false;
      }

      // User needs at least one of the required permissions
      return hasAnyPermission(user, item.permissions);
    })
    .map(item => {
      // Recursively filter children
      if (item.children && item.children.length > 0) {
        return {
          ...item,
          children: item.children.filter(child => {
            if (!child.permissions || child.permissions.length === 0) {
              return false;
            }
            return hasAnyPermission(user, child.permissions);
          }),
        };
      }
      return item;
    })
    .filter(item => {
      // Remove parent items that have no visible children
      if (item.children && item.children.length === 0) {
        return false;
      }
      return true;
    });
}

