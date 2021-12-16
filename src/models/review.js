const Bookshelf   = require("./orm")
const IDGenerator = require("./id_generator")
const Helper = require("./../util/helper")
const Joi = require('joi')
require('./user')

const Review = Bookshelf.Model.extend({
  tableName: 'reviews',
  reviewer() {
    return this.belongsTo('User', 'reviewer_id')
  },
  reviewee() {
    return this.belongsTo('User', 'user_id')
  },
  toJsonWithReviewer() {
    const data = this.toJson(["rating", "text", "created_at"])

    data["reviewer"] =  {
      name:   this.related("reviewer").attributes["email"],
      avatar: this.related("reviewer").attributes["avatar"]
    }

    return data
  }
})

const klass = Review

klass.getSchema = () => {
  return Joi.object().keys({
    text: Joi.string().required(),
    rating: Joi.number().integer().required(),
    user_id: Joi.number().integer().required(),
    reviewer_id: Joi.number().integer().required()
  })
}

klass.create = (attributes) => {
  const validation = Joi.validate(attributes, klass.getSchema())

  if (validation.error) {
    return Promise.resolve({ error: validation.error.details[0].message })
  } 

  return klass.forge(attributes).save()
}

module.exports = Bookshelf.model('Review', klass)