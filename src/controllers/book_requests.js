const createError = require('http-errors')

const User = require('./../models/user')
const BookRequest = require('./../models/book_request')
const Config = require('./../config/config')[env]
const Helper = require('./../util/helper')
const Mailer = require('./../models/mailer')
const PaymentMethod = require('./../models/payment_method')
const Stripe = require('./../models/payment_method')


module.exports = {
  index: (req, res, next) => {
    const user = res.locals.current_user

    return BookRequest.where({ user_id: user.id }).fetchAll().then((sentBookRequests) => {
      return BookRequest.where({ photographer_id: user.id }).fetchAll().then((receivedBookRequests) => {
        res.send({
          sent: sentBookRequests.map((book_request) => { return book_request.toJSON() }),
          received: receivedBookRequests.map((book_request) => { return book_request.toJSON() })
        })
      })
    })

  },

  show: (req, res, next) => {
    const token = req.params.token
    
    return BookRequest.where({ token: token }).fetch({withRelated: ['user', 'photographer']}).then((book_request) => {
      if (book_request) {
        res.send(book_request.toJSON())
      } else {
        res.send({ error: "book request not found" })
      }
    })

  },

  accept: (req, res, next) => {
    const token = req.params.token
    const user = res.locals.current_user
    
    return BookRequest.where({ token: token }).fetch({withRelated: ['user', 'photographer', 'paymentMethod']}).then((book_request) => {
      if (!book_request) return res.send({ error: "book request not found" })

      const isBookRequestRecipient = book_request.related('photographer').get('id') === user.id
      if (!isBookRequestRecipient) return res.send({ error: "you are not authorized to accept that book request" })

      return book_request.accept()
    }).then((book_request) => {
      const admin_email     = "info@nanapx.com"
      const recepient_email = book_request.related('user').get("email")
      let body = book_request.getAcceptEmailMessage(book_request.related('photographer'))

      Mailer.send("Nanapx - Confirmed Booking with Photographer", { sender_email: admin_email, recepient_email: recepient_email, text: body }, (err, result) => {
        if (err) {
          next(err)
        } else {
          res.send({ result: result })
        }
      })
    }).catch(next)

  },

  create: (req, res, next) => {
    const stripe_customer_id = req.body.stripe_customer_id
    const location        = req.body.location
    const start_time      = new Date(req.body.start_time)
    const duration        = req.body.duration
    const message         = req.body.message
    const photographer_id = req.body.photographer_id
    const sender_email    = req.body.email

    if (!message) throw new createError(400, "Missing text.")
    if (!sender_email) throw new createError(400, "Missing sender email.")

    let sender_name 
    let user
    let paymentMethod
    let photographer

    return User.where({ email: sender_email }).fetch().then((fetchedUser) => {
      if (!fetchedUser) throw new createError(400, "User not found with email provided")

      user = fetchedUser
      return PaymentMethod.where({ stripe_customer_id: stripe_customer_id || -1 }).fetch()
    }).then((fetchedPaymentMethod) => {
      paymentMethod = fetchedPaymentMethod

      return User.where({ id: photographer_id}).fetch()
    }).then((fetchedPhotographer) => {
      if (!fetchedPhotographer) return next(new createError(400, "Photographer not found"))

      photographer = fetchedPhotographer
      const price = photographer.get('price') * duration
      if (price > 0 && !paymentMethod) throw new createError(400, "Missing payment method.")

      const attributes = {
        location: location,
        start_time: start_time,
        duration: duration,
        message: message,
        price: price,
        currency: photographer.get('currency'),
        photographer_id: photographer_id,
        user_id: user.id
      }

      if (price > 0) attributes["payment_method_id"] = paymentMethod.id

      return BookRequest.create(attributes)
    }).then((result) => {
      if (result.error) throw new createError(400, result.error)

      const recepient_email = photographer.get('email')
      const admin_email     = "info@nanapx.com"
      const analysis        = [sender_email, recepient_email].join(" --> ") + " : " + message
      const bookRequest     = result
      const body = bookRequest.getEmailMessage(user)

      return Mailer.send("Nanapx - Photoshoot Request", { sender_email: admin_email, recepient_email: admin_email, text: body }, (err, result) => {
        if (err) {
          next(err)
        } else {
          return Mailer.send("Nanapx - Photoshoot Request", { sender_email: admin_email, recepient_email: recepient_email, text: body }, (err, result) => {
            if (err) {
              next(err)
            } else {
              res.send({ result: result })
            }
          })
        }
      })

    }).catch(next)

  }

}
