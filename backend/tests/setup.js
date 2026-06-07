import { PrismaClient } from '@prisma/client';

// =============================================================================
// Test Database Setup & Teardown
// =============================================================================
// Provides a shared Prisma client and lifecycle helpers that wipe all tables
// between tests. Import `prisma` and `resetDatabase` in your test files, or
// rely on the global `beforeEach` hook when this file is loaded via Jest's
// `setupFilesAfterFramework`.
//
// Table order matters due to foreign key constraints (onDelete: Restrict/Cascade).
// We delete children before parents.
// =============================================================================

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'test' ? ['error'] : ['error', 'warn'],
});

/**
 * Ordered list of tables to truncate.
 * Must respect FK constraints: listing references user and category,
 * syndication_log references listing.
 */
const TABLES_IN_DELETE_ORDER = [
  'syndication_logs',
  'listings',
  'categories',
  'users',
];

/**
 * Truncates all application tables and resets auto-increment sequences.
 * Uses raw SQL because Prisma does not expose a truncate API.
 */
async function resetDatabase() {
  await prisma.$executeRawUnsafe(
    `TRUNCATE TABLE ${TABLES_IN_DELETE_ORDER.join(', ')} RESTART IDENTITY CASCADE`,
  );
}

/**
 * Disconnect the Prisma query engine pool.
 * Call this in `afterAll` to prevent open handles from hanging Jest.
 */
async function disconnectPrisma() {
  await prisma.$disconnect();
}

export { prisma, resetDatabase, disconnectPrisma };
