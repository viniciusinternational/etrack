import { PrismaClient, UserRole } from "@prisma/client";
import { hashPassword } from "../lib/password";
import { ALL_PERMISSION_KEYS, type UserPermissions } from "../types/permissions";



const prisma = new PrismaClient();

/**
 * Build permissions JSON object with all permissions enabled
 * This creates a UserPermissions object where all permission keys are set to true
 */
function buildAllPermissionsJSON(): UserPermissions {
  const permissionsObj: Partial<UserPermissions> = {};

  // Initialize all permission keys to true
  for (const key of ALL_PERMISSION_KEYS) {
    permissionsObj[key] = true;
  }

  return permissionsObj as UserPermissions;
}

async function main() {
  console.log("Starting seed...");

  // Clear existing data (in reverse order of dependencies)
  console.log("Clearing existing data...");
  // await prisma.calendarEvent.deleteMany();
  // await prisma.auditLog.deleteMany();
  // await prisma.discrepancyRemark.deleteMany();
  // await prisma.meetingMinutes.deleteMany();
  // await prisma.meeting.deleteMany();
  // await prisma.award.deleteMany();
  // await prisma.bid.deleteMany();
  // await prisma.procurementRequest.deleteMany();
  // await prisma.revenue.deleteMany();
  // await prisma.expenditure.deleteMany();
  // await prisma.budgetAllocation.deleteMany();
  // await prisma.milestoneSubmission.deleteMany();
  // await prisma.project.deleteMany();
  await prisma.user.deleteMany();
  await prisma.mDA.deleteMany(); // Note: Prisma client uses PascalCase for model names

  console.log("Deleted existing data.");

  // ========== FIRST PASS: Create 10 MDAs ==========
  console.log("Creating MDAs...");
  const mdas = [
    {
      name: "Ministry of Works and Infrastructure",
      category: "Infrastructure",
      description: "Responsible for public works and infrastructure development",
      headOfMda: "Eng. Musa Abdullahi",
      email: "info@works.gov.ng",
      phone: "+234-800-123-4567",
      address: "Federal Secretariat, Abuja",
      isActive: true,
    },
    {
      name: "Ministry of Health",
      category: "Healthcare",
      description: "Oversees healthcare services and public health initiatives",
      headOfMda: "Dr. Fatima Ibrahim",
      email: "info@health.gov.ng",
      phone: "+234-800-123-4568",
      address: "Federal Ministry of Health, Abuja",
      isActive: true,
    },
    {
      name: "Ministry of Education",
      category: "Education",
      description: "Manages educational policies and programs",
      headOfMda: "Prof. Ahmed Bello",
      email: "info@education.gov.ng",
      phone: "+234-800-123-4569",
      address: "Federal Ministry of Education, Abuja",
      isActive: true,
    },
    {
      name: "Ministry of Agriculture and Rural Development",
      category: "Agriculture",
      description: "Promotes agricultural development and food security",
      headOfMda: "Alhaji Sani Mohammed",
      email: "info@agriculture.gov.ng",
      phone: "+234-800-123-4570",
      address: "Federal Ministry of Agriculture, Abuja",
      isActive: true,
    },
    {
      name: "Ministry of Finance",
      category: "Finance",
      description: "Manages fiscal policies and financial resources",
      headOfMda: "Dr. Zainab Usman",
      email: "info@finance.gov.ng",
      phone: "+234-800-123-4571",
      address: "Federal Ministry of Finance, Abuja",
      isActive: true,
    },
    {
      name: "Ministry of Water Resources",
      category: "Infrastructure",
      description: "Oversees water supply and management",
      headOfMda: "Eng. Hassan Yakubu",
      email: "info@water.gov.ng",
      phone: "+234-800-123-4572",
      address: "Federal Ministry of Water Resources, Abuja",
      isActive: true,
    },
    {
      name: "Ministry of Power",
      category: "Infrastructure",
      description: "Manages power generation and distribution",
      headOfMda: "Eng. Amina Lawal",
      email: "info@power.gov.ng",
      phone: "+234-800-123-4573",
      address: "Federal Ministry of Power, Abuja",
      isActive: true,
    },
    {
      name: "Ministry of Transportation",
      category: "Infrastructure",
      description: "Oversees transportation infrastructure and policies",
      headOfMda: "Eng. Ibrahim Suleiman",
      email: "info@transport.gov.ng",
      phone: "+234-800-123-4574",
      address: "Federal Ministry of Transportation, Abuja",
      isActive: true,
    },
    {
      name: "Ministry of Environment",
      category: "Environment",
      description: "Manages environmental protection and conservation",
      headOfMda: "Dr. Maryam Abubakar",
      email: "info@environment.gov.ng",
      phone: "+234-800-123-4575",
      address: "Federal Ministry of Environment, Abuja",
      isActive: true,
    },
    {
      name: "Ministry of Science and Technology",
      category: "Technology",
      description: "Promotes scientific research and technological innovation",
      headOfMda: "Prof. Kabiru Musa",
      email: "info@science.gov.ng",
      phone: "+234-800-123-4576",
      address: "Federal Ministry of Science and Technology, Abuja",
      isActive: true,
    },
  ];

  const createdMdas = [];
  for (const mda of mdas) {
    const created = await prisma.mDA.create({ data: mda });
    createdMdas.push(created);
  }

  console.log(`Created ${createdMdas.length} MDAs`);

  // ========== SECOND PASS: Create SuperAdmin User with All Permissions ==========
  console.log("Creating SuperAdmin user...");
  
  // Generate password for admin
  const adminPassword = 'admin@pass';
  const adminPasswordHash = hashPassword(adminPassword);

  // Build permissions JSON object with all permissions enabled
  const allPermissionsJSON = buildAllPermissionsJSON();

  const adminUser = await prisma.user.create({
    data: {
      firstname: "System",
      lastname: "Administrator",
      email: "admin@etrack.gov",
      role: UserRole.SuperAdmin,
      password: adminPasswordHash,
      mustChangePassword: true,
      status: "active",
      permissions: allPermissionsJSON, // Set JSON permissions (RBAS format)
    },
  });



// Then add this section AFTER creating MDAs and BEFORE creating the admin user

console.log("Creating role permission templates...");

const roleTemplates = [
  {
    role: UserRole.SuperAdmin,
    permissions: ALL_PERMISSION_KEYS, // All permissions
    description: "Full system access with all permissions"
  },
  {
    role: UserRole.Admin,
    permissions: [
      "view_user", "create_user", "edit_user", "delete_user",
      "view_mda", "create_mda", "edit_mda",
      "view_project", "create_project", "edit_project",
      "view_budget", "view_expenditure", "view_revenue"
    ],
    description: "Administrative access to users, MDAs, and projects"
  },
  {
    role: UserRole.GovernorAdmin,
    permissions: [
      "view_user", "view_mda", "view_project", "view_budget",
      "view_expenditure", "view_revenue", "view_audit",
      "view_meeting", "view_procurement"
    ],
    description: "Governor-level oversight and reporting access"
  },
  {
    role: UserRole.ProjectManager,
    permissions: [
      "view_project", "edit_project", "create_project",
      "view_milestone", "create_milestone", "edit_milestone",
      "view_budget", "view_expenditure",
      "view_meeting", "create_meeting"
    ],
    description: "Manage projects, milestones, and view financial data"
  },
  {
    role: UserRole.Contractor,
    permissions: [
      "view_project", "view_milestone", "create_milestone", "edit_milestone"
    ],
    description: "Submit and track project milestones"
  },
  {
    role: UserRole.FinanceOfficer,
    permissions: [
      "view_budget", "create_budget", "edit_budget",
      "view_expenditure", "create_expenditure", "edit_expenditure",
      "view_revenue", "create_revenue", "edit_revenue",
      "view_payment", "create_payment", "edit_payment",
      "view_project"
    ],
    description: "Manage financial operations and budgets"
  },
  {
    role: UserRole.ProcurementOfficer,
    permissions: [
      "view_procurement", "create_procurement", "edit_procurement",
      "view_bid", "create_bid", "edit_bid", "approve_bid",
      "view_award", "create_award"
    ],
    description: "Handle procurement requests and bidding processes"
  },
  {
    role: UserRole.Vendor,
    permissions: [
      "view_procurement", "view_bid", "create_bid", "edit_bid"
    ],
    description: "View procurement opportunities and submit bids"
  },
  {
    role: UserRole.Auditor,
    permissions: [
      "view_project", "view_budget", "view_expenditure", "view_revenue",
      "view_procurement", "view_audit", "create_audit", "edit_audit",
      "view_payment"
    ],
    description: "Audit and review financial and project data"
  },
  {
    role: UserRole.MeetingUser,
    permissions: [
      "view_meeting", "view_project"
    ],
    description: "Attend meetings and view basic project information"
  },
];

for (const template of roleTemplates) {
  await prisma.rolePermissionTemplate.upsert({
    where: { role: template.role },
    update: { 
      permissions: template.permissions,
      description: template.description 
    },
    create: template,
  });
}

console.log(`Created ${roleTemplates.length} role permission templates`);

  console.log(`Created admin user: ${adminUser.email}`);
  console.log(`Generated password: ${adminPassword}`);
  console.log("⚠️  IMPORTANT: Save this password securely. User must change it on first login.");
  console.log(`Set ${Object.keys(allPermissionsJSON).length} permissions in JSON field (RBAS format)`);

  console.log("\n✅ Seed completed successfully!");
  console.log(`\n📊 Summary:`);
  console.log(`   - MDAs: ${createdMdas.length}`);
  console.log(`   - Admin User: ${adminUser.email}`);
  console.log(`   - Admin Permissions: ${Object.keys(allPermissionsJSON).length} (all enabled)`);
  console.log(`\n🔑 Admin Credentials:`);
  console.log(`   Email: ${adminUser.email}`);
  console.log(`   Password: ${adminPassword}`);
  console.log(`   ⚠️  User must change password on first login`);
  console.log(`\n✅ Admin user has ALL permissions enabled (RBAS JSON format)`);
}

main()
  .catch((e) => {
    console.error("Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

