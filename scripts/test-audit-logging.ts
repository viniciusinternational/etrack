import { PrismaClient, AuditActionType, AuditStatus } from "@prisma/client";

const prisma = new PrismaClient();

async function testAuditLogging() {
  console.log("🧪 Testing Audit Logging...\n");

  try {
    // Test 1: Create a test audit log entry
    console.log("1. Creating test audit log entry...");
    const testLog = await prisma.auditLog.create({
      data: {
        actor: "test-user-123",
        entity: "TestEntity",
        entityId: "test-entity-456",
        actionType: AuditActionType.CREATE,
        status: AuditStatus.SUCCESS,
        description: "Test audit log entry created by test script",
        before: undefined,
        after: undefined,
        ipAddress: "127.0.0.1",
        userAgent: "Test Script",
      },
    });
    console.log("✅ Test log created:", testLog.id);

    // Test 2: Query audit logs
    console.log("\n2. Querying all audit logs...");
    const allLogs = await prisma.auditLog.findMany({
      orderBy: { timestamp: "desc" },
      take: 10,
    });
    console.log(`✅ Found ${allLogs.length} audit log(s)`);
    
    if (allLogs.length > 0) {
      console.log("\nMost recent logs:");
      allLogs.forEach((log, index) => {
        console.log(`  ${index + 1}. [${log.actionType}] ${log.entity} - ${log.description}`);
        console.log(`     Actor: ${log.actor}, Status: ${log.status}, Time: ${log.timestamp}`);
      });
    }

    // Test 3: Query by action type
    console.log("\n3. Querying CREATE actions...");
    const createLogs = await prisma.auditLog.findMany({
      where: { actionType: AuditActionType.CREATE },
      take: 5,
    });
    console.log(`✅ Found ${createLogs.length} CREATE action(s)`);

    // Test 4: Query by entity
    console.log("\n4. Querying logs for specific entities...");
    const entities = ["User", "Project", "MDA", "Budget", "Revenue"];
    for (const entity of entities) {
      const count = await prisma.auditLog.count({
        where: { entity },
      });
      console.log(`   ${entity}: ${count} log(s)`);
    }

    // Test 5: Clean up test log
    console.log("\n5. Cleaning up test log...");
    await prisma.auditLog.delete({
      where: { id: testLog.id },
    });
    console.log("✅ Test log deleted");

    console.log("\n✅ All tests passed! Audit logging is working correctly.");
  } catch (error) {
    console.error("\n❌ Error during testing:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

testAuditLogging();
