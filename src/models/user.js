const Bookshelf   = require("./orm")
const IDGenerator = require("./id_generator")
const Helper = require("./../util/helper")
const Config = require("./../config/config")[env]
const Joi = require('joi')
require('./identity')
require('./review')
require('./partner_account')
require('./photo')

const User = Bookshelf.Model.extend({
  tableName: 'users',
  identities() {
    return this.hasMany('Identity')
  },
  photos() {
    return this.hasMany('Photo')
  },
  account() {
    return this.hasOne('PartnerAccount')
  },
  bookRequestsSent() {
    return this.hasMany('BookRequest', 'user_id')
  },
  bookRequestsReceived() {
    return this.hasMany('BookRequest', 'photographer_id')
  },
  reviewsGiven() {
    return this.hasMany('Review', 'reviewer_id')
  },
  reviewsReceived() {
    return this.hasMany('Review', 'user_id')
  },
  paymentMethods() {
    return this.hasMany('PaymentMethod', 'user_id')
  },
  isPhoneVerified() {
    return typeof this.get('phone_number') !== "undefined" && this.get('phone_number') !== null
  },
  getFriendlyName() {
    const firstName = this.get('first_name') || ""
    const lastName  = this.get('last_name')  || ""
    return [firstName,lastName].join(" ")
  },
  updateAttributes(attributes) {
    const schemaType = attributes.hasOwnProperty("price") ? klass.getServiceSchema() : klass.getSchema()

    const validation = Joi.validate(attributes, schemaType)

    if (validation.error) {
      return Promise.resolve({
        error: validation.error.details[0].message 
      })
    } 

    return this.save(attributes, { patch: true})
  },
  profileUrl() {
    return this.get("username") ? Config.ORIGIN + "/" + this.get("username") : Config.ORIGIN + "/users/" + this.id
  },
  completeStep(stepType, step) {
    if (stepType === "my_services_step") {
      const currentStep = this.get('my_services_step')
      let nextStep = null

      if (currentStep !== step) return Promise.resolve(this) // dont do any state change as its already completed

      switch(currentStep) {
        case "initial":
          nextStep = "upload_photos"
          break
        case "upload_photos":
          nextStep = "details"
          break
        case "details":
          nextStep = "submit"
          break
        case "submit":
          nextStep = "submitted"
          break
        default:
      }

      if (!nextStep) return Promise.resolve(this)
        
      return this.save({ my_services_step: nextStep }, { patch: true })
    }
  },
  toJsonForOwner() {
    // assumes that withRelated is called prior
    let data = this.serialize()

    delete data["password_hash"]
    delete data["password_salt"]
    delete data["is_verified"]
    delete data["verify_token"]
    delete data["data"]

    data["is_phone_verified"] = this.isPhoneVerified()
    data["providers"] = this.related("identities").map((identity) => { 
      let obj = {}
      obj.name = identity.get('provider')
      obj.access_token = identity.get('access_token')
      return obj
    })

    if (data["avatar"] && data["avatar"].match(Config.AWS_S3_BUCKET)) {
      data["avatar"] = data["avatar"].replace(/https.*nanapx.*.com/, Config.AWS_CDN_URL)
    }

    data["account"] = this.related('account').toJson(["id", "country", "city"])
    data["payment_methods"] = this.related('paymentMethods').map((paymentMethod) => {
      return paymentMethod.toJSON()
    })

    return data
  },
  toJsonWithReviewsAndPhotos() {
    const data = this.serialize()
    
    delete data["password_hash"]
    delete data["password_salt"]
    delete data["is_verified"]
    delete data["verify_token"]
    delete data["data"]

    if (data["avatar"] && data["avatar"].match(Config.AWS_S3_BUCKET)) {
      data["avatar"] = data["avatar"].replace(/https.*nanapx.*.com/, Config.AWS_CDN_URL)
    }

    data["reviews"] = this.related("reviewsReceived").map((review) => {
      return review.toJsonWithReviewer()
    })

    data["photos"] = this.related("photos").orderBy('created_at', 'DESC').map((photo) => {
      return photo.toJSON()
    })

    data["is_phone_verified"] = this.isPhoneVerified()

    return data
  }
})

const klass = User

klass.getCreateSchema = () => {
  return Joi.object().keys({
    first_name: Joi.string().required(),
    last_name: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string(),
    username: Joi.string().regex(/^[a-zA-Z0-9_.]{3,30}$/).min(3).max(30),
    avatar: Joi.string(),
    is_photographer: Joi.boolean(),
    location: Joi.string().regex(/.*,.*/, 'location'),
    bio: Joi.string().allow('')
  })
}

klass.getSchema = () => {
  return Joi.object().keys({
    first_name: Joi.string().required(),
    last_name: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string(),
    username: Joi.string().regex(/^[a-zA-Z0-9_.]{3,30}$/).min(3).max(30),
    avatar: Joi.string(),
    is_photographer: Joi.boolean(),
    location: Joi.string().regex(/.*,.*/, 'location'),
    bio: Joi.string().allow('')
  })
}

klass.getServiceSchema = () => {
  return Joi.object().keys({
    price: Joi.number().integer().min(0),
    currency: Joi.string(),
    languages: Joi.string(),
    cameras: Joi.string()
  })
}


klass.findByAuthenticationToken = (authenticationToken) => {
  return klass.where({ authentication_token: authenticationToken})
              .fetch({withRelated: ['identities', 'account', 'paymentMethods']})
}

klass.createTemporary = (attributes) => {
  return klass.forge(attributes).save()
}

klass.create = (attributes) => {
  let authenticationToken = ""
  let passwordHash = ""
  let passwordSalt = ""

  const validation = Joi.validate(attributes, klass.getCreateSchema())

  if (validation.error) {
    return Promise.reject({
      message: validation.error.details[0].message 
    })
  } 

  const password = attributes['password']
  delete attributes['password']

  return Helper.computeHash(password).then((result) => {
    passwordHash = result.hash
    passwordSalt = result.salt

    return klass.generateToken()
  }).then((token) => {
    authenticationToken = token
    return Helper.randomToken()
  }).then((token) => {
    const fields = Object.assign({}, attributes, {
      password_hash: passwordHash,
      password_salt: passwordSalt,
      is_verified: false,
      verify_token: token,
      authentication_token: authenticationToken
    })

    return klass.forge(fields).save()
  })
}

klass.generateToken = () => {
  let token = IDGenerator.generate(11)

  return klass.where({
    authentication_token: token
  }).fetch().then(function(user){
    const isUserTokenTaken = user !== null
    if (isUserTokenTaken) {
      return klass.generateToken()
    } else {
      return Promise.resolve(token)
    }
  })
}

module.exports = Bookshelf.model('User', klass)