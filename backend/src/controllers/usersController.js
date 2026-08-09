import { z } from 'zod'
import prisma from '../prismaClient.js'
import { hashPassword } from '../auth/password.js'
import { publicUser } from '../auth/session.js'

const createUserSchema = z.object({
    email: z.string().trim().toLowerCase().email().max(254),
    name: z.string().trim().min(1).max(120),
    password: z.string().min(12).max(200),
    role: z.enum(['USER', 'ADMIN']).default('USER')
})

const updateUserSchema = z.object({
    name: z.string().trim().min(1).max(120).optional(),
    role: z.enum(['USER', 'ADMIN']).optional(),
    isActive: z.boolean().optional(),
    password: z.string().min(12).max(200).optional()
}).refine(value => Object.keys(value).length > 0, 'Aucune modification fournie')

function parseId(value) {
    const id = Number(value)
    return Number.isInteger(id) && id > 0 ? id : null
}

async function isLastActiveAdmin(userId) {
    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user || user.role !== 'ADMIN' || !user.is_active) return false
    return await prisma.user.count({ where: { role: 'ADMIN', is_active: true } }) <= 1
}

export async function listUsers(req, res, next) {
    try {
        const users = await prisma.user.findMany({ orderBy: { created_at: 'asc' } })
        res.json(users.map(publicUser))
    } catch (error) {
        next(error)
    }
}

export async function createUser(req, res, next) {
    try {
        const input = createUserSchema.parse(req.body)
        const user = await prisma.user.create({
            data: {
                email: input.email,
                name: input.name,
                role: input.role,
                password_hash: await hashPassword(input.password)
            }
        })
        res.status(201).json(publicUser(user))
    } catch (error) {
        if (error?.issues) return res.status(400).json({ error: error.issues })
        if (error?.code === 'P2002') return res.status(409).json({ error: 'Cet email est déjà utilisé' })
        next(error)
    }
}

export async function updateUser(req, res, next) {
    const id = parseId(req.params.id)
    if (!id) return res.status(400).json({ error: 'Identifiant invalide' })
    try {
        const input = updateUserSchema.parse(req.body)
        if (id === req.user.id && (input.role !== undefined || input.isActive === false)) {
            return res.status(409).json({ error: 'Vous ne pouvez pas modifier votre propre rôle ou désactiver votre compte' })
        }
        if ((input.role === 'USER' || input.isActive === false) && await isLastActiveAdmin(id)) {
            return res.status(409).json({ error: 'Le dernier administrateur actif ne peut pas être désactivé ou rétrogradé' })
        }
        const data = {
            ...(input.name !== undefined && { name: input.name }),
            ...(input.role !== undefined && { role: input.role }),
            ...(input.isActive !== undefined && { is_active: input.isActive }),
            ...(input.password !== undefined && { password_hash: await hashPassword(input.password) })
        }
        const user = await prisma.user.update({ where: { id }, data })
        if (input.password !== undefined || input.isActive === false) {
            await prisma.session.deleteMany({ where: { user_id: id } })
        }
        res.json(publicUser(user))
    } catch (error) {
        if (error?.issues) return res.status(400).json({ error: error.issues })
        if (error?.code === 'P2025') return res.status(404).json({ error: 'Utilisateur introuvable' })
        next(error)
    }
}

export async function deleteUser(req, res, next) {
    const id = parseId(req.params.id)
    if (!id) return res.status(400).json({ error: 'Identifiant invalide' })
    if (id === req.user.id) return res.status(409).json({ error: 'Vous ne pouvez pas supprimer votre propre compte' })
    try {
        if (await isLastActiveAdmin(id)) {
            return res.status(409).json({ error: 'Le dernier administrateur actif ne peut pas être supprimé' })
        }
        await prisma.user.delete({ where: { id } })
        res.status(204).end()
    } catch (error) {
        if (error?.code === 'P2025') return res.status(404).json({ error: 'Utilisateur introuvable' })
        next(error)
    }
}
