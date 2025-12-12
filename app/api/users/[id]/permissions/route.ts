import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { requireAuth } from "@/lib/api-permissions";
import type { PartialUserPermissions } from "@/types/permissions";
import { ALL_PERMISSION_KEYS } from "@/types/permissions";

const updatePermissionsSchema = z.object({
  permissions: z.record(z.string(), z.boolean()).optional(),
});

/**
 * GET /api/users/[id]/permissions
 * Get user's permissions in JSON format
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Check authentication and permission to view user permissions
    const authResult = await requireAuth(request, ['view_user']);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    // Get user with permissions
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstname: true,
        lastname: true,
        permissions: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { ok: false, error: "User not found" },
        { status: 404 }
      );
    }

    // Return permissions JSON (or empty object if null)
    const permissions = (user.permissions as PartialUserPermissions) || {};

    return NextResponse.json({
      ok: true,
      data: {
        userId: user.id,
        email: user.email,
        name: `${user.firstname} ${user.lastname}`,
        permissions,
      },
    });
  } catch (error) {
    console.error("Error fetching user permissions:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to fetch user permissions" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/users/[id]/permissions
 * Update user's permissions JSON field
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Check authentication and permission to edit user permissions
    const authResult = await requireAuth(request, ['edit_user']);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const body = await request.json();
    const validatedData = updatePermissionsSchema.parse(body);

    if (!Object.prototype.hasOwnProperty.call(validatedData, 'permissions')) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Permissions field is required',
        },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return NextResponse.json(
        {
          ok: false,
          error: 'User not found',
        },
        { status: 404 }
      );
    }

    // Validate that all permission keys are valid
    const permissions = validatedData.permissions || {};
    const invalidKeys = Object.keys(permissions).filter(
      key => !ALL_PERMISSION_KEYS.includes(key as any)
    );

    if (invalidKeys.length > 0) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Invalid permission keys',
          invalidKeys,
        },
        { status: 400 }
      );
    }

    // Update user permissions JSON field
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        permissions: permissions || null,
      },
      select: {
        id: true,
        email: true,
        firstname: true,
        lastname: true,
        permissions: true,
      },
    });

    return NextResponse.json({
      ok: true,
      data: {
        userId: updatedUser.id,
        email: updatedUser.email,
        name: `${updatedUser.firstname} ${updatedUser.lastname}`,
        permissions: updatedUser.permissions || {},
      },
      message: 'User permissions updated successfully',
    });
  } catch (error) {
    console.error('Error updating user permissions:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Validation error',
          details: error.issues,
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      {
        ok: false,
        error: 'Failed to update user permissions',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/users/[id]/permissions
 * Legacy endpoint - redirects to PATCH for JSON-based permissions
 * Kept for backward compatibility during migration
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Redirect POST to PATCH for JSON-based permissions
  return PATCH(request, { params });
}
