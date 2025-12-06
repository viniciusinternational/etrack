import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { UserRole } from "@prisma/client";

export async function GET() {
  try {
    const [
      totalUsers,
      activeUsers,
      totalMDAs,
      activeMDAs,
      usersByRoleRaw,
      recentUsers,
      recentMDAs
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { status: "active" } }),
      prisma.mDA.count(),
      prisma.mDA.count({ where: { isActive: true } }),
      prisma.user.groupBy({
        by: ['role'],
        _count: {
          role: true
        }
      }),
      prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
          mda: {
            select: {
              name: true
            }
          }
        }
      }),
      prisma.mDA.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5
      })
    ]);

    // Transform usersByRoleRaw to Record<UserRole, number>
    const usersByRole = usersByRoleRaw.reduce((acc: Record<UserRole, number>, curr) => {
      acc[curr.role] = curr._count.role;
      return acc;
    }, {} as Record<UserRole, number>);

    // Ensure all roles are present with 0 if not found
    Object.values(UserRole).forEach(role => {
      if (!usersByRole[role]) {
        usersByRole[role] = 0;
      }
    });

    const stats = {
      totalUsers,
      totalMDAs,
      activeUsers,
      activeMDAs,
      usersByRole,
      recentUsers,
      recentMDAs
    };

    return NextResponse.json({ ok: true, data: stats });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return NextResponse.json({ ok: false, error: "Failed to fetch dashboard stats" }, { status: 500 });
  }
}

export async function POST() {
  return NextResponse.json({
    ok: false,
    message: "Dashboard creation not supported",
  }, { status: 405 });
}
