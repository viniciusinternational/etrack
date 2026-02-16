import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { UserRole } from "@prisma/client";
import { requireAuth } from "@/lib/api-permissions";
import type { ReportType } from "@/types";

const VALID_TYPES: ReportType[] = ["overview", "financial", "projects", "users"];

function parseDateRange(request: NextRequest): { start?: Date; end?: Date } {
  const { searchParams } = new URL(request.url);
  const startParam = searchParams.get("startDate");
  const endParam = searchParams.get("endDate");
  const start = startParam ? new Date(startParam) : undefined;
  const end = endParam ? new Date(endParam) : undefined;
  if (start && isNaN(start.getTime())) return {};
  if (end && isNaN(end.getTime())) return {};
  return { start, end };
}

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request, ["view_dashboard"]);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") as ReportType | null;
    if (!type || !VALID_TYPES.includes(type)) {
      return NextResponse.json(
        { ok: false, error: "Invalid or missing type. Use: overview, financial, projects, users" },
        { status: 400 }
      );
    }

    const { start: startDate, end: endDate } = parseDateRange(request);

    if (type === "overview") {
      const [
        totalUsers,
        activeUsers,
        totalMDAs,
        activeMDAs,
        totalProjects,
        budgetAgg,
        revenueAgg,
        expenditureAgg,
        usersByRoleRaw,
        projectsByStatusRaw,
        projectCountByMda,
      ] = await Promise.all([
        prisma.user.count(),
        prisma.user.count({ where: { status: "active" } }),
        prisma.mDA.count(),
        prisma.mDA.count({ where: { isActive: true } }),
        prisma.project.count(),
        prisma.budgetAllocation.aggregate({ _sum: { amount: true } }),
        prisma.revenue.aggregate({ _sum: { amount: true } }),
        prisma.expenditure.aggregate({ _sum: { amount: true } }),
        prisma.user.groupBy({
          by: ["role"],
          _count: { role: true },
        }),
        prisma.project.groupBy({
          by: ["status"],
          _count: { status: true },
        }),
        prisma.project.groupBy({
          by: ["supervisingMdaId"],
          _count: { supervisingMdaId: true },
        }),
      ]);

      const usersByRole = Object.values(UserRole).reduce(
        (acc, role) => {
          const row = usersByRoleRaw.find((r) => r.role === role);
          acc[role] = row?._count.role ?? 0;
          return acc;
        },
        {} as Record<string, number>
      );

      const projectsByStatus = projectsByStatusRaw.reduce(
        (acc, r) => {
          acc[r.status] = r._count.status;
          return acc;
        },
        {} as Record<string, number>
      );

      const mdaIds = projectCountByMda
        .filter((r) => r.supervisingMdaId != null)
        .map((r) => r.supervisingMdaId as string);
      const mdas = mdaIds.length
        ? await prisma.mDA.findMany({
            where: { id: { in: mdaIds } },
            select: { id: true, name: true },
          })
        : [];
      const mdaMap = Object.fromEntries(mdas.map((m) => [m.id, m.name]));
      const mdaCounts = projectCountByMda
        .filter((r) => r.supervisingMdaId != null)
        .map((r) => ({
          name: mdaMap[r.supervisingMdaId!] ?? "Unknown",
          count: r._count.supervisingMdaId,
        }));

      return NextResponse.json({
        ok: true,
        data: {
          totalUsers,
          activeUsers,
          totalMDAs,
          activeMDAs,
          totalProjects,
          totalBudget: budgetAgg._sum.amount ?? 0,
          totalRevenue: revenueAgg._sum.amount ?? 0,
          totalExpenditure: expenditureAgg._sum.amount ?? 0,
          usersByRole,
          projectsByStatus,
          mdaCounts,
        },
      });
    }

    if (type === "financial") {
      const budgetWhere =
        startDate && endDate
          ? {
              fiscalYear: { gte: startDate.getFullYear(), lte: endDate.getFullYear() },
            }
          : {};
      const dateWhere =
        startDate && endDate
          ? { date: { gte: startDate, lte: endDate } }
          : {};

      const [budgetByMdaRaw, revenues, expenditures] = await Promise.all([
        prisma.budgetAllocation.groupBy({
          by: ["mdaId"],
          where: budgetWhere,
          _sum: { amount: true },
        }),
        prisma.revenue.findMany({
          where: dateWhere,
          select: { mdaId: true, amount: true, date: true },
          orderBy: { date: "asc" },
        }),
        prisma.expenditure.findMany({
          where: dateWhere,
          select: { amount: true, date: true },
          orderBy: { date: "asc" },
        }),
      ]);

      const mdaIds = budgetByMdaRaw.map((r) => r.mdaId);
      const mdas =
        mdaIds.length > 0
          ? await prisma.mDA.findMany({
              where: { id: { in: mdaIds } },
              select: { id: true, name: true },
            })
          : [];
      const mdaMap = Object.fromEntries(mdas.map((m) => [m.id, m.name]));

      const expendituresByProject = await prisma.expenditure.groupBy({
        by: ["projectId"],
        where: dateWhere,
        _sum: { amount: true },
      });
      const projIds = expendituresByProject.map((r) => r.projectId);
      const projectsWithMda =
        projIds.length > 0
          ? await prisma.project.findMany({
              where: { id: { in: projIds } },
              select: { id: true, supervisingMdaId: true },
            })
          : [];
      const projectToMda = Object.fromEntries(
        projectsWithMda.map((p) => [p.id, p.supervisingMdaId])
          .filter(([, mdaId]) => mdaId != null) as [string, string][]
      );
      const expenditureByMdaId = new Map<string, number>();
      expendituresByProject.forEach((r) => {
        const mdaId = projectToMda[r.projectId];
        if (mdaId) {
          expenditureByMdaId.set(
            mdaId,
            (expenditureByMdaId.get(mdaId) ?? 0) + (r._sum.amount ?? 0)
          );
        }
      });

      const budgetByMda = budgetByMdaRaw.map((r) => ({
        name: mdaMap[r.mdaId] ?? r.mdaId,
        budget: r._sum.amount ?? 0,
        expenditure: expenditureByMdaId.get(r.mdaId) ?? 0,
      }));

      const projectsWithTitle =
        projIds.length > 0
          ? await prisma.project.findMany({
              where: { id: { in: projIds } },
              select: { id: true, title: true },
            })
          : [];
      const projectTitleMap = Object.fromEntries(
        projectsWithTitle.map((p) => [p.id, p.title])
      );
      const expenditureByRecipient = expendituresByProject
        .map((r) => ({
          name: projectTitleMap[r.projectId] ?? r.projectId,
          value: r._sum.amount ?? 0,
        }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 10);

      const monthMap = new Map<string, { revenue: number; expenditure: number }>();
      revenues.forEach((r) => {
        const key = r.date.toISOString().slice(0, 7);
        const curr = monthMap.get(key) ?? { revenue: 0, expenditure: 0 };
        curr.revenue += r.amount;
        monthMap.set(key, curr);
      });
      expenditures.forEach((e) => {
        const key = e.date.toISOString().slice(0, 7);
        const curr = monthMap.get(key) ?? { revenue: 0, expenditure: 0 };
        curr.expenditure += e.amount;
        monthMap.set(key, curr);
      });
      const revenueTrend = Array.from(monthMap.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([period, v]) => ({ period, revenue: v.revenue, expenditure: v.expenditure }));

      return NextResponse.json({
        ok: true,
        data: {
          budgetByMda,
          revenueTrend,
          expenditureByRecipient,
        },
      });
    }

    if (type === "projects") {
      const where =
        startDate && endDate
          ? {
              createdAt: { gte: startDate, lte: endDate },
            }
          : {};

      const [byStatusRaw, byCategoryRaw, byMdaRaw] = await Promise.all([
        prisma.project.groupBy({
          by: ["status"],
          where,
          _count: { status: true },
        }),
        prisma.project.groupBy({
          by: ["category"],
          where,
          _count: { category: true },
        }),
        prisma.project.groupBy({
          by: ["supervisingMdaId"],
          where,
          _count: { supervisingMdaId: true },
        }),
      ]);

      const mdaIds = byMdaRaw
        .filter((r) => r.supervisingMdaId != null)
        .map((r) => r.supervisingMdaId as string);
      const mdas =
        mdaIds.length > 0
          ? await prisma.mDA.findMany({
              where: { id: { in: mdaIds } },
              select: { id: true, name: true },
            })
          : [];
      const mdaMap = Object.fromEntries(mdas.map((m) => [m.id, m.name]));

      const byStatus = byStatusRaw.map((r) => ({ name: r.status, count: r._count.status }));
      const byCategory = byCategoryRaw.map((r) => ({ name: r.category, count: r._count.category }));
      const byMda = byMdaRaw
        .filter((r) => r.supervisingMdaId != null)
        .map((r) => ({
          name: mdaMap[r.supervisingMdaId!] ?? "Unassigned",
          count: r._count.supervisingMdaId,
        }));

      return NextResponse.json({
        ok: true,
        data: { byStatus, byCategory, byMda },
      });
    }

    if (type === "users") {
      const [totalUsers, activeUsers, byRoleRaw] = await Promise.all([
        prisma.user.count(),
        prisma.user.count({ where: { status: "active" } }),
        prisma.user.groupBy({
          by: ["role"],
          _count: { role: true },
        }),
      ]);

      const byRole = byRoleRaw.map((r) => ({
        name: r.role,
        value: r._count.role,
      }));

      return NextResponse.json({
        ok: true,
        data: { totalUsers, activeUsers, byRole },
      });
    }

    return NextResponse.json({ ok: false, error: "Unknown report type" }, { status: 400 });
  } catch (error) {
    console.error("Error fetching report:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to fetch report" },
      { status: 500 }
    );
  }
}
