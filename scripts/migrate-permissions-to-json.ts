/**
 * Migration Script: Convert UserPermission records to JSON format
 * 
 * This script:
 * 1. Reads all existing UserPermission records from the database
 * 2. Converts MODULE_ACTION format to action_module format
 * 3. Builds a JSON object for each user: { "view_project": true, "create_user": true, ... }
 * 4. Updates User records with permissions JSON field
 * 
 * Run with: npx tsx scripts/migrate-permissions-to-json.ts
 */

import { prisma } from '../lib/prisma';
import { PermissionModule, PermissionAction } from '../lib/permission-constants';
import type { PermissionKey, UserPermissions } from '../types/permissions';

/**
 * Convert MODULE_ACTION format to action_module format
 * Example: USER_CREATE -> create_user, PROJECT_READ -> view_project
 */
function convertPermissionFormat(module: string, action: string): PermissionKey | null {
  // Map actions to new format
  const actionMap: Record<string, string> = {
    CREATE: 'create',
    READ: 'view',
    UPDATE: 'edit',
    DELETE: 'delete',
    EXPORT: 'export',
    APPROVE: 'approve',
    REJECT: 'reject',
    UPLOAD: 'upload',
    MANAGE: 'manage',
  };

  // Map modules to new format (convert to lowercase, singular)
  const moduleMap: Record<string, string> = {
    USER: 'user',
    MDA: 'mda',
    PROJECT: 'project',
    SUBMISSION: 'submission',
    BUDGET: 'budget',
    EXPENDITURE: 'expenditure',
    REVENUE: 'revenue',
    PROCUREMENT: 'procurement',
    TENDER: 'tender',
    BID: 'bid',
    AWARD: 'award',
    AUDIT: 'audit',
    EVENT: 'event',
    MEETING: 'meeting',
    PAYMENT: 'payment',
    DASHBOARD: 'dashboard',
    CONTRACT: 'contract',
  };

  const newAction = actionMap[action];
  const newModule = moduleMap[module];

  if (!newAction || !newModule) {
    console.warn(`Cannot convert permission: ${module}_${action}`);
    return null;
  }

  const permissionKey = `${newAction}_${newModule}` as PermissionKey;
  return permissionKey;
}

async function migratePermissions() {
  console.log('🚀 Starting permission migration...\n');

  try {
    // Get all users with their permissions
    const users = await prisma.user.findMany({
      include: {
        userPermissions: {
          include: {
            permission: true,
          },
        },
      },
    });

    console.log(`Found ${users.length} users to migrate\n`);

    let migratedCount = 0;
    let skippedCount = 0;
    const errors: Array<{ userId: string; error: string }> = [];

    for (const user of users) {
      try {
        // Skip if user already has permissions JSON (already migrated)
        if (user.permissions && typeof user.permissions === 'object') {
          console.log(`⏭️  Skipping user ${user.email} (already has permissions JSON)`);
          skippedCount++;
          continue;
        }

        // Build permissions object from userPermissions
        const permissionsObj: Partial<UserPermissions> = {};

        for (const userPerm of user.userPermissions) {
          const { module, action } = userPerm.permission;
          const permissionKey = convertPermissionFormat(module, action);

          if (permissionKey) {
            permissionsObj[permissionKey] = true;
          }
        }

        // Update user with permissions JSON
        await prisma.user.update({
          where: { id: user.id },
          data: {
            permissions: permissionsObj,
          },
        });

        const permCount = Object.keys(permissionsObj).length;
        console.log(`✅ Migrated user ${user.email} (${permCount} permissions)`);
        migratedCount++;

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error(`❌ Error migrating user ${user.email}:`, errorMessage);
        errors.push({ userId: user.id, error: errorMessage });
      }
    }

    console.log('\n📊 Migration Summary:');
    console.log(`   ✅ Successfully migrated: ${migratedCount} users`);
    console.log(`   ⏭️  Skipped (already migrated): ${skippedCount} users`);
    console.log(`   ❌ Errors: ${errors.length} users`);

    if (errors.length > 0) {
      console.log('\n❌ Errors encountered:');
      errors.forEach(({ userId, error }) => {
        console.log(`   - User ${userId}: ${error}`);
      });
    }

    console.log('\n✨ Migration completed!');

  } catch (error) {
    console.error('💥 Fatal error during migration:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run migration if executed directly
if (require.main === module) {
  migratePermissions()
    .then(() => {
      console.log('\n🎉 Migration script finished successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Migration script failed:', error);
      process.exit(1);
    });
}

export { migratePermissions };

