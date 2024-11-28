import { Router } from 'express'
import {
  deleteBundle,
  getBundleById,
  getBundles,
  setBundle,
  changeBundleStatus
} from '../controllers/bundles-controller.js'

const router = Router()

router.put('/:bundleId', setBundle)
router.post('/change-status', changeBundleStatus)
router.get('/:bundleId', getBundleById)
router.delete('/:bundleId', deleteBundle)
router.get('/', getBundles)

export default router
