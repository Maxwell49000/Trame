import { Router } from 'express'
import { changePassword, login, logout, me } from '../controllers/authController.js'
import { requireAuth, requireCsrf } from '../auth/session.js'
import { createRateLimit } from '../middleware/rateLimit.js'

const router = Router()
const limitLogin = createRateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: 'Trop de tentatives de connexion, réessayez plus tard'
})

router.post('/login', limitLogin, login)
router.get('/me', requireAuth, me)
router.post('/logout', requireAuth, requireCsrf, logout)
router.patch('/password', requireAuth, requireCsrf, changePassword)

export default router
