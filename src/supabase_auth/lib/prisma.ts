/**
 * Modular Supabase Auth - Prisma Client
 *
 * This file initializes the Prisma client for database operations.
 * Note: Prisma is typically used on the server-side. For client-only apps,
 * use Supabase client directly.
 *
 * Setup:
 * 1. Install Prisma: npm install prisma @prisma/client
 * 2. Initialize: npx prisma init
 * 3. Update DATABASE_URL in .env with your Supabase connection string
 * 4. Run: npx prisma generate
 * 5. Run: npx prisma db pull (to sync with existing tables)
 *
 * Connection String Format (Supabase):
 * Direct: postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres
 * Pooled: postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true
 */

// ============================================================================
// IMPORTANT: Prisma Client for Server-Side Only
// ============================================================================

/**
 * For server-side usage (Next.js API routes, Express, etc.):
 *
 * ```typescript
 * import { PrismaClient } from '../../generated/prisma';
 *
 * // Prevent multiple instances in development
 * const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };
 *
 * export const prisma =
 *   globalForPrisma.prisma ||
 *   new PrismaClient({
 *     log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
 *   });
 *
 * if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
 * ```
 */

// ============================================================================
// Client-Side: Use Supabase Client
// ============================================================================

/**
 * For client-side React/Vite apps, use the Supabase client instead:
 *
 * ```typescript
 * import { supabase } from './supabase';
 *
 * // Query example
 * const { data, error } = await supabase
 *   .from('users')
 *   .select('*')
 *   .eq('id', userId);
 *
 * // Insert example
 * const { data, error } = await supabase
 *   .from('task_lists')
 *   .insert({ name: 'My List', data: taskData, user_id: userId });
 * ```
 */

// ============================================================================
// Type Definitions (matching Prisma schema)
// ============================================================================

export interface PrismaUser {
  id: string;
  email: string;
  role: string;
  createdAt: Date;
}

export interface PrismaTaskList {
  id: string;
  name: string;
  data: unknown; // JSON
  createdAt: Date;
  userId: string | null;
  isExample: boolean;
}

// ============================================================================
// Example Prisma Queries (for reference)
// ============================================================================

/**
 * Example queries using Prisma client:
 *
 * ```typescript
 * // Find user by ID
 * const user = await prisma.user.findUnique({
 *   where: { id: userId },
 *   include: { taskLists: true }
 * });
 *
 * // Create task list
 * const taskList = await prisma.taskList.create({
 *   data: {
 *     name: 'My List',
 *     data: JSON.stringify(tasks),
 *     userId: user.id,
 *     isExample: false
 *   }
 * });
 *
 * // Get all example lists
 * const examples = await prisma.taskList.findMany({
 *   where: { isExample: true }
 * });
 *
 * // Delete user and cascade to task lists
 * await prisma.user.delete({
 *   where: { id: userId }
 * });
 * ```
 */

export const PRISMA_DOCS = 'https://www.prisma.io/docs';
export const SUPABASE_PRISMA_GUIDE = 'https://supabase.com/docs/guides/integrations/prisma';
