import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

const getPrisma = () => {
  if (globalForPrisma.prisma) return globalForPrisma.prisma

  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    // If we're here during build without a URL, return a proxy that will 
    // only error if actually called. But ideally this isn't called during build.
    console.warn('Prisma accessed without DATABASE_URL')
  }

  const pool = new pg.Pool({ connectionString })
  const adapter = new PrismaPg(pool)
  
  const client = new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

  if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = client
  }
  
  return client
}

// True lazy initialization via Proxy
export const prisma = new Proxy({} as PrismaClient, {
  get: (target, prop) => {
    const instance = getPrisma()
    return (instance as any)[prop]
  }
})
