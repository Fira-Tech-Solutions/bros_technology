import { PrismaClient } from '@prisma/client';
import { DEFAULT_CATEGORIES } from '../src/modules/properties/defaultCategories.js';

const prisma = new PrismaClient();

async function main() {
  let created = 0;
  for (const cat of DEFAULT_CATEGORIES) {
    const existing = await prisma.category.findUnique({ where: { name: cat.name } });
    if (!existing) {
      await prisma.category.create({ data: cat });
      created++;
      console.log(`  ✓ Created: ${cat.name}`);
    } else {
      console.log(`  → Exists: ${cat.name}`);
    }
  }
  console.log(`\nDone. ${created} categories created.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
