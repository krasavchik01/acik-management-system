import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

const getPrisma = () => {
  if (globalForPrisma.prisma) return globalForPrisma.prisma

  const connectionString = process.env.DATABASE_URL
  
  // During Vercel build, DATABASE_URL is often missing.
  // We must not let pg.Pool throw an error here.
  if (!connectionString) {
    console.warn('[Prisma/Build] DATABASE_URL is not defined. Returning dummy client for static analysis.')
    return {} as PrismaClient
  }

  try {
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
  } catch (err) {
    console.error('[Prisma/Init] Failed to initialize prisma client:', err)
    return {} as PrismaClient
  }
}

// True lazy initialization via Proxy
export const prisma = new Proxy({} as PrismaClient, {
  get: (target, prop) => {
    // Handle framework-level property checks
    if (prop === '$$typeof' || prop === 'constructor' || prop === 'then') {
      return (target as any)[prop]
    }
    
    // During build, if DATABASE_URL is missing, return a dummy proxy for chaining
    if (!process.env.DATABASE_URL) {
      // Return a recursive proxy that allows prisma.task.findMany() etc.
      const dummy: any = () => dummy
      return new Proxy(dummy, { 
        get: () => dummy,
        apply: () => dummy 
      })
    }
    
    const instance = getPrisma()
    return (instance as any)[prop]
  }
})
