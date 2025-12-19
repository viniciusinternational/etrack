"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import {
  ALL_PERMISSION_KEYS,
  getModuleFromPermissionKey,
  PermissionKey,
  UserPermissions,
} from "@/types/permissions";
import { UserRole } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

interface RolePermissionTemplate {
  id: string;
  role: UserRole;
  permissions: UserPermissions;
  description?: string;
}

export default function PermissionsPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<string>(UserRole.Admin);
  const [templates, setTemplates] = useState<Record<string, RolePermissionTemplate>>({});
  const [modifiedTemplates, setModifiedTemplates] = useState<Record<string, UserPermissions>>({});

  // Group permissions by module
  const permissionsByModule = ALL_PERMISSION_KEYS.reduce((acc, key) => {
    const module = getModuleFromPermissionKey(key);
    if (!acc[module]) {
      acc[module] = [];
    }
    acc[module].push(key);
    return acc;
  }, {} as Record<string, PermissionKey[]>);

  const modules = Object.keys(permissionsByModule).sort();

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/permissions/templates");
      const data = await res.json();
      
      if (data.ok) {
        const templatesMap: Record<string, RolePermissionTemplate> = {};
        const modifiedMap: Record<string, UserPermissions> = {};
        
        data.data.forEach((t: RolePermissionTemplate) => {
          templatesMap[t.role] = t;
          modifiedMap[t.role] = { ...t.permissions };
        });

        // Initialize missing roles with empty permissions
        Object.values(UserRole).forEach((role) => {
          if (!templatesMap[role]) {
            templatesMap[role] = {
              id: "",
              role,
              permissions: {} as UserPermissions,
            };
            modifiedMap[role] = {};
          }
        });

        setTemplates(templatesMap);
        setModifiedTemplates(modifiedMap);
      } else {
        toast.error("Failed to load permission templates");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error loading templates");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePermissionToggle = (role: string, key: PermissionKey, checked: boolean) => {
    setModifiedTemplates((prev) => ({
      ...prev,
      [role]: {
        ...prev[role],
        [key]: checked,
      },
    }));
  };

  const handleSelectAllInModule = (role: string, module: string, checked: boolean) => {
    const modulePermissions = permissionsByModule[module];
    setModifiedTemplates((prev) => {
      const newPermissions = { ...prev[role] };
      modulePermissions.forEach((key) => {
        newPermissions[key] = checked;
      });
      return {
        ...prev,
        [role]: newPermissions,
      };
    });
  };

  const saveChanges = async () => {
    try {
      setIsSaving(true);
      const role = activeTab;
      const permissions = modifiedTemplates[role];

      const res = await fetch("/api/permissions/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role,
          permissions,
        }),
      });

      const data = await res.json();
      if (data.ok) {
        toast.success(`Permissions for ${role} saved successfully`);
        // Update local state to reflect saved
        setTemplates((prev) => ({
          ...prev,
          [role]: {
            ...prev[role],
            permissions: { ...permissions },
          },
        }));
      } else {
        toast.error(data.message || "Failed to save changes");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error saving changes");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/users")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Role Permissions</h1>
            <p className="text-muted-foreground mt-1">
              Manage default permission templates for user roles
            </p>
          </div>
        </div>
        <Button onClick={saveChanges} disabled={isSaving}>
          {isSaving ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          Save Changes
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="overflow-x-auto pb-2">
            <TabsList className="w-max justify-start mb-4">
            {Object.values(UserRole).map((role) => (
                <TabsTrigger key={role} value={role} className="min-w-[100px]">
                {role}
                </TabsTrigger>
            ))}
            </TabsList>
        </div>

        {Object.values(UserRole).map((role) => (
          <TabsContent key={role} value={role} className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>{role} Permissions</CardTitle>
                <CardDescription>
                  Configure what users with the {role} role can do by default.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                {modules.map((module) => {
                    const moduleKeys = permissionsByModule[module];
                    const allSelected = moduleKeys.every(key => modifiedTemplates[role]?.[key]);
                    const someSelected = moduleKeys.some(key => modifiedTemplates[role]?.[key]);
                    
                    return (
                    <div key={module} className="space-y-4">
                        <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold capitalize border-l-4 border-primary pl-3">
                            {module.replace(/_/g, " ")} Module
                        </h3>
                        <div className="flex items-center gap-2">
                            <Checkbox 
                                id={`select-all-${role}-${module}`}
                                checked={allSelected}
                                onCheckedChange={(checked) => handleSelectAllInModule(role, module, !!checked)}
                            />
                            <Label htmlFor={`select-all-${role}-${module}`} className="text-sm text-muted-foreground cursor-pointer">
                                Select All
                            </Label>
                        </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {moduleKeys.map((key) => (
                            <div
                            key={key}
                            className="flex items-start space-x-3 p-3 rounded-md border bg-card hover:bg-accent/50 transition-colors"
                            >
                            <Checkbox
                                id={`${role}-${key}`}
                                checked={modifiedTemplates[role]?.[key] || false}
                                onCheckedChange={(checked) =>
                                handlePermissionToggle(role, key, !!checked)
                                }
                            />
                            <div className="grid gap-1.5 leading-none">
                                <Label
                                htmlFor={`${role}-${key}`}
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                >
                                {key}
                                </Label>
                            </div>
                            </div>
                        ))}
                        </div>
                        <Separator />
                    </div>
                    );
                })}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
