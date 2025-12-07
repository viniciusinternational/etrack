# Obsolete & Redundant Code Inventory

After the RBAS refactoring, the following code and resources are **obsolete** or **redundant** and can be safely removed or deprecated.

---

## 🔴 **OBsolete Files (Can be deleted)**

### 1. **Legacy Permission Middleware**
- **File**: `lib/permission-middleware.ts`
- **Reason**: Replaced by `lib/api-permissions.ts` with `requireAuth()`
- **Usage**: Still used in 2 API routes that need updating
- **Action**: Update remaining routes, then delete

### 2. **Legacy Permission Delete Route**
- **File**: `app/api/users/[id]/permissions/[permissionId]/route.ts`
- **Reason**: Permissions are now managed via JSON (PATCH endpoint), not individual permission records
- **Action**: Delete (after migration)

### 3. **Old Permission Selector Component**
- **File**: `components/admin/permission-selector.tsx`
- **Reason**: Uses permission IDs. Replaced by `components/user/permissions-editor.tsx` (JSON-based)
- **Usage**: Still used in `components/admin/user-view.tsx` and `app/(pages)/users/page.tsx`
- **Action**: Update components to use new PermissionsEditor, then delete

---

## 🟡 **Deprecated Functions (Keep but mark as deprecated)**

### 1. **Legacy Permission Checking Functions** (`lib/permissions.ts`)
All marked as `@deprecated` but still functional for backward compatibility:

```typescript
// Lines 231-335 in lib/permissions.ts
- checkUserPermission() // Async database-based
- getUserPermissionsAsync() // Async database-based  
- getUserPermissionIds() // Async database-based
- hasModulePermission() // Async database-based
```

**Replacement**: Use sync JSON-based functions:
- `hasPermission(user, permissionKey)` 
- `getUserPermissionsList(user)`
- `canAccessModule(user, module)`

### 2. **Legacy Permission Functions** (`lib/permissions.ts`)
```typescript
// Lines 25-73 in lib/permissions.ts
- checkPermission() // Role-based
- getResourcePermissions() // Role-based
- canAccessRoute() // Role-based
- PERMISSIONS constant // Old format
```

**Reason**: Old role-based permission system, replaced by granular JSON permissions

### 3. **Legacy Auth Functions** (`lib/auth.ts`)
```typescript
// Lines 103-133 in lib/auth.ts
- hasPermission() // Role-based (deprecated)
- hasUserPermission() // Database-based async
- hasPermissionWithFallback() // Database-based async
```

**Replacement**: Use sync JSON-based functions from `lib/permissions.ts`

---

## 🟠 **Obsolete API Routes (Update to use new system)**

### 1. **Projects Export Route**
- **File**: `app/api/projects/export/route.ts`
- **Issue**: Uses old `requirePermission()` middleware (line 12)
- **Action**: Update to use `requireAuth()` with `['export_project']`

### 2. **Projects Detail Route**
- **File**: `app/api/projects/[id]/route.ts`
- **Issue**: Uses old `requirePermission()` middleware (lines 98, 180)
- **Action**: Update to use `requireAuth()` with permission keys

### 3. **Permissions Route**
- **File**: `app/api/permissions/route.ts`
- **Issue**: Uses old `checkUserPermission()` function (line 60)
- **Action**: Update to use `requireAuth()` helper

### 4. **User Detail Route**
- **File**: `app/api/users/[id]/route.ts`
- **Issue**: Uses old `checkUserPermission()` function (line 88)
- **Action**: Update to use `requireAuth()` helper

### 5. **Generate Password Route**
- **File**: `app/api/users/[id]/generate-password/route.ts`
- **Issue**: Uses old `checkUserPermission()` function (line 17)
- **Action**: Update to use `requireAuth()` helper

---

## 🔵 **Obsolete Hooks (Update to use JSON-based)**

### 1. **Legacy User Permissions Hooks** (`hooks/use-users.ts`)
```typescript
// Lines 87-143 in hooks/use-users.ts
- useUserPermissions() // Returns UserPermission[] with IDs
- useAssignUserPermissions() // Uses permissionIds array
- useRemoveUserPermission() // Uses permissionId
```

