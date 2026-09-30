import { PrismaClient } from '@/generated/prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function crearCliente() {
  const adapter = new PrismaBetterSqlite3({ url: './dev.db' })
  return new PrismaClient({ adapter })
}

export const prisma = globalForPrisma.prisma ?? crearCliente()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
