import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient() {
  // Use DIRECT_URL for non-pooled connection (works better with Prisma on serverless)
  const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL

  const pool = new Pool({
    connectionString,
    max: 1, // Serverless: limit connections
    idleTimeoutMillis: 20000,
    connectionTimeoutMillis: 10000,
  })

  const adapter = new PrismaPg(pool)

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  })
}

const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

export { prisma }
export default prisma
