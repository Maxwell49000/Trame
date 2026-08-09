import 'dotenv/config'
import prisma from '../src/prismaClient.js'
import { hashPassword } from '../src/auth/password.js'

const email = String(process.env.ADMIN_EMAIL || '').trim().toLowerCase()
const name = String(process.env.ADMIN_NAME || 'Administrateur').trim()
const password = String(process.env.ADMIN_PASSWORD || '')

if (!email || !email.includes('@')) throw new Error('ADMIN_EMAIL doit contenir une adresse email valide')
if (!name) throw new Error('ADMIN_NAME est requis')

try {
    const passwordHash = await hashPassword(password)
    const admin = await prisma.user.upsert({
        where: { email },
        update: { name, role: 'ADMIN', is_active: true, password_hash: passwordHash },
        create: { email, name, role: 'ADMIN', password_hash: passwordHash }
    })
    await prisma.session.deleteMany({ where: { user_id: admin.id } })
    console.log(`Compte administrateur prêt : ${admin.email}`)
} finally {
    await prisma.$disconnect()
}
