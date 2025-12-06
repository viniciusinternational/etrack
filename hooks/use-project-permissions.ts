import { useMemo } from "react";
import { PermissionModule, PermissionAction } from "@/lib/permission-constants";
import { useUserPermissions } from "@/hooks/use-users";
import { useAuthStore } from "@/store/auth-store";

export function useProjectPermissions() {
  const { user } = useAuthStore();
  const { data: userPermissionsData } = useUserPermissions(user?.id || "");

  return useMemo(() => {
    if (!userPermissionsData || !user) {
      return {
        canCreate: false,
        canRead: false,
        canUpdate: false,
        canDelete: false,
        canExport: false,
        canManage: false,
      };
    }

    // Get PROJECT module permissions from allPermissions array
    const projectPermissions = userPermissionsData.allPermissions.filter(
      (p) => p.module === PermissionModule.PROJECT && p.assigned
    );

    // Check if user has specific permissions
    const hasPermission = (action: PermissionAction): boolean => {
      return projectPermissions.some((p) => p.action === action);
    };

    return {
      canCreate: hasPermission(PermissionAction.CREATE),
      canRead: hasPermission(PermissionAction.READ),
      canUpdate: hasPermission(PermissionAction.UPDATE),
      canDelete: hasPermission(PermissionAction.DELETE),
      canExport: hasPermission(PermissionAction.EXPORT),
      canManage: hasPermission(PermissionAction.MANAGE),
    };
  }, [userPermissionsData, user]);
}

