import crypto from 'crypto'
import prisma from '../prismaClient.js'

const SESSION_DURATION_MS = 8 * 60 * 60 * 1000

function secureCookies() {
    if (process.env.COOKIE_SECURE !== undefined) return process.env.COOKIE_SECURE === 'true'
    return process.env.NODE_ENV === 'production'
}

function sessionCookieName() {
    return secureCookies() ? '__Host-cms_session' : 'cms_session'
}

function hashToken(token) {
    return crypto.createHash('sha256').update(token).digest('hex')
}

function parseCookies(header = '') {
    return Object.fromEntries(header.split(';').map(part => {
        const separator = part.indexOf('=')
        if (separator < 0) return ['', '']
        const value = part.slice(separator + 1).trim()
        try { return [part.slice(0, separator).trim(), decodeURIComponent(value)] }
        catch { return ['', ''] }
    }).filter(([key]) => key))
}

function cookieOptions(maxAge) {
    return [
        `${sessionCookieName()}=`,
        'Path=/',
        'HttpOnly',
        'SameSite=Strict',
        secureCookies() ? 'Secure' : '',
        `Max-Age=${Math.max(0, Math.floor(maxAge / 1000))}`
    ].filter(Boolean)
}

export async function createSession(userId, res) {
    const token = crypto.randomBytes(32).toString('base64url')
    const csrfToken = crypto.randomBytes(24).toString('base64url')
    const expiresAt = new Date(Date.now() + SESSION_DURATION_MS)
    await prisma.session.create({
        data: { token_hash: hashToken(token), csrf_token: csrfToken, expires_at: expiresAt, user_id: userId }
    })
    res.setHeader('Set-Cookie', `${sessionCookieName()}=${encodeURIComponent(token)}; ${cookieOptions(SESSION_DURATION_MS).slice(1).join('; ')}`)
    return csrfToken
}

export async function destroySession(req, res) {
    const token = parseCookies(req.headers.cookie)[sessionCookieName()]
    if (token) await prisma.session.deleteMany({ where: { token_hash: hashToken(token) } })
    res.setHeader('Set-Cookie', `${sessionCookieName()}=; ${cookieOptions(0).slice(1).join('; ')}`)
}

export async function requireAuth(req, res, next) {
    try {
        const token = parseCookies(req.headers.cookie)[sessionCookieName()]
        if (!token) return res.status(401).json({ error: 'Authentification requise' })
        const session = await prisma.session.findUnique({
            where: { token_hash: hashToken(token) },
            include: { user: true }
        })
        if (!session || session.expires_at <= new Date() || !session.user.is_active) {
            if (session) await prisma.session.delete({ where: { id: session.id } })
            return res.status(401).json({ error: 'Session expirée' })
        }
        req.user = session.user
        req.authSession = session
        next()
    } catch (error) {
        next(error)
    }
}

export function requireAdmin(req, res, next) {
    if (req.user?.role !== 'ADMIN') return res.status(403).json({ error: 'Accès administrateur requis' })
    next()
}

export function requireCsrf(req, res, next) {
    const provided = String(req.get('x-csrf-token') || '')
    const expected = String(req.authSession?.csrf_token || '')
    const valid = provided.length === expected.length && provided.length > 0
        && crypto.timingSafeEqual(Buffer.from(provided), Buffer.from(expected))
    if (!valid) return res.status(403).json({ error: 'Jeton CSRF invalide' })
    next()
}

export function publicUser(user) {
    return { id: user.id, email: user.email, name: user.name, role: user.role, isActive: user.is_active }
}
