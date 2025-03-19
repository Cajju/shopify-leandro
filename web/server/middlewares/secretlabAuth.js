import jwt from 'jsonwebtoken'
import serverConfig from '../utils/config.js'

const secretlabAuthMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1] // Get token from Authorization header
  if (!token) {
    return res.status(401).json({ message: 'No token provided' })
  }

  // Verify the token
  jwt.verify(token, serverConfig.secretlabKey, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: 'Failed to authenticate token' })
    }
    next()
  })
}

export default secretlabAuthMiddleware
