import { 
  PrismaClient, 
  UserRole, 
  ProjectStatus, 
  ProjectCategory, 
  MilestoneStage, 
  SubmissionStatus, 
  ProcurementStatus, 
  BidStatus, 
  PaymentStatus, 
  PaymentMethod, 
  PaymentSourceType,
  EventStatus,
  EventPriority
} from "@prisma/client";
import { hashPassword } from "../lib/password";
import { ALL_PERMISSION_KEYS, type UserPermissions } from "../types/permissions";

const prisma = new PrismaClient();

// Helper to build full permissions
function buildAllPermissionsJSON(): UserPermissions {
  const permissionsObj: Partial<UserPermissions> = {};
  for (const key of ALL_PERMISSION_KEYS) {
    permissionsObj[key] = true;
  }
  return permissionsObj as UserPermissions;
}

// Fixed UUIDs for consistent relationship mapping
const MDAS = {
  WORKS: { id: "mda-works-001", name: "Ministry of Works and Infrastructure" },
  HEALTH: { id: "mda-health-001", name: "Ministry of Health" },
  EDUCATION: { id: "mda-education-001", name: "Ministry of Education" },
};

const USERS = {
  ADMIN: { id: "user-admin-001", email: "admin@etrack.gov", role: UserRole.SuperAdmin },
  PM: { id: "user-pm-001", email: "pm@etrack.gov", role: UserRole.ProjectManager },
  CONTRACTOR: { id: "user-cont-001", email: "contractor@company.com", role: UserRole.Contractor },
  FINANCE: { id: "user-fin-001", email: "finance@etrack.gov", role: UserRole.FinanceOfficer },
  PROCUREMENT: { id: "user-proc-001", email: "procurement@etrack.gov", role: UserRole.ProcurementOfficer },
  AUDITOR: { id: "user-audit-001", email: "auditor@etrack.gov", role: UserRole.Auditor },
  VENDOR: { id: "user-vendor-001", email: "vendor@company.com", role: UserRole.Vendor },
};

