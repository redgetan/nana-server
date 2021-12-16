const Bookshelf   = require("./orm")
const Helper = require("./../util/helper")
const Joi = require('joi')
const Config = require('./../config/config')[env]

require('./user')

const s3_tld = ".s3.us-west-2.amazonaws.com"

const Photo = Bookshelf.Model.extend({
  tableName: 'photos',
  user() {
    return this.belongsTo('User')
  },
  toJSON() {
    return {
      id: this.get('id'),
      src: Config.AWS_CDN_URL + "/" + this.get('src'),
      is_cover: this.get('is_cover')
    }
  }
})

const klass = Photo

klass.getSchema = () => {
  return Joi.object().keys({
    src: Joi.string().required(),
    user_id: Joi.number().integer().required()
  })
}

klass.create = (attributes) => {
  const basePath = "https://" + Config.AWS_S3_BUCKET + s3_tld + "/"
  attributes.src = attributes.src.replace(basePath, "")

  const validation = Joi.validate(attributes, klass.getSchema())

  if (validation.error) {
    return Promise.resolve({ error: validation.error.details[0].message })
  } 

  return klass.forge(attributes).save()
}

module.exports = Bookshelf.model('Photo', klass)