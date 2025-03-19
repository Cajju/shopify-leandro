import express from 'express'
import {
  getShop,
  getProducts,
  getThemeSupport,
  getThemeAppSettings,
  getProductsVariantsByIds
} from '../controllers/shop-controller.js'

const router = express.Router()

router.get('/theme-support', getThemeSupport)
router.get('/theme-app-settings', getThemeAppSettings)
router.get('/', getShop)

export default router
