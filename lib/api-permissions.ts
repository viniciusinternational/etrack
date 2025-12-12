/**
 * API Route Permission Validation
 * 
 * Helper functions for validating authentication and permissions in API routes.
 * Uses the new RBAS JSON-based permission system.
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserInfoFromHeaders } from '@/lib/audit-logger';
import { hasAnyPermission } from '@/lib/permissions';
import type { PermissionKey } from '@/types/permissions';
import type { User } from '@/types';

/**
 * Get user from request headers
 * Assumes user ID is passed in x-user-id header or extracted from token
 */
async function getUserFromRequest(request: NextRequest): Promise<User | null> {
  const { userId } = getUserInfoFromHeaders(request.headers);
  
  if (!userId) {
    return null;
  }
  
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstname: true,
        lastname: true,
        role: true,
        mdaId: true,
        status: true,
        permissions: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return null;
    }

    // Map Prisma user to our User type
    return {
      id: user.id,
      email: user.email,
      firstname: user.firstname,
      lastname: user.lastname,
      role: user.role,
      mdaId: user.mdaId || undefined,
      status: user.status === 'active' ? 'active' : 'inactive',
      lastLogin: user.lastLogin || undefined,
      permissions: user.permissions as User['permissions'] || undefined,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  } catch (error) {
    console.error('Error fetching user from request:', error);
    return null;
  }
}

/**
 * Middleware to check authentication and permissions
 * 
 * @param request - Next.js request object
 * @param requiredPermissions - Optional array of permission keys. User needs at least one.
 * @returns User object or error response
 * 
 * @example
 * const authResult = await requireAuth(request, ['view_project']);
 * if (authResult instanceof NextResponse) return authResult;
 * const { user } = authResult;
 */
export async function requireAuth(
  request: NextRequest,
  requiredPermissions?: PermissionKey[]
): Promise<{ user: User } | NextResponse> {
  const user = await getUserFromRequest(request);
  // Check authentication
  if (!user) {
    return NextResponse.json(
      { 
        ok: false, 
        error: 'Unauthorized',
        message: 'You must be logged in to access this resource. Please log in and try again.'
      },
      { status: 401 }
    );
  }
  
  // Check if user is active
  if (user.status !== 'active') {
    return NextResponse.json(
      { 
        ok: false, 
        error: 'Account is deactivated',
        message: 'Your account has been deactivated. Please contact your administrator for assistance.'
      },
      { status: 403 }
    );
  }
  
  // Check permissions if required
  if (requiredPermissions && requiredPermissions.length > 0) {
    if (!hasAnyPermission(user, requiredPermissions)) {
      const permissionsList = requiredPermissions.length === 1
        ? `permission: ${requiredPermissions[0]}`
        : `one of the following permissions: ${requiredPermissions.join(', ')}`;
      
      return NextResponse.json(
        { 
          ok: false, 
          error: 'Forbidden: Missing required permissions',
          message: `You don't have the required ${permissionsList}. Please contact your administrator to request access.`,
          requiredPermissions 
        },
        { status: 403 }
      );
    }
  }
  
  return { user };
}

/**
 * Get user from request without permission check
 * Useful when you need the user object but want to handle permissions manually
 * 
 * @param request - Next.js request object
 * @returns User object or error response
 */
export async function requireUser(
  request: NextRequest
): Promise<{ user: User } | NextResponse> {
  return requireAuth(request); // No permissions required, just authentication
}

