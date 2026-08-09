import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import sitesRoutes from './routes/sites.js'
import authRoutes from './routes/auth.js'
import usersRoutes from './routes/users.js'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs/promises'
import { sanitizeSlug } from './utils/generator.js'


const __dirname = path.dirname(fileURLToPath(import.meta.url))

const app = express()

if (process.env.TRUST_PROXY === '1') app.set('trust proxy', 1)


const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:5173')
    .split(',')
    .map(origin => origin.trim())
    .filter(Boolean)

app.disable('x-powered-by')
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff')
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
    res.setHeader('X-Frame-Options', 'SAMEORIGIN')
    if (process.env.NODE_ENV === 'production') {
        res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
    }
    next()
})
app.use(cors({
    credentials: true,
    origin(origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) return callback(null, true)
        callback(new Error('Origin not allowed'))
    }
}))
app.use(express.json({ limit: process.env.JSON_LIMIT || '20mb' }))
app.use(morgan('dev'))

// Les anciens exports peuvent contenir du code qui n'est plus pris en charge :
// les servir comme documents strictement statiques empêche toute exécution résiduelle.
app.use('/generated', (req, res, next) => {
    res.setHeader('Content-Security-Policy', "default-src 'none'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; base-uri 'none'; form-action 'none'; frame-ancestors 'self'")
    next()
}, express.static(path.join(__dirname, '../generated')))

// Route pour servir le HTML généré avec les chemins corrects
app.get('/published/:slug', async (req, res) => {
    try {
        const slug = sanitizeSlug(req.params.slug)
        const htmlPath = path.join(__dirname, '../generated', slug, 'index.html')
        const html = await fs.readFile(htmlPath, 'utf-8')

        // Remplacer les chemins relatifs pour les assets et CSS
        const modifiedHtml = html
            .replace(/href="styles\.css"/g, `href="/generated/${slug}/styles.css"`)
            .replace(/src="assets\//g, `src="/generated/${slug}/assets/`)
            .replace(/href="assets\//g, `href="/generated/${slug}/assets/`)

        res.setHeader('Content-Type', 'text/html; charset=utf-8')
        res.setHeader('Cache-Control', 'no-cache')
        res.setHeader('Content-Security-Policy', "default-src 'none'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; base-uri 'none'; form-action 'none'; frame-ancestors 'self'")
        res.send(modifiedHtml)
    } catch (err) {
        console.error('Preview error:', err)
        res.status(404).send('Site not found')
    }
})

app.use('/auth', authRoutes)
app.use('/users', usersRoutes)
app.use('/sites', sitesRoutes)

app.get('/health', (req, res) => res.json({ status: 'ok' }))

app.use((err, req, res, next) => {
    console.error(err)
    if (err?.message === 'Origin not allowed') {
        return res.status(403).json({ error: 'Origine non autorisée' })
    }
    res.status(500).json({ error: 'Internal server error' })
})


import prisma from './prismaClient.js'

const PORT = process.env.PORT || 4000
const HOST = process.env.HOST || '127.0.0.1'

// Démarrage du serveur
async function start() {
    try {
        await prisma.$connect()
        console.log('Prisma connected to database')
    } catch (err) {
        console.error('Prisma connection error:', err)
        process.exitCode = 1
        return
    }

    const server = app.listen(PORT, HOST, () => console.log(`Backend running at http://${HOST}:${PORT}`))
    const shutdown = signal => {
        console.log(`${signal} received, shutting down`)
        server.close(async () => {
            await prisma.$disconnect()
            process.exit(0)
        })
        setTimeout(() => process.exit(1), 10_000).unref()
    }
    process.once('SIGTERM', () => shutdown('SIGTERM'))
    process.once('SIGINT', () => shutdown('SIGINT'))
}

start()