async function main() {
  console.log("🌱 Starting comprehensive seed...");

  // 1. CLEANUP (Reverse dependency order to avoid constraints)
  console.log("🧹 Clearing existing data...");
  const deleteTable = (model: any) => model.deleteMany();
  
  await deleteTable(prisma.paymentInstallment);
  await deleteTable(prisma.paymentItem);
  await deleteTable(prisma.payment);
  await deleteTable(prisma.award);
  await deleteTable(prisma.bid);
  await deleteTable(prisma.procurementRequest);
  await deleteTable(prisma.revenue);
  await deleteTable(prisma.expenditure);
  await deleteTable(prisma.budgetAllocation);
  await deleteTable(prisma.milestoneSubmission);
  await deleteTable(prisma.calendarEvent);
  await deleteTable(prisma.meetingMinutes);
  await deleteTable(prisma.meeting);
  await deleteTable(prisma.project);
  await deleteTable(prisma.rolePermissionTemplate);
  await deleteTable(prisma.user);
  await deleteTable(prisma.mDA);

  console.log("✅ Data cleared.");

  // 2. SEED MDAS
  console.log("🏢 Seeding MDAs...");
  await prisma.mDA.createMany({
    data: [
      {
        id: MDAS.WORKS.id,
        name: MDAS.WORKS.name,
        category: "Infrastructure",
        description: "Public works and roads",
        headOfMda: "Eng. Musa Abdullahi",
        email: "works@gov.ng",
        isActive: true,
      },
      {
        id: MDAS.HEALTH.id,
        name: MDAS.HEALTH.name,
        category: "Healthcare",
        description: "Health services",
        headOfMda: "Dr. Fatima Ibrahim",
        email: "health@gov.ng",
        isActive: true,
      },
      {
        id: MDAS.EDUCATION.id,
        name: MDAS.EDUCATION.name,
        category: "Education",
        description: "Education management",
        headOfMda: "Prof. Ahmed Bello",
        email: "education@gov.ng",
        isActive: true,
      },
      { name: "Ministry of Finance", category: "Finance", email: "finance@gov.ng" },
      { name: "Ministry of Agriculture", category: "Agriculture", email: "agric@gov.ng" },
    ]
  });

  // 3. SEED ROLE PERMISSION TEMPLATES
  console.log("📜 Seeding Role Templates...");
  const roleTemplates = [
    { role: UserRole.SuperAdmin, permissions: ALL_PERMISSION_KEYS },
    { role: UserRole.Admin, permissions: ALL_PERMISSION_KEYS },
    { role: UserRole.ProjectManager, permissions: ['view_event', 'view_project', 'create_project', 'edit_project', 'view_milestone', 'create_milestone', 'view_budget', 'view_meeting'] },
    { role: UserRole.Contractor, permissions: ['view_event', 'view_contract', 'view_milestone', 'create_milestone'] },
    { role: UserRole.FinanceOfficer, permissions: ['view_event', 'view_budget', 'create_budget', 'edit_budget', 'view_payment', 'create_payment', 'edit_payment', 'view_revenue', 'view_expenditure'] },
    { role: UserRole.ProcurementOfficer, permissions: ['view_event', 'view_procurement', 'create_procurement', 'view_bid', 'view_award', 'create_award'] },
    { role: UserRole.Auditor, permissions: ['view_event', 'view_project', 'view_budget', 'view_payment', 'view_audit', 'create_audit'] },
    { role: UserRole.Vendor, permissions: ['view_event', 'view_procurement', 'create_bid'] },
  ];

  for (const t of roleTemplates) {
    const permissionsObj: Record<string, boolean> = {};
    t.permissions.forEach((key: string) => {
      permissionsObj[key] = true;
    });

    await prisma.rolePermissionTemplate.create({
      data: { 
        role: t.role as any, 
        permissions: permissionsObj as any 
      }
    });
  }

  // 4. SEED USERS
  console.log("👥 Seeding Users...");
  const password = hashPassword("password123");
  const users = [
    { ...USERS.ADMIN, firstname: "System", lastname: "Admin", permissions: buildAllPermissionsJSON() },
    { ...USERS.PM, firstname: "Project", lastname: "Manager", mdaId: MDAS.WORKS.id },
    { ...USERS.CONTRACTOR, firstname: "John", lastname: "Builder", mdaId: MDAS.WORKS.id },
    { ...USERS.FINANCE, firstname: "Jane", lastname: "Finance", mdaId: MDAS.EDUCATION.id },
    { ...USERS.PROCUREMENT, firstname: "Peter", lastname: "Procure", mdaId: MDAS.HEALTH.id },
    { ...USERS.AUDITOR, firstname: "Alex", lastname: "Audit" },
    { ...USERS.VENDOR, firstname: "Victor", lastname: "Vendor" },
  ];

  // Create a map for quick lookup
  const rolePermissionsMap = roleTemplates.reduce((acc, t) => {
    acc[t.role] = t.permissions;
    return acc;
  }, {} as Record<UserRole, string[]>);

  for (const u of users) {
    const user: any = u;
    // If permissions explicitly provided (like Admin), use them. 
    // Otherwise, build from role template.
    let userPermissions = user.permissions;

    if (!userPermissions) {
      const rolePerms = rolePermissionsMap[user.role as UserRole] || [];
      const permissionsObj: any = {};
      for (const key of rolePerms) {
        permissionsObj[key] = true;
      }
      userPermissions = permissionsObj;
    }

    await prisma.user.create({
      data: {
        id: user.id,
        email: user.email,
        firstname: user.firstname,
        lastname: user.lastname,
        role: user.role,
        password,
        mdaId: user.mdaId,
        permissions: userPermissions,
        status: "active"
      }
    });
  }

  // 5. SEED PROJECTS
  console.log("🏗️ Seeding Projects...");
  const project1 = await prisma.project.create({
    data: {
      title: "Rehabilitation of Lagos-Ibadan Expressway",
      description: "Major road rehabilitation project phase 2",
      category: ProjectCategory.Infrastructure,
      supervisingMdaId: MDAS.WORKS.id,
      supervisorId: USERS.PM.id,
      contractorId: USERS.CONTRACTOR.id,
      contractValue: 150000000,
      startDate: new Date("2025-01-15"),
      endDate: new Date("2026-06-30"),
      status: ProjectStatus.InProgress,
    }
  });

  const project2 = await prisma.project.create({
    data: {
      title: "Construction of Primary Health Center",
      description: "New health center construction in rural district",
      category: ProjectCategory.Healthcare,
      supervisingMdaId: MDAS.HEALTH.id,
      supervisorId: USERS.PM.id, // Assuming PM can supervise cross-MDA for seed simplicity or verify schema flexibility
      contractValue: 45000000,
      startDate: new Date("2025-03-01"),
      endDate: new Date("2025-12-31"),
      status: ProjectStatus.Planned,
    }
  });

  // 6. SEED MILESTONES
  console.log("📍 Seeding Milestones...");
  await prisma.milestoneSubmission.create({
    data: {
      projectId: project1.id,
      contractorId: USERS.CONTRACTOR.id,
      milestoneStage: MilestoneStage.Foundation,
      percentComplete: 100,
      status: SubmissionStatus.Approved,
      reviewedBy: USERS.PM.id,
      reviewedAt: new Date(),
      notes: "Foundation completed successfully according to specifications",
    }
  });

  await prisma.milestoneSubmission.create({
    data: {
      projectId: project1.id,
      contractorId: USERS.CONTRACTOR.id,
      milestoneStage: MilestoneStage.Superstructure,
      percentComplete: 45,
      status: SubmissionStatus.Pending,
      notes: "Ongoing superstructure work",
    }
  });

  // 7. SEED FINANCIALS (Budget, Revenue, Expenditure)
  console.log("💰 Seeding Financials...");
  
  // Budget
  await prisma.budgetAllocation.create({
    data: {
      mdaId: MDAS.WORKS.id,
      fiscalYear: 2025,
      quarter: 1,
      amount: 500000000,
      source: "Federal Allocation",
    }
  });

  // Expenditure (Project Related)
  await prisma.expenditure.create({
    data: {
      projectId: project1.id,
      amount: 25000000, // Mobilization fee
      date: new Date("2025-01-20"),
      recipient: "ABC Construction Ltd",
    }
  });

  // Revenue
  await prisma.revenue.create({
    data: {
      mdaId: MDAS.EDUCATION.id,
      type: "Grant",
      amount: 10000000,
      date: new Date("2025-02-10"),
    }
  });

  // 8. SEED PROCUREMENT
  console.log("🛒 Seeding Procurement...");
  
  // Request
  const procRequest = await prisma.procurementRequest.create({
    data: {
      mdaId: MDAS.HEALTH.id,
      title: "Supply of Medical Equipment",
      description: "Procurement of X-ray machines and MRI scanners",
      estimatedCost: 75000000,
      requestDate: new Date("2025-04-01"),
      status: ProcurementStatus.Awarded,
    }
  });

  // Bid
  const bid = await prisma.bid.create({
    data: {
      procurementRequestId: procRequest.id,
      vendorId: USERS.VENDOR.id,
      bidAmount: 72000000,
      submittedAt: new Date("2025-04-15"),
      status: BidStatus.Awarded,
    }
  });

  // Award
  await prisma.award.create({
    data: {
      procurementRequestId: procRequest.id,
      vendorId: USERS.VENDOR.id,
      contractValue: 72000000,
      awardDate: new Date("2025-05-01"),
    }
  });

  // 9. SEED PAYMENTS
  console.log("💳 Seeding Payments...");
  await prisma.payment.create({
    data: {
      sourceType: PaymentSourceType.project,
      projectId: project1.id,
      createdById: USERS.FINANCE.id,
      payeeId: USERS.CONTRACTOR.id,
      amount: 15000000,
      totalAmount: 15000000,
      currency: "NGN",
      status: PaymentStatus.paid,
      method: PaymentMethod.bank_transfer,
      reference: "PAY-2025-001",
      paymentDate: new Date().toISOString(),
      items: {
        create: {
          description: "Milestone 1 Payment - Foundation",
          quantity: 1,
          unitPrice: 15000000,
          total: 15000000,
          currency: "NGN"
        }
      }
    }
  });

  await prisma.payment.create({
    data: {
      sourceType: PaymentSourceType.project,
      projectId: project1.id,
      createdById: USERS.FINANCE.id,
      amount: 5000000,
      totalAmount: 5000000,
      currency: "NGN",
      status: PaymentStatus.pending_approval,
      isDraft: false,
      requiresApproval: true,
      items: {
        create: {
          description: "Materials Purchase Reimbursement",
          quantity: 1,
          unitPrice: 5000000,
          total: 5000000,
          currency: "NGN"
        }
      }
    }
  });

  // 10. SEED EVENTS & MEETINGS
  console.log("📅 Seeding Events & Meetings...");
  await prisma.meeting.create({
    data: {
      title: "Project Stakeholder Meeting",
      scheduledAt: new Date("2025-06-15T10:00:00Z"),
      locationOrLink: "Conference Room A",
      participants: [USERS.PM.id, USERS.CONTRACTOR.id],
    }
  });

  await prisma.calendarEvent.create({
    data: {
      title: "Site Inspection - Lagos Ibadan",
      date: new Date("2025-07-01"),
      status: EventStatus.planned,
      priority: EventPriority.high,
      project: "Lagos-Ibadan Rehab",
    }
  });

  console.log("\n✅ Seed completed successfully!");
  console.log(`\n🔑 Login Credentials (Password: password123):`);
  console.log(`   Admin:       ${USERS.ADMIN.email}`);
  console.log(`   PM:          ${USERS.PM.email}`);
  console.log(`   Contractor:  ${USERS.CONTRACTOR.email}`);
  console.log(`   Finance:     ${USERS.FINANCE.email}`);
  console.log(`   Procurement: ${USERS.PROCUREMENT.email}`);
  console.log(`   Auditor:     ${USERS.AUDITOR.email}`);
  console.log(`   Vendor:      ${USERS.VENDOR.email}`);
}

main()
  .catch((e) => {
    console.error("Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
