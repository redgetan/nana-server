const createError = require('http-errors')

const User = require('./../models/user')
const PaymentMethod = require('./../models/payment_method')
const Config = require('./../config/config')[env]
const Helper = require('./../util/helper')

module.exports = {
  create: (req, res, next) => {
    const email = req.body.email
    const token = req.body.token

    if (!email) throw new createError(400, "Missing email.")
    if (!token) throw new createError(400, "Missing card.")

    const card  = token.card
    let   customerUser

    return User.where({ email: email }).fetch().then((user) => {
      /* create user if not exist */
      if (user) return Promise.resolve(user)
      
      return User.createTemporary({
        email: email
      })
    }).then((user) => {
      customerUser = user

      return PaymentMethod.where({ user_id: user.id, last4: card.last4, brand: card.brand }).fetch()
    }).then((paymentMethod) => {
      /* create payment method if not exist */

      if (paymentMethod) {
        res.send(paymentMethod.get('stripe_customer_id'))
      } else {
        return PaymentMethod.create({
          token: token,
          email: email,
          user_id: customerUser.id
        }).then((result) => {
          if (result.error) throw new createError(400, result.error)

          const paymentMethod = result 
          res.send(paymentMethod.get('stripe_customer_id'))
        })
      }
    }).catch(next)

  }
}
