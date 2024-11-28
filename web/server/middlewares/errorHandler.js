export default (error, req, res, next) => {
  if (res.headerSent) {
    return next(error)
  }
  res.status(error.code || 500)
  res.json({
    error: {
      status: error.code || 500,
      message: error.message || 'An unknown error occured!'
    }
  })
}
