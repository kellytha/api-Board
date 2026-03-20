import { prisma } from '../db/prisma.js';
import 'dotenv/config';

afterAll(async () => {
  await prisma.$disconnect();
});