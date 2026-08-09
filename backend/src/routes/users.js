import { Router } from 'express'
import { createUser, deleteUser, listUsers, updateUser } from '../controllers/usersController.js'
import { requireAdmin, requireAuth, requireCsrf } from '../auth/session.js'

const router = Router()
router.use(requireAuth, requireAdmin)
router.get('/', listUsers)
router.post('/', requireCsrf, createUser)
router.patch('/:id', requireCsrf, updateUser)
router.delete('/:id', requireCsrf, deleteUser)

export default router
