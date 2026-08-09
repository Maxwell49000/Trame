import { Router } from 'express'
import { getSite, updateSite, deleteSite, createSite, exportSite, generateSite, listSites } from '../controllers/sitesController.js'
import { requireAuth, requireCsrf } from '../auth/session.js'
import { createRateLimit } from '../middleware/rateLimit.js'


const router = Router()
const limitWrites = createRateLimit({ windowMs: 15 * 60 * 1000, max: 120, message: 'Trop de requêtes, réessayez plus tard' })

// Routes CRUD pour les sites
router.use(requireAuth)
router.get('/', listSites)
router.get('/:id', getSite)
router.post('/', limitWrites, requireCsrf, createSite)
router.put('/:id', limitWrites, requireCsrf, updateSite)
router.delete('/:id', limitWrites, requireCsrf, deleteSite)
router.post('/:id/generate', limitWrites, requireCsrf, generateSite)
router.post('/:id/export', limitWrites, requireCsrf, exportSite)

export default router
