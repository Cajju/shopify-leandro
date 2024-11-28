import { Router } from 'express'
import bundlesApi from './bundles-routes.js'
import shopRoutes from './shop-routes.js'
import utilsRoutes from './utils-routes.js'

const router = Router()

router.use('/bundles', bundlesApi)
router.use(`/utils`, utilsRoutes)
router.use(`/shop`, shopRoutes)

export default router
