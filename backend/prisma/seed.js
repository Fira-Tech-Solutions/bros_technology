import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const SALT_ROUNDS = 12;

const DEFAULT_USERS = [
  {
    email: 'admin@brostechnology.com',
    password: 'Admin@12345',
    name: 'Super Admin',
    phone: '+251911000001',
    role: 'SUPER_ADMIN',
  },
  {
    email: 'agent@brostechnology.com',
    password: 'Agent@12345',
    name: 'Demo Agent',
    phone: '+251911000002',
    role: 'AGENT',
  },
  {
    email: 'agent2@brostechnology.com',
    password: 'Agent@12345',
    name: 'Second Agent',
    phone: '+251911000003',
    role: 'AGENT',
  },
];

async function main() {
  console.log('[Seed] Starting database seed...');

  for (const userData of DEFAULT_USERS) {
    const hashedPassword = await bcrypt.hash(userData.password, SALT_ROUNDS);

    const user = await prisma.user.upsert({
      where: { email: userData.email },
      update: {},
      create: {
        email: userData.email,
        password: hashedPassword,
        name: userData.name,
        phone: userData.phone,
        role: userData.role,
      },
    });

    console.log(`[Seed] ${user.role}: ${user.email} (${user.name})`);
  }

  console.log('[Seed] Default credentials:');
  console.log('  Admin:  admin@brostechnology.com  / Admin@12345');
  console.log('  Agent:  agent@brostechnology.com  / Agent@12345');
  console.log('  Agent2: agent2@brostechnology.com / Agent@12345');
  console.log('[Seed] Done');
}

main()
  .catch((err) => {
    console.error('[Seed] Failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
