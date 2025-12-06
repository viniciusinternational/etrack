import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { ProjectCategory, ProjectStatus } from "@prisma/client";
import { requirePermission } from "@/lib/permission-middleware";
import { PermissionModule, PermissionAction } from "@/lib/permission-constants";
import { createAuditLog, getUserInfoFromHeaders } from "@/lib/audit-logger";

export async function GET(request: NextRequest) {
  try {
    // Check permission
    const permissionCheck = await requirePermission(request, PermissionModule.PROJECT, PermissionAction.EXPORT);
    if (!permissionCheck.authorized) {
      return permissionCheck.error!;
    }

    const { searchParams } = new URL(request.url);
    const format = searchParams.get("format") || "csv";
    const status = searchParams.get("status");
    const category = searchParams.get("category");
    const mdaId = searchParams.get("mdaId");
    const contractorId = searchParams.get("contractorId");

    // Build where clause (same as GET /api/projects)
    const where: Prisma.ProjectWhereInput = {};
    if (status) where.status = status as unknown as ProjectStatus;
    if (category) where.category = category as unknown as ProjectCategory;
    if (mdaId) where.supervisingMdaId = mdaId;
    if (contractorId) where.contractorId = contractorId;

    const projects = await prisma.project.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        supervisingMda: {
          select: {
            id: true,
            name: true,
          },
        },
        contractor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: { milestones: true, expenditures: true },
        },
      },
    });

    // Audit log
    try {
      const headersList = request.headers;
      const { userId, userSnapshot } = getUserInfoFromHeaders(headersList);
      const ip = headersList.get("x-forwarded-for") ?? undefined;

      await createAuditLog({
        userId: userId || "system",
        userSnapshot,
        actionType: "EXPORT",
        entityType: "Project",
        description: `Exported ${projects.length} projects as ${format.toUpperCase()}`,
        ipAddress: ip,
        userAgent: headersList.get("user-agent") ?? undefined,
      });
    } catch (e) {
      console.error("Audit log failed", e);
    }

    // Format data for export
    const exportData = projects.map((project) => ({
      Title: project.title,
      Description: project.description,
      Category: project.category,
      "Supervising MDA": project.supervisingMda?.name || "N/A",
      Contractor: project.contractor?.name || "N/A",
      "Contract Value": project.contractValue,
      "Start Date": project.startDate.toISOString().split("T")[0],
      "End Date": project.endDate.toISOString().split("T")[0],
      Status: project.status,
      "Milestones Count": project._count.milestones,
      "Expenditures Count": project._count.expenditures,
      "Created At": project.createdAt.toISOString(),
    }));

    if (format === "json") {
      return NextResponse.json(
        { ok: true, data: exportData },
        {
          headers: {
            "Content-Type": "application/json",
            "Content-Disposition": `attachment; filename="projects-${new Date().toISOString().split("T")[0]}.json"`,
          },
        }
      );
    }

    if (format === "csv") {
      // Convert to CSV
      const headers = Object.keys(exportData[0] || {});
      const csvRows = [
        headers.join(","),
        ...exportData.map((row) =>
          headers
            .map((header) => {
              const value = row[header as keyof typeof row];
              // Escape commas and quotes in CSV
              if (typeof value === "string" && (value.includes(",") || value.includes('"'))) {
                return `"${value.replace(/"/g, '""')}"`;
              }
              return value;
            })
            .join(",")
        ),
      ];

      const csvContent = csvRows.join("\n");

      return new NextResponse(csvContent, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="projects-${new Date().toISOString().split("T")[0]}.csv"`,
        },
      });
    }

    if (format === "excel") {
      // For Excel, we'll return CSV with .xlsx extension or use a library
      // For now, return CSV with Excel MIME type
      const headers = Object.keys(exportData[0] || {});
      const csvRows = [
        headers.join("\t"), // Tab-separated for Excel
        ...exportData.map((row) =>
          headers
            .map((header) => {
              const value = row[header as keyof typeof row];
              return value;
            })
            .join("\t")
        ),
      ];

      const excelContent = csvRows.join("\n");

      return new NextResponse(excelContent, {
        headers: {
          "Content-Type": "application/vnd.ms-excel",
          "Content-Disposition": `attachment; filename="projects-${new Date().toISOString().split("T")[0]}.xls"`,
        },
      });
    }

    return NextResponse.json(
      { ok: false, error: "Invalid format. Use csv, excel, or json" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error exporting projects:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to export projects" },
      { status: 500 }
    );
  }
}

