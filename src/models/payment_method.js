const Bookshelf   = require("./orm")
const IDGenerator = require("./id_generator")
const Helper = require("./../util/helper")
const Joi = require('joi')
const StripeClient = require('./stripe_client')

const PaymentMethod = Bookshelf.Model.extend({
  tableName: 'payment_methods',
  
  toJSON() {
    const data = this.serialize()

    delete data["id"]
    delete data["user_id"]
    delete data["created_at"]
    delete data["updated_at"]

    return data
  }
})

const klass = PaymentMethod

klass.getSchema = () => {
  return Joi.object().keys({
    brand: Joi.string().required(),
    last4: Joi.string().required(),
    country: Joi.string().required(),
    exp_month: Joi.number().integer().required(),
    exp_year: Joi.number().integer().required(),
    user_id: Joi.number().integer().required()
  })
}

klass.create = (options) => {
  const email = options.email
  const tokenId = options.token.id
  const card = options.token.card

  const attributes = { 
    brand: card.brand,
    last4: card.last4,
    exp_month: card.exp_month,
    exp_year: card.exp_year,
    country: card.country,
    user_id: options.user_id
  }

  const validation = Joi.validate(attributes, klass.getSchema())

  if (validation.error) {
    return Promise.resolve({ error: validation.error.details[0].message })
  } 

  return StripeClient.createCustomer({
    email: email,
    source: tokenId
  }).then((customer) => {
    const createAttributes = Object.assign(attributes, { stripe_customer_id: customer.id })
    return klass.forge(createAttributes).save()
  })
}

module.exports = Bookshelf.model('PaymentMethod', klass)