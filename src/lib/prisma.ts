import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'

const globalForPrisma = global as unknown as { prisma: PrismaClient | undefined }

function createPrismaClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL

  if (!connectionString) {
    throw new Error('DATABASE_URL is not defined')
  }

  const pool = new pg.Pool({ connectionString })
  const adapter = new PrismaPg(pool)

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })
}

function getPrismaClient(): PrismaClient {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createPrismaClient()
  }
  return globalForPrisma.prisma
}

// Lazy-initialized: prisma client is only created when first accessed at runtime,
// not when this module is imported during build.
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    return (getPrismaClient() as any)[prop]
  }
})
