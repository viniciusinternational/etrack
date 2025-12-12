"use client";

/**
 * Permissions Editor Component
 * Works with JSON-based permissions (action_module format)
 * 
 * Displays permissions grouped by module with checkboxes
 * Updates permissions in JSON format: { "view_project": true, "create_user": false, ... }
 */

import { useState, useMemo } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import type { PermissionKey, UserPermissions, PartialUserPermissions } from "@/types/permissions";
import { ALL_PERMISSION_KEYS, getModuleFromPermissionKey, getActionFromPermissionKey } from "@/types/permissions";

interface PermissionsEditorProps {
  permissions: PartialUserPermissions;
  onPermissionsChange: (permissions: PartialUserPermissions) => void;
  disabled?: boolean;
}

/**
 * Group permissions by module
 */
function groupPermissionsByModule(permissionKeys: PermissionKey[]): Record<string, PermissionKey[]> {
  const grouped: Record<string, PermissionKey[]> = {};
  
  permissionKeys.forEach((key) => {
    const module = getModuleFromPermissionKey(key);
    if (!grouped[module]) {
      grouped[module] = [];
    }
    grouped[module].push(key);
  });
  
  // Sort permissions within each module by action
  Object.keys(grouped).forEach((module) => {
    grouped[module].sort((a, b) => {
      const actionA = getActionFromPermissionKey(a);
      const actionB = getActionFromPermissionKey(b);
      return actionA.localeCompare(actionB);
    });
  });
  
  return grouped;
}

/**
 * Format module name for display (capitalize first letter)
 */
function formatModuleName(module: string): string {
  return module.charAt(0).toUpperCase() + module.slice(1);
}

/**
 * Format action name for display (capitalize first letter)
 */
function formatActionName(action: string): string {
  return action.charAt(0).toUpperCase() + action.slice(1);
}

export function PermissionsEditor({
  permissions = {},
  onPermissionsChange,
  disabled = false,
}: PermissionsEditorProps) {
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState("");

  // Group all permissions by module
  const permissionsByModule = useMemo(() => {
    return groupPermissionsByModule(ALL_PERMISSION_KEYS);
  }, []);

  // Filter modules based on search term
  const filteredModules = useMemo(() => {
    if (!searchTerm) return permissionsByModule;
    
    const filtered: Record<string, PermissionKey[]> = {};
    const searchLower = searchTerm.toLowerCase();
    
    Object.entries(permissionsByModule).forEach(([module, perms]) => {
      const matching = perms.filter((key) => {
        const moduleName = getModuleFromPermissionKey(key);
        const actionName = getActionFromPermissionKey(key);
        return (
          moduleName.toLowerCase().includes(searchLower) ||
          actionName.toLowerCase().includes(searchLower) ||
          key.toLowerCase().includes(searchLower)
        );
      });
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

  const togglePermission = (permissionKey: PermissionKey) => {
    if (disabled) return;
    
    const newPermissions: PartialUserPermissions = {
      ...permissions,
      [permissionKey]: !permissions[permissionKey],
    };
    
    onPermissionsChange(newPermissions);
  };

  const selectAllInModule = (module: string) => {
    if (disabled) return;
    
    const modulePerms = filteredModules[module] || [];
    const allSelected = modulePerms.every((key) => permissions[key] === true);
    
    const newPermissions: PartialUserPermissions = { ...permissions };
    
    if (allSelected) {
      // Deselect all in module
      modulePerms.forEach((key) => {
        newPermissions[key] = false;
      });
    } else {
      // Select all in module
      modulePerms.forEach((key) => {
        newPermissions[key] = true;
      });
    }
    
    onPermissionsChange(newPermissions);
  };

  const getActionBadgeVariant = (action: string) => {
    const variants: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
      view: "secondary",
      create: "default",
      edit: "outline",
      delete: "destructive",
      export: "secondary",
      approve: "default",
      reject: "destructive",
      upload: "outline",
      manage: "default",
    };
    return variants[action] || "secondary";
  };

  // Calculate statistics
  const totalSelected = useMemo(() => {
    return Object.values(permissions).filter((value) => value === true).length;
  }, [permissions]);

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search permissions by module or action..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
          disabled={disabled}
        />
      </div>

      <div className="space-y-1 max-h-[500px] overflow-y-auto border border-border rounded-lg p-2 bg-background">
        {Object.entries(filteredModules)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([module, perms]) => {
            const isExpanded = expandedModules.has(module);
            const selectedCount = perms.filter((key) => permissions[key] === true).length;
            const allSelected = selectedCount === perms.length && perms.length > 0;
            const someSelected = selectedCount > 0 && selectedCount < perms.length;

            return (
              <div key={module} className="border border-border rounded-md bg-card mb-2 last:mb-0 transition-all hover:bg-accent/5">
                <div 
                  className="flex items-center justify-between p-3 cursor-pointer select-none"
                  onClick={() => toggleModule(module)}
                >
                  <div className="flex items-center gap-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 hover:bg-transparent"
                    >
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
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
                      <span className="font-semibold text-foreground">{formatModuleName(module)}</span>
                    </div>
                    {selectedCount > 0 && (
                       <Badge variant="secondary" className="text-xs bg-secondary/10 text-secondary hover:bg-secondary/20 border-secondary/20">
                         {selectedCount} selected
                       </Badge>
                    )}
                  </div>
                </div>
                
                {isExpanded && (
                  <div className="px-3 pb-3 pt-0 animate-in slide-in-from-top-2 duration-200">
                    <div className="pl-11 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {perms.map((permissionKey) => {
                        const action = getActionFromPermissionKey(permissionKey);
                        const isSelected = permissions[permissionKey] === true;

                        return (
                          <div
                            key={permissionKey}
                            className={`flex items-center gap-2 p-2 rounded-md border transition-colors ${
                              isSelected 
                                ? "bg-primary/5 border-primary/20" 
                                : "bg-background border-border hover:bg-muted/50"
                            }`}
                          >
                            <Checkbox
                              id={`perm-${permissionKey}`}
                              checked={isSelected}
                              onCheckedChange={() => togglePermission(permissionKey)}
                              disabled={disabled}
                            />
                            <Label
                              htmlFor={`perm-${permissionKey}`}
                              className="flex items-center gap-2 cursor-pointer w-full"
                            >
                              <Badge variant={getActionBadgeVariant(action)} className="text-[10px] px-1.5 h-5 capitalize">
                                {action}
                              </Badge>
                              <span className={`text-sm ${isSelected ? "text-primary font-medium" : "text-muted-foreground"}`}>
                                {permissionKey.split('_').slice(1).join(' ')}
                              </span>
                            </Label>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
      </div>

      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          {totalSelected} permission{totalSelected !== 1 ? "s" : ""} selected
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            // Expand all modules
            const allModules = Object.keys(filteredModules);
            setExpandedModules(new Set(allModules));
          }}
          disabled={disabled}
        >
          Expand All
        </Button>
      </div>
    </div>
  );
}

