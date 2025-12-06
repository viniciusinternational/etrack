"use client";

import { useState, useMemo } from "react";
import { Search, Loader2, Shield, CheckCircle2, XCircle } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { usePermissions, useAllPermissions, Permission } from "@/hooks/use-permissions";
import { PermissionModule, getPermissionsByModule } from "@/lib/permission-constants";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function PermissionsPage() {
  const { data: permissionsData, isLoading } = usePermissions();
  const { data: allPermissions } = useAllPermissions();
  const [searchTerm, setSearchTerm] = useState("");

  const permissions = useMemo(() => {
    if (!permissionsData) return {};
    return permissionsData;
  }, [permissionsData]);

  const allPerms = useMemo(() => {
    return allPermissions || [];
  }, [allPermissions]);

  // Filter permissions by search term
  const filteredPermissions = useMemo(() => {
    if (!searchTerm) return permissions;

    const filtered: Record<string, Permission[]> = {};
    const searchLower = searchTerm.toLowerCase();

    Object.entries(permissions).forEach(([module, perms]) => {
      const matching = perms.filter(
        (p) =>
          p.module.toLowerCase().includes(searchLower) ||
          p.action.toLowerCase().includes(searchLower) ||
          p.description?.toLowerCase().includes(searchLower)
      );
      if (matching.length > 0) {
        filtered[module] = matching;
      }
    });

    return filtered;
  }, [permissions, searchTerm]);

  // Statistics
  const stats = useMemo(() => {
    const total = allPerms.length;
    const modules = Object.keys(permissions).length;
    return { total, modules };
  }, [allPerms, permissions]);

  const getActionBadgeVariant = (action: string) => {
    const variants: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
      CREATE: "default",
      READ: "secondary",
      UPDATE: "outline",
      DELETE: "destructive",
      EXPORT: "secondary",
      APPROVE: "default",
      REJECT: "destructive",
      UPLOAD: "outline",
      MANAGE: "default",
    };
    return variants[action] || "secondary";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-6 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Permissions Management</h1>
          <p className="text-muted-foreground mt-1">
            View and manage all system permissions
          </p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Permissions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{stats.total}</div>
            <p className="text-xs text-muted-foreground mt-1">
              All available permissions
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Modules
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{stats.modules}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Permission modules
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search permissions by module, action, or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Permissions List */}
      <Card>
        <CardHeader>
          <CardTitle>All Permissions</CardTitle>
          <CardDescription>
            Permissions organized by module. Click to expand and view details.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {Object.keys(filteredPermissions).length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No permissions found
            </div>
          ) : (
            <Accordion type="single" collapsible className="w-full">
              {Object.entries(filteredPermissions)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([module, perms]) => (
                  <AccordionItem key={module} value={module}>
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center gap-3">
                        <Shield className="h-5 w-5 text-primary" />
                        <span className="font-semibold">{module}</span>
                        <Badge variant="secondary" className="ml-2">
                          {perms.length} permission{perms.length !== 1 ? "s" : ""}
                        </Badge>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2 pt-2">
                        {perms
                          .sort((a, b) => a.action.localeCompare(b.action))
                          .map((perm) => (
                            <div
                              key={perm.id}
                              className="flex items-start justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                            >
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <Badge variant={getActionBadgeVariant(perm.action)}>
                                    {perm.action}
                                  </Badge>
                                  <span className="text-sm font-medium">
                                    {perm.module}.{perm.action}
                                  </span>
                                </div>
                                {perm.description && (
                                  <p className="text-sm text-muted-foreground mt-1">
                                    {perm.description}
                                  </p>
                                )}
                              </div>
                            </div>
                          ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
            </Accordion>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

