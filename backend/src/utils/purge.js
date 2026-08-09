import fs from 'fs/promises'
import fsSync from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const BACKEND_ROOT = path.resolve(__dirname, '../..')
const GENERATED_ROOT = path.join(BACKEND_ROOT, 'generated')
const UPLOADS_ROOT = path.join(BACKEND_ROOT, 'uploads')


// Purge les assets générés et les uploads associés à un site donné
export async function purgeSiteAssets(site) {
    if (!site) throw new Error('Missing site')
    const slug = (site.slug || site.name || String(site.id || '')).toString().toLowerCase().replace(/[^a-z0-9-_]/g, '-')
    const generatedPath = path.join(GENERATED_ROOT, slug)
    const uploadsBySlug = path.join(UPLOADS_ROOT, slug)
    const uploadsById = path.join(UPLOADS_ROOT, String(site.id || ''))

    // Collecte les résultats des suppressions
    const results = []

    try {
        if (fsSync.existsSync(generatedPath)) {
            await fs.rm(generatedPath, { recursive: true, force: true })
            results.push({ path: generatedPath, removed: true })
        }
    } catch (err) {
        results.push({ path: generatedPath, removed: false, error: err.message })
    }

    // Supprime les uploads dans les deux emplacements possibles
    for (const p of [uploadsBySlug, uploadsById]) {
        try {
            if (fsSync.existsSync(p)) {
                await fs.rm(p, { recursive: true, force: true })
                results.push({ path: p, removed: true })
            }
        } catch (err) {
            results.push({ path: p, removed: false, error: err.message })
        }
    }

    return results
}
