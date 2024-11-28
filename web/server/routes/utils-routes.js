import express from 'express'

import { sendFeedback, amplitudeTrack } from '../controllers/utils-controller.js'

const router = express.Router()

router.post('/send-feedback', sendFeedback)
router.post('/amplitude-track', amplitudeTrack)

export default router
