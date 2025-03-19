import express from 'express'
import { getProduct } from '../controllers/widget-proxy-controller.js'

const router = express.Router()

router.get('/products', getProduct)

export default router
