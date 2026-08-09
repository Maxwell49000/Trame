import { z } from 'zod'
import prisma from '../prismaClient.js'
import { hashPassword, verifyPassword } from '../auth/password.js'
import { createSession, destroySession, publicUser } from '../auth/session.js'

const loginSchema = z.object({
    email: z.string().trim().toLowerCase().email().max(254),
    password: z.string().min(1).max(200)
})
const changePasswordSchema = z.object({
    currentPassword: z.string().min(1).max(200),
    newPassword: z.string().min(12).max(200)
})
const dummyHash = await hashPassword('not-a-real-password-123')

export async function login(req, res, next) {
    try {
        const { email, password } = loginSchema.parse(req.body)
        const user = await prisma.user.findUnique({ where: { email } })
        const passwordValid = await verifyPassword(password, user?.password_hash || dummyHash)
        if (!user || !user.is_active || !passwordValid) {
            return res.status(401).json({ error: 'Email ou mot de passe incorrect' })
        }
        await prisma.session.deleteMany({ where: { expires_at: { lt: new Date() } } })
        const csrfToken = await createSession(user.id, res)
        res.setHeader('Cache-Control', 'no-store')
        res.json({ user: publicUser(user), csrfToken })
    } catch (error) {
        if (error?.issues) return res.status(400).json({ error: 'Identifiants invalides' })
        next(error)
    }
}

export function me(req, res) {
    res.setHeader('Cache-Control', 'no-store')
    res.json({ user: publicUser(req.user), csrfToken: req.authSession.csrf_token })
}

export async function logout(req, res, next) {
    try {
        await destroySession(req, res)
        res.setHeader('Cache-Control', 'no-store')
        res.status(204).end()
    } catch (error) {
        next(error)
    }
}

export async function changePassword(req, res, next) {
    try {
        const input = changePasswordSchema.parse(req.body)
        const valid = await verifyPassword(input.currentPassword, req.user.password_hash)
        if (!valid) return res.status(400).json({ error: 'Mot de passe actuel incorrect' })

        await prisma.$transaction([
            prisma.user.update({
                where: { id: req.user.id },
                data: { password_hash: await hashPassword(input.newPassword) }
            }),
            prisma.session.deleteMany({
                where: { user_id: req.user.id, id: { not: req.authSession.id } }
            })
        ])
        res.status(204).end()
    } catch (error) {
        if (error?.issues) return res.status(400).json({ error: error.issues })
        next(error)
    }
}
