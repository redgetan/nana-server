const Bookshelf   = require("./orm")
const IDGenerator = require("./id_generator")
const Helper = require("./../util/helper")
const Joi = require('joi')
require('./user')

const PartnerAccount = Bookshelf.Model.extend({
  tableName: 'partner_accounts',
  user() {
    return this.belongsTo('User', 'user_id')
  }
})

const klass = PartnerAccount

klass.getSchema = () => {
  return Joi.object().keys({
    country: Joi.string().required(),
    city: Joi.string().required(),
    user_id: Joi.number().integer().required(),
    account_data: Joi.object().required(),
    stripe_data: Joi.object().required()
  })
}

klass.findByUserId = (value) => {
  return klass.where({ user_id: value }).fetch()
}

klass.create = (attributes) => {
  const validation = Joi.validate(attributes, klass.getSchema())

  if (validation.error) {
    return Promise.resolve({ error: validation.error.details[0].message })
  } 

  return klass.forge(attributes).save()
}

module.exports = Bookshelf.model('PartnerAccount', klass)