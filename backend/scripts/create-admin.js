import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createAdmin() {
  const email = 'admin.brostechnology@gmail.com';
  const password = 'Bros.strong@password123';
  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      password: hashedPassword,
      name: 'Admin',
      phone: '+1234567890',
      role: 'SUPER_ADMIN',
    },
  });

  console.log('Admin user created:', user.email, user.role);
}

createAdmin()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
