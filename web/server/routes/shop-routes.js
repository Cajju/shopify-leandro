import express from 'express'
import { getShop, getProducts } from '../controllers/shop-controller.js'

const router = express.Router()

router.get('/products', getProducts)
router.get('/', getShop)

export default router
