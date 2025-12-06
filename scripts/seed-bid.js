const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    // 1. Get a tender (or create one)
    let tender = await prisma.procurementRequest.findFirst();
    if (!tender) {
      console.log("No tender found, creating one...");
      const mda = await prisma.mDA.findFirst();
      if (!mda) throw new Error("No MDA found to create tender");
      
      tender = await prisma.procurementRequest.create({
        data: {
          title: "Test Tender for Renovation",
          description: "Renovation of the main office complex",
          estimatedCost: 5000000,
          requestDate: new Date(),
          status: "Open",
          mdaId: mda.id,
          documents: [],
        }
      });
    }
    console.log("Using tender:", tender.id);

    // 2. Get a vendor (user)
    let vendor = await prisma.user.findFirst({ where: { role: "Vendor" } });
    if (!vendor) {
      console.log("No vendor found, creating one...");
      vendor = await prisma.user.create({
        data: {
          email: "vendor@example.com",
          name: "Test Vendor Construction Ltd",
          role: "Vendor",
          status: "active",
        }
      });
    }
    console.log("Using vendor:", vendor.id);

    // 3. Create a bid
    const bid = await prisma.bid.create({
      data: {
        procurementRequestId: tender.id,
        vendorId: vendor.id,
        bidAmount: 4800000,
        proposalDocs: ["proposal.pdf"],
        complianceDocs: ["tax_clearance.pdf"],
        status: "Submitted",
        submittedAt: new Date(),
      }
    });

    console.log("Created bid:", bid.id);
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
