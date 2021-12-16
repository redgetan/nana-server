const createError = require('http-errors')

const User = require('./../models/user')
const ExceptionReporter = require('./../util/exception_reporter')

module.exports = {
  authorizationHandler: (req, res, next) => {

    const authorizationHeader = req.headers['authorization']

    if (!authorizationHeader) {
      return next(createError(401, "Authorization header is missing"))
    }

    const authenticationToken = authorizationHeader.replace(/^Token\s+/,"")

    return User.findByAuthenticationToken(authenticationToken).then((user) => {
      if (!user) return next(createError(401, "User not found"))

      res.locals.current_user = user
      next()
    })
  },

  errorHandler: (err, req, res, next) => {
    if (process.env.NODE_ENV !== "production") {
      console.log(err.stack)
    }

    if (err instanceof createError.HttpError) {
      res.status(err.statusCode)
      res.send({ error: err.message })
    } else {
      res.status(500)
      res.send({ error: "Server encountered an error" })
      ExceptionReporter.captureException(err);
    }
  }
}

