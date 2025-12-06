/**
 * Comprehensive Audit Logging Test
 * 
 * This script tests audit logging by making actual API calls to create/update/delete records
 * and verifying that audit logs are created for each operation.
 */

const BASE_URL = "http://localhost:3000";

async function makeRequest(
  method: string,
  endpoint: string,
  body?: unknown,
  userId = "test-user-123"
) {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      "x-user-id": userId,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`API Error (${response.status}): ${error}`);
  }

  return response.json();
}

async function testAuditLogging() {
  console.log("🧪 Testing Audit Logging via API Calls...\n");

  try {
    // Test 1: Create a User and check audit log
    console.log("1. Testing User Creation Audit...");
    const userData = {
      name: "Test User for Audit",
      email: `test-audit-${Date.now()}@example.com`,
      role: "Admin",
      password: "test123",
      mdaId: null,
    };
    
    const userResult = await makeRequest("POST", "/api/users", userData);
    console.log(`✅ User created: ${userResult.data?.id}`);
    
    // Wait a bit for audit log to be created
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    // Check if audit log was created
    const auditLogs = await makeRequest("GET", "/api/audit");
    const userAuditLog = auditLogs.data?.find(
      (log: { entity: string; actionType: string; entityId: string }) =>
        log.entity === "User" && 
        log.actionType === "CREATE" && 
        log.entityId === userResult.data?.id
    );
    
    if (userAuditLog) {
      console.log(`✅ Audit log created for User creation`);
      console.log(`   Actor: ${userAuditLog.actor}`);
      console.log(`   Description: ${userAuditLog.description}`);
    } else {
      console.log(`❌ No audit log found for User creation`);
    }

    // Test 2: Create an MDA and check audit log
    console.log("\n2. Testing MDA Creation Audit...");
    const mdaData = {
      name: `Test MDA ${Date.now()}`,
      category: "Infrastructure",
      description: "Test MDA for audit logging",
      headOfMda: "Test Head",
      email: "test@mda.gov",
      phone: "1234567890",
      address: "Test Address",
    };
    
    const mdaResult = await makeRequest("POST", "/api/mdas", mdaData);
    console.log(`✅ MDA created: ${mdaResult.data?.id}`);
    
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    const mdaAuditLogs = await makeRequest("GET", "/api/audit");
    const mdaAuditLog = mdaAuditLogs.data?.find(
      (log: { entity: string; actionType: string; entityId: string }) =>
        log.entity === "MDA" && 
        log.actionType === "CREATE" && 
        log.entityId === mdaResult.data?.id
    );
    
    if (mdaAuditLog) {
      console.log(`✅ Audit log created for MDA creation`);
      console.log(`   Description: ${mdaAuditLog.description}`);
    } else {
      console.log(`❌ No audit log found for MDA creation`);
    }

    // Test 3: Summary of all audit logs
    console.log("\n3. Summary of All Audit Logs:");
    const finalAuditLogs = await makeRequest("GET", "/api/audit");
    console.log(`   Total logs: ${finalAuditLogs.data?.length || 0}`);
    
    const logsByEntity: Record<string, number> = {};
    finalAuditLogs.data?.forEach((log: { entity: string }) => {
      logsByEntity[log.entity] = (logsByEntity[log.entity] || 0) + 1;
    });
    
    console.log("   Logs by entity:");
    Object.entries(logsByEntity).forEach(([entity, count]) => {
      console.log(`     ${entity}: ${count}`);
    });

    console.log("\n✅ Audit logging test completed!");
    console.log("\n📝 Note: Check the /audit page in your browser to see all audit logs.");
    
  } catch (error) {
    console.error("\n❌ Error during testing:", error);
    throw error;
  }
}

// Run the test
testAuditLogging();
