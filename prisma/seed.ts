import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Reset existing data
  await prisma.task.deleteMany({});
  await prisma.recurrence.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.user.deleteMany({});

  // 1. Create Default User
  const user = await prisma.user.create({
    data: {
      id: 'user-default',
      email: 'user@chronotask.internal',
      name: 'Default User',
    },
  });

  // 2. Create Categories
  const cat1 = await prisma.category.create({
    data: {
      id: 'cat-1',
      userId: user.id,
      name: 'Engineering',
      color: '#2563EB',
    },
  });

  const cat2 = await prisma.category.create({
    data: {
      id: 'cat-2',
      userId: user.id,
      name: 'Operations',
      color: '#059669',
    },
  });

  // 3. Create Recurrence Series
  const rec50 = await prisma.recurrence.create({
    data: {
      id: 'rec-50',
      frequency: 'WEEKDAYS',
      interval: 1,
      byWeekdays: JSON.stringify([1, 2, 3, 4, 5]),
      untilDate: '2026-10-30',
    },
  });

  // 4. Create Contract Baseline Tasks
  await prisma.task.create({
    data: {
      id: 'task-101',
      userId: user.id,
      title: 'Analyze Quarterly Metrics',
      description: 'Review performance reports for Q3',
      date: '2026-09-01',
      dueTime: '14:30',
      completed: true,
      completedAt: new Date('2026-09-01T14:45:00Z'),
      priority: 'HIGH',
      categoryId: cat1.id,
      recurrenceId: null,
      createdAt: new Date('2026-08-30T09:00:00Z'),
      updatedAt: new Date('2026-09-01T14:45:00Z'),
    },
  });

  await prisma.task.create({
    data: {
      id: 'task-102',
      userId: user.id,
      title: 'Deploy Gateway Update',
      description: null,
      date: '2026-09-01',
      dueTime: null,
      completed: false,
      completedAt: null,
      priority: 'URGENT',
      categoryId: cat2.id,
      recurrenceId: rec50.id,
      createdAt: new Date('2026-08-30T09:15:00Z'),
      updatedAt: new Date('2026-08-30T09:15:00Z'),
    },
  });

  // Additional tasks for week 2026-08-31 to 2026-09-06 to support realistic calendar & analytics metrics
  const additionalTasks = [
    // 2026-08-31 (Mon): 3 total, 3 completed
    { title: 'Weekly Sync', date: '2026-08-31', completed: true, priority: 'MEDIUM' },
    { title: 'Sprint Planning', date: '2026-08-31', completed: true, priority: 'HIGH' },
    { title: 'Email Triage', date: '2026-08-31', completed: true, priority: 'LOW' },

    // 2026-09-01 (Tue): task-101 (completed), task-102 (incomplete), plus 2 more (1 completed, 1 completed) -> 4 total, 3 completed
    { title: 'API Contract Alignment', date: '2026-09-01', completed: true, priority: 'MEDIUM' },
    { title: 'Database Backup Verification', date: '2026-09-01', completed: true, priority: 'LOW' },

    // 2026-09-02 (Wed): 5 total, 5 completed (Wednesday most productive day!)
    { title: 'Core Refactor Part 1', date: '2026-09-02', completed: true, priority: 'HIGH' },
    { title: 'Core Refactor Part 2', date: '2026-09-02', completed: true, priority: 'HIGH' },
    { title: 'Security Patch Rollout', date: '2026-09-02', completed: true, priority: 'URGENT' },
    { title: 'Documentation Update', date: '2026-09-02', completed: true, priority: 'LOW' },
    { title: 'Customer Issue Resolution', date: '2026-09-02', completed: true, priority: 'MEDIUM' },

    // 2026-09-03 (Thu): 2 total, 1 completed
    { title: 'Load Testing', date: '2026-09-03', completed: true, priority: 'MEDIUM' },
    { title: 'Benchmark Analysis', date: '2026-09-03', completed: false, priority: 'LOW' },

    // 2026-09-04 (Fri): 4 total, 3 completed
    { title: 'Release Candidate Prep', date: '2026-09-04', completed: true, priority: 'URGENT' },
    { title: 'Team Retro', date: '2026-09-04', completed: true, priority: 'MEDIUM' },
    { title: 'Audit Log Verification', date: '2026-09-04', completed: true, priority: 'MEDIUM' },
    { title: 'Backlog Grooming', date: '2026-09-04', completed: false, priority: 'LOW' },
  ];

  for (let i = 0; i < additionalTasks.length; i++) {
    const t = additionalTasks[i];
    await prisma.task.create({
      data: {
        userId: user.id,
        title: t.title,
        date: t.date,
        completed: t.completed,
        completedAt: t.completed ? new Date(`${t.date}T16:00:00Z`) : null,
        priority: t.priority,
        categoryId: cat1.id,
      },
    });
  }

  console.log('Seeding completed successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
