"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShieldAlert, ArrowLeft, Home } from "lucide-react";
import { useRouter } from "next/navigation";
import { getActionFromPermissionKey, getModuleFromPermissionKey } from "@/types/permissions";
import type { PermissionKey } from "@/types/permissions";

interface PermissionErrorProps {
  requiredPermissions?: PermissionKey[];
  message?: string;
  showNavigation?: boolean;
  onGoBack?: () => void;
  onGoHome?: () => void;
}

export function PermissionError({
  requiredPermissions = [],
  message = "You don't have the required permissions to perform this action.",
  showNavigation = true,
  onGoBack,
  onGoHome,
}: PermissionErrorProps) {
  const router = useRouter();

  const formatPermissionKey = (key: PermissionKey): string => {
    const action = getActionFromPermissionKey(key);
    const module = getModuleFromPermissionKey(key);
    return `${action.charAt(0).toUpperCase() + action.slice(1)} ${module.charAt(0).toUpperCase() + module.slice(1)}`;
  };

  const handleGoBack = () => {
    if (onGoBack) {
      onGoBack();
    } else {
      router.back();
    }
  };

  const handleGoHome = () => {
    if (onGoHome) {
      onGoHome();
    } else {
      router.push("/dashboard");
    }
  };

  const handleViewDetails = () => {
    if (requiredPermissions.length > 0) {
      const permissionsParam = encodeURIComponent(JSON.stringify(requiredPermissions));
      router.push(`/forbidden?permissions=${permissionsParam}`);
    } else {
      router.push("/forbidden");
    }
  };

  return (
    <Card className="border-red-200 bg-red-50">
      <CardHeader>
        <div className="flex items-center gap-2">
          <ShieldAlert className="h-5 w-5 text-red-600" />
          <CardTitle className="text-lg text-red-900">Access Forbidden</CardTitle>
        </div>
        <CardDescription className="text-red-700">{message}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {requiredPermissions.length > 0 && (
          <div>
            <p className="text-sm font-medium text-red-900 mb-2">Required Permissions:</p>
            <div className="flex flex-wrap gap-2">
              {requiredPermissions.map((permission) => (
                <Badge key={permission} variant="outline" className="text-xs border-red-300 text-red-800">
                  {formatPermissionKey(permission)}
                </Badge>
              ))}
            </div>
          </div>
        )}
        
        <p className="text-sm text-red-700">
          Please contact your administrator if you believe you should have access to this resource.
        </p>

        {showNavigation && (
          <div className="flex flex-col sm:flex-row gap-2 pt-2">
            {requiredPermissions.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleViewDetails}
                className="border-red-300 text-red-700 hover:bg-red-100"
              >
                View Details
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleGoBack}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Go Back
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleGoHome}
              className="flex items-center gap-2"
            >
              <Home className="h-4 w-4" />
              Go to Dashboard
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

