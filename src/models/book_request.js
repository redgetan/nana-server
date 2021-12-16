const Bookshelf   = require("./orm")
const Helper = require("./../util/helper")
const Joi = require('joi')
const Config = require('./../config/config')[env]
const IDGenerator = require("./id_generator")
const StripeClient = require('./stripe_client')


const BookRequest = Bookshelf.Model.extend({
  tableName: 'book_requests',

  user() {
    return this.belongsTo('User', 'user_id')
  },

  photographer() {
    return this.belongsTo('User', 'photographer_id')
  },

  paymentMethod() {
    return this.belongsTo('PaymentMethod', 'payment_method_id')
  },

  accept() {
    const stripe_customer_id = this.related('paymentMethod').get('stripe_customer_id')
    const price = this.get('price') * 100 // stripe uses cents denomination
    const currency = this.related('photographer').get('currency').toLowerCase()
    const customerEmail = this.related('user').get('email')

    let paymentPromise

    if (price === 0) {
      paymentPromise = Promise.resolve({})
    } else {
      paymentPromise = StripeClient.createCharge({
        amount: price,
        currency: currency,
        customer: stripe_customer_id,
        receipt_email: customerEmail
      })
    }

    return paymentPromise.then(() => {
      return this.save({ is_accepted: true, accepted_at: (new Date()) })
    })
  },

  getUrl() {
    return Config.ORIGIN + "/book_requests/" + this.get("token") 
  },

  getEmailMessage(customer) {
    let guestProfile = ""

    if (customer.get('authentication_token')) {
      guestProfile += "Guest: " + customer.getFriendlyName() + " (" + customer.profileUrl() + ")\n"
    }

    let body   = "Photoshoot Request\n" + 
                 "=========\n\n" +
                 "Date: " + Helper.formatDate(this.get('start_time')) + "\n" + 
                 "Duration: " + this.get('duration') + " hours" + "\n" + 
                 "Location: " + this.get('location') + "\n" + 
                 guestProfile +
                 "Guest Contact: " + customer.get('email') + "\n" + 
                 "Price: " + this.get('price') + " " + this.get('currency') + "\n" + 
                 "Message: " + this.get('message') + "\n" + 
                 "\n" + 
                 "To accept his request and receive payment, go to " + this.getUrl() + " . \n" + 
                 "\n" +
                 "Regards,\n" + 
                 "Nanapx Team\n" +
                 "https://nanapx.com \n" + 
                 "Follow us on Instagram: https://instagram.com/getnanapx \n" 

    return body
  },

  getAcceptEmailMessage(photographer) {
    let body   = "Photoshoot Confirmation\n" + 
                 "=========\n\n" +
                 photographer.getFriendlyName() + " has accepted your photoshoot request. Get ready and remember the details and contact photographer if you have any questions.\n\n" +
                 "Date: " + Helper.formatDate(this.get('start_time')) + "\n" + 
                 "Duration: " + this.get('duration') + " hours" + "\n" + 
                 "Location: " + this.get('location') + "\n" + 
                 "Photographer: " + photographer.getFriendlyName() + " (" + photographer.profileUrl() + ")\n" + 
                 "Photographer Contact: " + photographer.get('email') + "\n" + 
                 "Price: " + this.get('price') + " " + this.get('currency') + "\n" + 
                 "Message: " + this.get('message') + "\n" + 
                 "\n" + 
                 "\n" +
                 "Regards,\n" + 
                 "Nanapx Team\n" +
                 "https://nanapx.com \n" + 
                 "Follow us on Instagram: https://instagram.com/getnanapx \n" 

    return body
  },

  toJSON() {
    const data = this.toJson(["start_time", "location", "duration", "is_accepted", "price", "currency", "message", "token" ])

    const user = this.related("user")
    const name = [user.attributes["first_name"], user.attributes["last_name"]].join(" ")
    const username = user.attributes["username"]

    data["user"] =  {
      id:     this.related("user").attributes["id"],
      name:   name,
      username:   username,
      email:  this.related("user").attributes["email"],
      avatar:  this.related("user").attributes["avatar"],
    }

    data["photographer"] =  {
      id:          this.related("photographer").attributes["id"],
      username:   this.related("photographer").attributes["username"],
      avatar:  this.related("photographer").attributes["avatar"]
    }

    return data
  }
})

const klass = BookRequest

klass.getSchema = () => {
  return Joi.object().keys({
    start_time: Joi.date().required(),
    location: Joi.string().regex(/.*,.*/, 'location'),
    duration: Joi.number().integer().min(1),
    message: Joi.string(),
    photographer_id: Joi.number().integer().required(),
    price: Joi.number().integer().min(0),
    currency: Joi.string().required(),
    user_id: Joi.number().integer().required(),
    payment_method_id: Joi.number().integer()
  })
}

klass.create = (attributes) => {
  const validation = Joi.validate(attributes, klass.getSchema())

  if (validation.error) {
    return Promise.resolve({ error: validation.error.details[0].message })
  } 

  return klass.generateToken().then((token) => {
    attributes.token = token

    return klass.forge(attributes).save()
  })
}

klass.generateToken = () => {
  let token = IDGenerator.generate(11)

  return klass.where({
    token: token
  }).fetch().then(function(user){
    const isUserTokenTaken = user !== null
    if (isUserTokenTaken) {
      return klass.generateToken()
    } else {
      return Promise.resolve(token)
    }
  })
}


module.exports = Bookshelf.model('BookRequest', klass)


