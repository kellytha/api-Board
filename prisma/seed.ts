import { PrismaClient } from '@prisma/client';
import { PasswordService } from '../src/utils/password.js';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Clear existing data
  await prisma.comment.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.card.deleteMany();
  await prisma.column.deleteMany();
  await prisma.board.deleteMany();
  await prisma.user.deleteMany();

  // Create test users
  const hashedPassword = await PasswordService.hashPassword('password123');

  const user1 = await prisma.user.create({
    data: {
      email: 'alice@example.com',
      username: 'alice',
      password: hashedPassword,
    },
  });

  const user2 = await prisma.user.create({
    data: {
      email: 'bob@example.com',
      username: 'bob',
      password: hashedPassword,
    },
  });

  console.log('Users created:', user1.email, user2.email);

  // Create boards
  const board1 = await prisma.board.create({
    data: {
      name: 'Product Launch 2024',
      description: 'Planning and execution of the new product launch',
      userId: user1.id,
    },
  });

  const board2 = await prisma.board.create({
    data: {
      name: 'Bug Tracking',
      description: 'Track and manage reported bugs',
      userId: user1.id,
    },
  });

  console.log('Boards created:', board1.name, board2.name);

  // Create columns
  const column1 = await prisma.column.create({
    data: {
      name: 'To Do',
      position: 0,
      boardId: board1.id,
    },
  });

  const column2 = await prisma.column.create({
    data: {
      name: 'In Progress',
      position: 1,
      boardId: board1.id,
    },
  });

  const column3 = await prisma.column.create({
    data: {
      name: 'Done',
      position: 2,
      boardId: board1.id,
    },
  });

  console.log('Columns created');

  // Create tags
  const tagUrgent = await prisma.tag.create({
    data: {
      name: 'Urgent',
      color: '#ff6b6b',
    },
  });

  const tagFeature = await prisma.tag.create({
    data: {
      name: 'Feature',
      color: '#4dabf7',
    },
  });

  const tagBug = await prisma.tag.create({
    data: {
      name: 'Bug',
      color: '#ffa94d',
    },
  });

  console.log('Tags created');

  // Create cards
  const card1 = await prisma.card.create({
    data: {
      title: 'Design API specifications',
      description: 'Create comprehensive API documentation with examples',
      position: 0,
      columnId: column1.id,
      dueDate: new Date('2024-03-15'),
      tags: {
        connect: [{ id: tagFeature.id }],
      },
    },
  });

  const card2 = await prisma.card.create({
    data: {
      title: 'Setup authentication',
      description: 'Implement JWT-based authentication with refresh tokens',
      position: 1,
      columnId: column1.id,
      dueDate: new Date('2024-03-20'),
    },
  });

  const card3 = await prisma.card.create({
    data: {
      title: 'Fix login bug',
      description: 'Users getting 500 error on login sometimes',
      position: 0,
      columnId: column2.id,
      dueDate: new Date('2024-03-10'),
      tags: {
        connect: [{ id: tagBug.id }, { id: tagUrgent.id }],
      },
    },
  });

  console.log('Cards created');

  // Create comments
  const comment1 = await prisma.comment.create({
    data: {
      content: 'Let\'s prioritize this task for next sprint',
      cardId: card1.id,
      userId: user1.id,
    },
  });

  const comment2 = await prisma.comment.create({
    data: {
      content: 'I\'ll help with the implementation',
      cardId: card1.id,
      userId: user2.id,
    },
  });

  console.log('Comments created');

  console.log('\n🎉 Database seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