**Replacement**: Use new JSON-based hooks:
- `useUserPermissionsJSON()` - Returns JSON permissions object
- `useUpdateUserPermissionsJSON()` - Updates JSON permissions

### 2. **Project Permissions Hook** (`hooks/use-project-permissions.ts`)
- **File**: `hooks/use-project-permissions.ts`
- **Issue**: Uses old `useUserPermissions()` hook with permission IDs
- **Action**: Refactor to use sync JSON-based permission checks

---

## 🟣 **Obsolete Components (Update to use new system)**

### 1. **User Management Page**
- **File**: `app/(pages)/users/page.tsx`
- **Issue**: Uses old `PermissionSelector` component with permission IDs
- **Action**: Replace with `PermissionsEditor` component

### 2. **User View Component**
- **File**: `components/admin/user-view.tsx`
- **Issue**: Uses old `PermissionSelector` component with permission IDs (line 415)
- **Action**: Replace with `PermissionsEditor` component and JSON hooks

---

## 🟢 **Database Schema (Keep for migration, mark for future removal)**

### Prisma Schema (`prisma/schema.prisma`)

These models/relations are legacy but kept for migration purposes:

1. **Permission Model** (Lines 520-540)
   - Stores `MODULE_ACTION` format permissions
   - Can be removed after migration completes

2. **UserPermission Model** (Lines 541-564)
   - Junction table linking users to permissions
   - Can be removed after migration completes

3. **User.userPermissions Relation** (Line 134)
   - Legacy relation, kept for migration
   - Can be removed after migration completes

**Action**: Keep during migration, remove in future cleanup phase

---

## 📋 **Summary Table**

| Type | Count | Status | Priority |
|------|-------|--------|----------|
| **Files to Delete** | 3 | Ready after updates | High |
| **Functions to Deprecate** | 7+ | Marked deprecated | Medium |
| **API Routes to Update** | 5 | Need refactoring | High |
| **Hooks to Update** | 2 | Need refactoring | Medium |
| **Components to Update** | 2 | Need refactoring | High |
| **DB Models (future)** | 2 | Keep for migration | Low |

---

## 🎯 **Recommended Cleanup Order**

### Phase 1: Update Active Code (High Priority)
1. ✅ Update API routes to use `requireAuth()` instead of `requirePermission()`
2. ✅ Update user management components to use `PermissionsEditor`
3. ✅ Refactor hooks to use JSON-based permissions

### Phase 2: Remove Obsolete Files (After Phase 1)
1. Delete `lib/permission-middleware.ts`
2. Delete `app/api/users/[id]/permissions/[permissionId]/route.ts`
3. Delete `components/admin/permission-selector.tsx`

### Phase 3: Database Cleanup (After migration completes)
1. Remove `Permission` model
2. Remove `UserPermission` model
3. Remove `User.userPermissions` relation

### Phase 4: Code Cleanup (Final)
1. Remove deprecated functions from `lib/permissions.ts`
2. Remove deprecated functions from `lib/auth.ts`
3. Clean up unused imports

---

## ⚠️ **Notes**

- **Migration Period**: Keep legacy code during migration for backward compatibility
- **Gradual Removal**: Remove obsolete code incrementally to avoid breaking changes
- **Testing**: Test thoroughly after each cleanup phase
- **Documentation**: Update any documentation referencing old permission system

---

## 📝 **Quick Reference**

**Old System:**
- Permission IDs → `permissionIds: string[]`
- Database tables → `Permission`, `UserPermission`
- Async checks → `checkUserPermission(userId, module, action)`
- Format → `MODULE_ACTION` (e.g., `USER_CREATE`)

**New System:**
- JSON permissions → `permissions: { [key: string]: boolean }`
- JSON field on User → `user.permissions`
- Sync checks → `hasPermission(user, 'create_user')`
- Format → `action_module` (e.g., `create_user`)

