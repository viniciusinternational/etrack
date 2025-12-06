
import { PrismaClient, UserRole, ProjectCategory, ProjectStatus, MilestoneStage, SubmissionStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting verification...');

  // 1. Create User with status
  const userEmail = `test-user-${Date.now()}@example.com`;
  const user = await prisma.user.create({
    data: {
      name: 'Test User',
      email: userEmail,
      role: UserRole.Contractor,
      status: 'active', // Testing status field
    },
  });
  console.log('User created:', user.id, user.status);

  if (user.status !== 'active') {
    throw new Error('User status mismatch!');
  }

  // 2. Create Project (required for submission)
  // We need an MDA first
  const mda = await prisma.mDA.create({
    data: {
      name: 'Test MDA',
      category: 'Ministry',
      isActive: true,
    }
  });

  const project = await prisma.project.create({
    data: {
      title: 'Test Project',
      description: 'Test Description',
      category: ProjectCategory.Infrastructure,
      supervisingMdaId: mda.id,
      contractorId: user.id,
      contractValue: 100000,
      startDate: new Date(),
      endDate: new Date(),
      status: ProjectStatus.Planned,
    }
  });
  console.log('Project created:', project.id);

  // 3. Create MilestoneSubmission with geoTag
  const geoTag = {
    type: 'Point',
    coordinates: [3.3792, 6.5244] // [lng, lat]
  };

  const submission = await prisma.milestoneSubmission.create({
    data: {
      projectId: project.id,
      contractorId: user.id,
      milestoneStage: MilestoneStage.Foundation,
      percentComplete: 50,
      status: SubmissionStatus.Pending,
      geoTag: geoTag, // Testing geoTag field
    }
  });
  console.log('Submission created:', submission.id, submission.geoTag);

  // Verify geoTag
  const fetchedSubmission = await prisma.milestoneSubmission.findUnique({
    where: { id: submission.id }
  });

  if (!fetchedSubmission?.geoTag) {
    throw new Error('GeoTag not saved!');
  }
  
  const savedGeoTag = fetchedSubmission.geoTag as any;
  if (savedGeoTag.coordinates[0] !== 3.3792 || savedGeoTag.coordinates[1] !== 6.5244) {
    throw new Error('GeoTag coordinates mismatch!');
  }

  console.log('Verification successful!');

  // Cleanup
  await prisma.milestoneSubmission.delete({ where: { id: submission.id } });
  await prisma.project.delete({ where: { id: project.id } });
  await prisma.mDA.delete({ where: { id: mda.id } });
  await prisma.user.delete({ where: { id: user.id } });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
