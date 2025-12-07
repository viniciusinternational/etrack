"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft, ShieldAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getActionFromPermissionKey, getModuleFromPermissionKey } from "@/types/permissions";
import type { PermissionKey } from "@/types/permissions";

export default function ForbiddenPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Get required permissions from query params if available
  const requiredPermissionsParam = searchParams.get("permissions");
  let requiredPermissions: PermissionKey[] = [];
  
  if (requiredPermissionsParam) {
    try {
      requiredPermissions = JSON.parse(requiredPermissionsParam) as PermissionKey[];
    } catch (e) {
      console.error("Failed to parse permissions from query params:", e);
    }
  }

  const formatPermissionKey = (key: PermissionKey): string => {
    const action = getActionFromPermissionKey(key);
    const module = getModuleFromPermissionKey(key);
    return `${action.charAt(0).toUpperCase() + action.slice(1)} ${module.charAt(0).toUpperCase() + module.slice(1)}`;
  };

  const handleDashboard = () => {
    router.push("/dashboard");
  };

  const handleGoBack = () => {
    router.back();
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <Card className="max-w-2xl w-full">
        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <ShieldAlert className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <CardTitle className="text-2xl">Access Forbidden</CardTitle>
              <CardDescription className="mt-1">
                You don't have the required permissions to access this resource.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <p className="text-sm text-muted-foreground mb-4">
              Your account does not have the necessary permissions to perform this action. 
              Please contact your administrator if you believe you should have access.
            </p>
            
            {requiredPermissions.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium mb-2">Required Permissions:</p>
                <div className="flex flex-wrap gap-2">
                  {requiredPermissions.map((permission) => (
                    <Badge key={permission} variant="outline" className="text-xs">
                      {formatPermissionKey(permission)}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t">
            <Button onClick={handleGoBack} variant="outline" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Go Back
            </Button>
            <Button onClick={handleDashboard} className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              Go to Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

