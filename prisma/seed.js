const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // Clear existing data (in reverse order of dependencies)
  console.log('Clearing existing data...');
  await prisma.calendarEvent.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.discrepancyRemark.deleteMany();
  await prisma.meetingMinutes.deleteMany();
  await prisma.meeting.deleteMany();
  await prisma.award.deleteMany();
  await prisma.bid.deleteMany();
  await prisma.procurementRequest.deleteMany();
  await prisma.revenue.deleteMany();
  await prisma.expenditure.deleteMany();
  await prisma.budgetAllocation.deleteMany();
  await prisma.milestoneSubmission.deleteMany();
  await prisma.project.deleteMany();
  await prisma.user.deleteMany();
  await prisma.mDA.deleteMany();

  console.log('Deleted existing data.');

  // ========== FIRST PASS: Create MDAs ==========
  console.log('Creating MDAs...');
  const mdas = [
    { id: 'm1', name: 'Ministry of Works', category: 'Infrastructure', isActive: true },
    { id: 'm2', name: 'Ministry of Health', category: 'Healthcare', isActive: true },
    { id: 'm3', name: 'Ministry of Education', category: 'Education', isActive: true },
    { id: 'm4', name: 'Ministry of Agriculture', category: 'Agriculture', isActive: true },
    { id: 'm5', name: 'Ministry of Finance', category: 'Finance', isActive: true },
  ];

  for (const mda of mdas) {
    await prisma.mDA.create({ data: mda });
  }

  // ========== SECOND PASS: Create Users ==========
  console.log('Creating Users...');
  const users = [
    { id: 'u1', name: 'Ibrahim Musa', email: 'ibrahim.musa@example.com', role: 'Admin', mdaId: 'm1', status: 'active' },
    { id: 'u2', name: 'Zainab Abdullahi', email: 'zainab.abdullahi@example.com', role: 'ProjectManager', mdaId: 'm2', status: 'active' },
    { id: 'u3', name: 'Abubakar Sadiq', email: 'abubakar.sadiq@construction.com', role: 'Contractor', mdaId: 'm1', status: 'active' },
    { id: 'u4', name: 'Fatima Yusuf', email: 'fatima.yusuf@finance.gov', role: 'FinanceOfficer', mdaId: 'm5', status: 'active' },
    { id: 'u5', name: 'Umar Farouk', email: 'umar.farouk@audit.gov', role: 'Auditor', mdaId: 'm5', status: 'active' },
  ];

  for (const user of users) {
    await prisma.user.create({ data: user });
  }

  // ========== THIRD PASS: Create Projects ==========
  console.log('Creating Projects...');
  const projects = [
    { 
      id: 'p1', title: 'Kano-Kaduna Road Rehabilitation', description: 'Dualization and rehabilitation of the expressway', 
      category: 'Infrastructure', supervisingMdaId: 'm1', contractorId: 'u3', contractValue: 50000000, 
      startDate: new Date('2024-01-01'), endDate: new Date('2025-12-31'), status: 'InProgress', evidenceDocs: []
    },
    { 
      id: 'p2', title: 'General Hospital Sokoto Renovation', description: 'Upgrading of wards and surgical theaters', 
      category: 'Healthcare', supervisingMdaId: 'm2', contractorId: 'u3', contractValue: 20000000, 
      startDate: new Date('2024-03-01'), endDate: new Date('2025-06-30'), status: 'Planned', evidenceDocs: []
    },
    { 
      id: 'p3', title: 'Model Islamic School Abuja', description: 'Construction of new classroom blocks and mosque', 
      category: 'Education', supervisingMdaId: 'm3', contractorId: 'u3', contractValue: 15000000, 
      startDate: new Date('2023-01-01'), endDate: new Date('2024-06-30'), status: 'Completed', evidenceDocs: []
    },
    { 
      id: 'p4', title: 'Hadejia Irrigation Scheme', description: 'Expansion of irrigation canals for dry season farming', 
      category: 'Agriculture', supervisingMdaId: 'm4', contractorId: 'u3', contractValue: 30000000, 
      startDate: new Date('2024-02-01'), endDate: new Date('2025-12-31'), status: 'Delayed', evidenceDocs: []
    },
    { 
      id: 'p5', title: 'Digital Innovation Hub Katsina', description: 'Construction of ICT center for youth empowerment', 
      category: 'Technology', supervisingMdaId: 'm1', contractorId: 'u3', contractValue: 40000000, 
      startDate: new Date('2024-04-01'), endDate: new Date('2026-03-31'), status: 'InProgress', evidenceDocs: []
    },
  ];

  for (const project of projects) {
    await prisma.project.create({ data: project });
  }

  // ========== FOURTH PASS: Create Milestone Submissions ==========
  console.log('Creating Milestone Submissions...');
  const submissions = [
    { id: 's1', projectId: 'p1', contractorId: 'u3', milestoneStage: 'Foundation', percentComplete: 100, status: 'Approved', evidenceDocs: [] },
    { id: 's2', projectId: 'p1', contractorId: 'u3', milestoneStage: 'Superstructure', percentComplete: 50, status: 'Pending', evidenceDocs: [] },
    { id: 's3', projectId: 'p2', contractorId: 'u3', milestoneStage: 'PreConstruction', percentComplete: 100, status: 'Approved', evidenceDocs: [] },
    { id: 's4', projectId: 'p5', contractorId: 'u3', milestoneStage: 'Foundation', percentComplete: 80, status: 'Pending', evidenceDocs: [] },
    { id: 's5', projectId: 'p3', contractorId: 'u3', milestoneStage: 'Handover', percentComplete: 100, status: 'Approved', evidenceDocs: [] },
  ];

  for (const sub of submissions) {
    await prisma.milestoneSubmission.create({ data: sub });
  }

  // ========== FIFTH PASS: Create Expenditures ==========
  console.log('Creating Expenditures...');
  const expenditures = [
    { id: 'e1', projectId: 'p1', amount: 1000000, date: new Date('2024-02-15'), recipient: 'Alhaji Construction Ltd', supportingDocs: [] },
    { id: 'e2', projectId: 'p1', amount: 500000, date: new Date('2024-03-10'), recipient: 'Cement Suppliers Nig', supportingDocs: [] },
    { id: 'e3', projectId: 'p2', amount: 2000000, date: new Date('2024-04-05'), recipient: 'Alhaji Construction Ltd', supportingDocs: [] },
    { id: 'e4', projectId: 'p3', amount: 750000, date: new Date('2024-01-20'), recipient: 'Consultant Aminu', supportingDocs: [] },
    { id: 'e5', projectId: 'p4', amount: 1200000, date: new Date('2024-03-25'), recipient: 'Irrigation Experts Ltd', supportingDocs: [] },
  ];

  for (const exp of expenditures) {
    await prisma.expenditure.create({ data: exp });
  }

  // ========== SIXTH PASS: Create Revenues ==========
  console.log('Creating Revenues...');
  const revenues = [
    { id: 'r1', mdaId: 'm1', type: 'Federal Allocation', amount: 100000000, date: new Date('2024-01-01'), supportingDocs: [] },
    { id: 'r2', mdaId: 'm2', type: 'Donor Grant', amount: 50000000, date: new Date('2024-02-01'), supportingDocs: [] },
    { id: 'r3', mdaId: 'm3', type: 'Federal Allocation', amount: 80000000, date: new Date('2024-01-01'), supportingDocs: [] },
    { id: 'r4', mdaId: 'm4', type: 'IGR', amount: 20000000, date: new Date('2024-03-01'), supportingDocs: [] },
    { id: 'r5', mdaId: 'm5', type: 'Federal Allocation', amount: 150000000, date: new Date('2024-01-01'), supportingDocs: [] },
  ];

  for (const rev of revenues) {
    await prisma.revenue.create({ data: rev });
  }

  // ========== SEVENTH PASS: Create Budget Allocations ==========
  console.log('Creating Budget Allocations...');
  const budgets = [
    { id: 'b1', mdaId: 'm1', fiscalYear: 2024, quarter: 1, amount: 100000000, source: 'Federal', supportingDocs: [] },
    { id: 'b2', mdaId: 'm2', fiscalYear: 2024, quarter: 1, amount: 50000000, source: 'State', supportingDocs: [] },
    { id: 'b3', mdaId: 'm3', fiscalYear: 2024, quarter: 1, amount: 80000000, source: 'Federal', supportingDocs: [] },
    { id: 'b4', mdaId: 'm4', fiscalYear: 2024, quarter: 1, amount: 20000000, source: 'Donor', supportingDocs: [] },
    { id: 'b5', mdaId: 'm5', fiscalYear: 2024, quarter: 1, amount: 150000000, source: 'Federal', supportingDocs: [] },
  ];

  for (const budget of budgets) {
    await prisma.budgetAllocation.create({ data: budget });
  }

  // ========== EIGHTH PASS: Create Procurement Requests ==========
  console.log('Creating Procurement Requests...');
  const tenders = [
    { id: 't1', mdaId: 'm1', title: 'Kano-Kaduna Road Tender', description: 'Bidding for Road Rehabilitation', estimatedCost: 50000000, requestDate: new Date('2023-11-01'), status: 'Open', documents: [] },
    { id: 't2', mdaId: 'm2', title: 'Sokoto Hospital Tender', description: 'Bidding for Hospital Renovation', estimatedCost: 20000000, requestDate: new Date('2024-01-15'), status: 'Closed', documents: [] },
    { id: 't3', mdaId: 'm3', title: 'Islamic School Tender', description: 'Bidding for School Construction', estimatedCost: 15000000, requestDate: new Date('2022-10-01'), status: 'Awarded', documents: [] },
    { id: 't4', mdaId: 'm4', title: 'Hadejia Irrigation Tender', description: 'Bidding for Irrigation Project', estimatedCost: 30000000, requestDate: new Date('2024-01-01'), status: 'Bidding', documents: [] },
    { id: 't5', mdaId: 'm5', title: 'Katsina Tech Hub Tender', description: 'Bidding for Tech Hub', estimatedCost: 40000000, requestDate: new Date('2024-02-01'), status: 'Open', documents: [] },
  ];

  for (const tender of tenders) {
    await prisma.procurementRequest.create({ data: tender });
  }

  // ========== NINTH PASS: Create Awards ==========
  console.log('Creating Awards...');
  const awards = [
    { id: 'a1', procurementRequestId: 't1', vendorId: 'u3', contractValue: 50000000, awardDate: new Date('2023-12-01') },
    { id: 'a2', procurementRequestId: 't2', vendorId: 'u3', contractValue: 20000000, awardDate: new Date('2024-02-01') },
    { id: 'a3', procurementRequestId: 't3', vendorId: 'u3', contractValue: 15000000, awardDate: new Date('2022-11-15') },
    { id: 'a4', procurementRequestId: 't4', vendorId: 'u3', contractValue: 30000000, awardDate: new Date('2024-01-20') },
    { id: 'a5', procurementRequestId: 't5', vendorId: 'u3', contractValue: 40000000, awardDate: new Date('2024-03-01') },
  ];

  for (const award of awards) {
    await prisma.award.create({ data: award });
  }

  // ========== TENTH PASS: Create Calendar Events ==========
  console.log('Creating Calendar Events...');
  const events = [
    { id: 'ev1', title: 'Project Kickoff - Kano Road', date: new Date('2024-01-15'), startTime: '09:00', endTime: '10:00', status: 'planned', priority: 'high', description: 'Kickoff meeting with Alhaji Construction' },
    { id: 'ev2', title: 'Site Inspection - Sokoto', date: new Date('2024-04-10'), startTime: '11:00', endTime: '13:00', status: 'on_track', priority: 'medium', description: 'Inspect foundation works' },
    { id: 'ev3', title: 'Budget Review Q1', date: new Date('2024-03-30'), startTime: '14:00', endTime: '15:00', status: 'completed', priority: 'high', description: 'Review Q1 budget performance' },
    { id: 'ev4', title: 'Stakeholder Meeting - Abuja', date: new Date('2024-05-20'), startTime: '10:00', endTime: '12:00', status: 'delayed', priority: 'medium', description: 'Meet with community leaders' },
    { id: 'ev5', title: 'Audit Report Presentation', date: new Date('2024-06-15'), startTime: '09:00', endTime: '17:00', status: 'planned', priority: 'low', description: 'Prepare audit report for Ministry' },
  ];

  for (const event of events) {
    await prisma.calendarEvent.create({ data: event });
  }

  console.log('Seed completed successfully!');
  console.log(`Created: ${mdas.length} MDAs`);
  console.log(`Created: ${users.length} users`);
  console.log(`Created: ${projects.length} projects`);
  console.log(`Created: ${submissions.length} milestone submissions`);
  console.log(`Created: ${expenditures.length} expenditures`);
  console.log(`Created: ${revenues.length} revenues`);
  console.log(`Created: ${budgets.length} budget allocations`);
  console.log(`Created: ${tenders.length} procurement requests`);
  console.log(`Created: ${awards.length} awards`);
  console.log(`Created: ${events.length} calendar events`);
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
