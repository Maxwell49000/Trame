import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis

let prisma
if (globalForPrisma.__prisma) {
    prisma = globalForPrisma.__prisma
} else {
    prisma = new PrismaClient()
    // Keep the client across module reloads in development to avoid
    // exhausting database connections.
    if (process.env.NODE_ENV !== 'production') globalForPrisma.__prisma = prisma
}

export default prisma
