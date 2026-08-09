import prisma from '../prismaClient.js'
import archiver from 'archiver'
import { generateStaticSite } from '../utils/generator.js'
import { purgeSiteAssets } from '../utils/purge.js'
import { validateSitePayload } from '../validators/siteValidator.js'
import { siteAccessWhere } from '../auth/authorization.js'

function normalizeConfig(config = {}) {
    const { visitCard, ...cleanConfig } = config
    cleanConfig.sections = Array.isArray(cleanConfig.sections)
        ? cleanConfig.sections
            .filter(section => section?.type !== 'visitCard')
            .map(section => ({
                ...section,
                type: String(section.type || 'text'),
                title: String(section.title || ''),
                content: String(section.content || ''),
                textAlign: section.textAlign || 'left',
                style: section.style && typeof section.style === 'object' && !Array.isArray(section.style)
                    ? section.style
                    : {}
            }))
        : []
    return cleanConfig
}

function parseId(value) {
    const id = Number(value)
    return Number.isInteger(id) && id > 0 ? id : null
}

function sendError(res, error, context) {
    console.error(`${context}:`, error)
    if (error?.code === 'P2002') return res.status(409).json({ error: 'Ce slug est déjà utilisé' })
    if (error?.code === 'P2025') return res.status(404).json({ error: 'Site introuvable' })
    return res.status(500).json({ error: 'Une erreur interne est survenue' })
}

function validatedPayload(body) {
    const payload = { ...body, config: normalizeConfig(body?.config) }
    return validateSitePayload(payload)
}

const ownerSummary = { select: { id: true, name: true, email: true } }

export async function createSite(req, res) {
    try {
        const { name, slug, config } = validatedPayload(req.body)
        const site = await prisma.site.create({
            data: { name, slug, config, owner_id: req.user.id },
            include: { owner: ownerSummary }
        })
        res.status(201).json(site)
    } catch (error) {
        if (error?.issues) return res.status(400).json({ error: error.issues })
        return sendError(res, error, 'createSite')
    }
}

export async function getSite(req, res) {
    const id = parseId(req.params.id)
    if (!id) return res.status(400).json({ error: 'Identifiant invalide' })

    try {
        const site = await prisma.site.findFirst({
            where: siteAccessWhere(req.user, id),
            include: { owner: ownerSummary }
        })
        if (!site) return res.status(404).json({ error: 'Site introuvable' })
        res.json(site)
    } catch (error) {
        return sendError(res, error, 'getSite')
    }
}

export async function updateSite(req, res) {
    const id = parseId(req.params.id)
    if (!id) return res.status(400).json({ error: 'Identifiant invalide' })

    try {
        const existing = await prisma.site.findFirst({ where: siteAccessWhere(req.user, id) })
        if (!existing) return res.status(404).json({ error: 'Site introuvable' })
        const { name, slug, config } = validatedPayload(req.body)
        const site = await prisma.site.update({
            where: { id },
            data: { name, slug, config },
            include: { owner: ownerSummary }
        })
        res.json(site)
    } catch (error) {
        if (error?.issues) return res.status(400).json({ error: error.issues })
        return sendError(res, error, 'updateSite')
    }
}

export async function deleteSite(req, res) {
    const id = parseId(req.params.id)
    if (!id) return res.status(400).json({ error: 'Identifiant invalide' })

    try {
        const site = await prisma.site.findFirst({ where: siteAccessWhere(req.user, id) })
        if (!site) return res.status(404).json({ error: 'Site introuvable' })
        await purgeSiteAssets(site)
        await prisma.site.delete({ where: { id } })
        res.json({ message: 'Site supprimé' })
    } catch (error) {
        return sendError(res, error, 'deleteSite')
    }
}

export async function generateSite(req, res) {
    const id = parseId(req.params.id)
    if (!id) return res.status(400).json({ error: 'Identifiant invalide' })

    try {
        const site = await prisma.site.findFirst({ where: siteAccessWhere(req.user, id) })
        if (!site) return res.status(404).json({ error: 'Site introuvable' })
        const folder = await generateStaticSite(site)
        res.json({ message: 'Site généré', folder, slug: site.slug, name: site.name })
    } catch (error) {
        return sendError(res, error, 'generateSite')
    }
}

export async function exportSite(req, res) {
    const id = parseId(req.params.id)
    if (!id) return res.status(400).json({ error: 'Identifiant invalide' })

    try {
        const site = await prisma.site.findFirst({ where: siteAccessWhere(req.user, id) })
        if (!site) return res.status(404).json({ error: 'Site introuvable' })

        const folder = await generateStaticSite(site)
        const archive = archiver('zip', { zlib: { level: 9 } })
        archive.on('error', error => res.destroy(error))
        res.attachment(`${site.slug}.zip`)
        res.setHeader('Cache-Control', 'no-store')
        archive.pipe(res)
        archive.directory(folder, false)
        await archive.finalize()
    } catch (error) {
        if (res.headersSent) return res.destroy(error)
        return sendError(res, error, 'exportSite')
    }
}

export async function listSites(req, res) {
    try {
        const sites = await prisma.site.findMany({
            where: siteAccessWhere(req.user),
            orderBy: { updated_at: 'desc' },
            include: { owner: ownerSummary }
        })
        res.json(sites)
    } catch (error) {
        return sendError(res, error, 'listSites')
    }
}
