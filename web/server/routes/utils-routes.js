import express from 'express'

import { sendFeedback } from '../controllers/utils-controller.js'

const router = express.Router()

router.post('/send-feedback', sendFeedback)

export default router
