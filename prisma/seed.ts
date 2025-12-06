import { PrismaClient, UserRole } from "@prisma/client";
import { ALL_PERMISSIONS } from "../lib/permission-constants";
import { generatePassword, hashPassword } from "../lib/password";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting seed...");

  // Clear existing data (in reverse order of dependencies)
  console.log("Clearing existing data...");
  // await prisma.userPermission.deleteMany();
  // await prisma.permission.deleteMany();
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
  // await prisma.user.deleteMany();
  // await prisma.mDA.deleteMany(); // Note: Prisma client uses PascalCase for model names

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

  // ========== SECOND PASS: Create All Permissions ==========
  console.log("Creating permissions...");
  const createdPermissions = [];

  for (const perm of ALL_PERMISSIONS) {
    const permission = await prisma.permission.upsert({
      where: {
        module_action: {
          module: perm.module,
          action: perm.action,
        },
      },
      update: {
        description: perm.description,
      },
      create: {
        module: perm.module,
        action: perm.action,
        description: perm.description,
      },
    });
    createdPermissions.push(permission);
  }

  console.log(`Created ${createdPermissions.length} permissions`);

  // ========== THIRD PASS: Create SuperAdmin User ==========
  console.log("Creating SuperAdmin user...");
  
  // Generate password for admin
  const adminPassword = generatePassword();
  const adminPasswordHash = hashPassword(adminPassword);

  const adminUser = await prisma.user.create({
    data: {
      name: "System Administrator",
      email: "admin@etrack.gov",
      role: UserRole.SuperAdmin,
      password: adminPasswordHash,
      mustChangePassword: true,
      status: "active",
    },
  });

  console.log(`Created admin user: ${adminUser.email}`);
  console.log(`Generated password: ${adminPassword}`);
  console.log("⚠️  IMPORTANT: Save this password securely. User must change it on first login.");

  // ========== FOURTH PASS: Assign All Permissions to Admin ==========
  console.log("Assigning all permissions to admin user...");
  
  const permissionIds = createdPermissions.map((p) => p.id);
  
  await prisma.userPermission.createMany({
    data: permissionIds.map((permissionId) => ({
      userId: adminUser.id,
      permissionId,
    })),
    skipDuplicates: true,
  });

  console.log(`Assigned ${permissionIds.length} permissions to admin user`);

  console.log("\n✅ Seed completed successfully!");
  console.log(`\n📊 Summary:`);
  console.log(`   - MDAs: ${createdMdas.length}`);
  console.log(`   - Permissions: ${createdPermissions.length}`);
  console.log(`   - Admin User: ${adminUser.email}`);
  console.log(`   - Admin Permissions: ${permissionIds.length}`);
  console.log(`\n🔑 Admin Credentials:`);
  console.log(`   Email: ${adminUser.email}`);
  console.log(`   Password: ${adminPassword}`);
  console.log(`   ⚠️  User must change password on first login`);
}

main()
  .catch((e) => {
    console.error("Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

