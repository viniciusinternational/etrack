"use client";

import { useState, useMemo } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { PermissionModule, getPermissionsByModule } from "@/lib/permission-constants";
import { useAllPermissions } from "@/hooks/use-permissions";

interface PermissionSelectorProps {
  selectedPermissionIds: string[];
  onSelectionChange: (permissionIds: string[]) => void;
  disabled?: boolean;
}

export function PermissionSelector({
  selectedPermissionIds,
  onSelectionChange,
  disabled = false,
}: PermissionSelectorProps) {
  const { data: allPermissions, isLoading } = useAllPermissions();
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState("");

  const permissionsByModule = useMemo(() => {
    if (!allPermissions) return {};
    
    const grouped: Record<string, typeof allPermissions> = {};
    allPermissions.forEach((perm) => {
      if (!grouped[perm.module]) {
        grouped[perm.module] = [];
      }
      grouped[perm.module].push(perm);
    });
    
    return grouped;
  }, [allPermissions]);

  const filteredModules = useMemo(() => {
    if (!searchTerm) return permissionsByModule;
    
    const filtered: Record<string, typeof allPermissions> = {};
    const searchLower = searchTerm.toLowerCase();
    
    Object.entries(permissionsByModule).forEach(([module, perms]) => {
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
  }, [permissionsByModule, searchTerm]);

  const toggleModule = (module: string) => {
    const newExpanded = new Set(expandedModules);
    if (newExpanded.has(module)) {
      newExpanded.delete(module);
    } else {
      newExpanded.add(module);
    }
    setExpandedModules(newExpanded);
  };

  const togglePermission = (permissionId: string) => {
    if (disabled) return;
    
    const newSelection = selectedPermissionIds.includes(permissionId)
      ? selectedPermissionIds.filter((id) => id !== permissionId)
      : [...selectedPermissionIds, permissionId];
    
    onSelectionChange(newSelection);
  };

  const selectAllInModule = (module: string) => {
    if (disabled) return;
    
    const modulePerms = filteredModules[module] || [];
    const modulePermissionIds = modulePerms.map((p) => p.id);
    const allSelected = modulePermissionIds.every((id) => selectedPermissionIds.includes(id));
    
    if (allSelected) {
      // Deselect all in module
      onSelectionChange(selectedPermissionIds.filter((id) => !modulePermissionIds.includes(id)));
    } else {
      // Select all in module
      const newSelection = [...selectedPermissionIds];
      modulePermissionIds.forEach((id) => {
        if (!newSelection.includes(id)) {
          newSelection.push(id);
        }
      });
      onSelectionChange(newSelection);
    }
  };

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
    return <div className="text-sm text-muted-foreground">Loading permissions...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search permissions..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="space-y-2 max-h-[400px] overflow-y-auto">
        {Object.entries(filteredModules)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([module, perms]) => {
            const isExpanded = expandedModules.has(module);
            const modulePermissionIds = perms.map((p) => p.id);
            const selectedCount = modulePermissionIds.filter((id) =>
              selectedPermissionIds.includes(id)
            ).length;
            const allSelected = selectedCount === modulePermissionIds.length;
            const someSelected = selectedCount > 0 && selectedCount < modulePermissionIds.length;

            return (
              <Card key={module} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={allSelected}
                        ref={(el) => {
                          if (el) {
                            (el as any).indeterminate = someSelected;
                          }
                        }}
                        onCheckedChange={() => selectAllInModule(module)}
                        disabled={disabled}
                      />
                      <CardTitle className="text-base">{module}</CardTitle>
                      <Badge variant="secondary" className="text-xs">
                        {selectedCount}/{modulePermissionIds.length}
                      </Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleModule(module)}
                      className="h-8 w-8 p-0"
                    >
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </CardHeader>
                {isExpanded && (
                  <CardContent className="pt-0">
                    <div className="space-y-2">
                      {perms
                        .sort((a, b) => a.action.localeCompare(b.action))
                        .map((perm) => (
                          <div
                            key={perm.id}
                            className="flex items-start gap-2 p-2 rounded-md hover:bg-accent/50"
                          >
                            <Checkbox
                              id={`perm-${perm.id}`}
                              checked={selectedPermissionIds.includes(perm.id)}
                              onCheckedChange={() => togglePermission(perm.id)}
                              disabled={disabled}
                              className="mt-1"
                            />
                            <div className="flex-1 min-w-0">
                              <Label
                                htmlFor={`perm-${perm.id}`}
                                className="flex items-center gap-2 cursor-pointer"
                              >
                                <Badge variant={getActionBadgeVariant(perm.action)} className="text-xs">
                                  {perm.action}
                                </Badge>
                                <span className="text-sm font-medium">
                                  {perm.module}.{perm.action}
                                </span>
                              </Label>
                              {perm.description && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  {perm.description}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}
      </div>

      <div className="text-sm text-muted-foreground">
        {selectedPermissionIds.length} permission{selectedPermissionIds.length !== 1 ? "s" : ""} selected
      </div>
    </div>
  );
}

