import { Router } from 'express'
import shopRoutes from './shop-routes.js'
import utilsRoutes from './utils-routes.js'
import settingsRoutes from './settings-routes.js'

const router = Router()

router.use(`/utils`, utilsRoutes)
router.use(`/shop`, shopRoutes)
router.use(`/settings`, settingsRoutes)

export default router
