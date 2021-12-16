const Config = require("./../config/config")[env]
const stripe = require('stripe')(Config.STRIPE_SECRET_KEY)

class StripeClient {
  // stripe connect custom flow
  static getDefaultOptions() {
    return {
      type: 'custom'
    }
  }

  static getFormatAttributes(attributes) {
    const result = {}

    for (let key in attributes) {
      let keys = key.split(".")
      let obj = result

      for (var i = 0; i < keys.length; i++) {
        let subKey = keys[i]
        let isLastKey = i === keys.length - 1
        if (!isLastKey) {
          obj[subKey] = obj[subKey] || {}
          obj = obj[subKey]
        } else {
          obj[subKey] = attributes[key]
        }
      }

    }

    return result
  }

  static getAllowedAttributes(obj, allowed) {
    const result = {}
    allowed.forEach((key) => { 
      result[key] = obj[key] 
    })
    return result
  }

  static createAccount(attributes) {
    let formatted = this.getFormatAttributes(attributes)
    let allowed = this.getAllowedAttributes(formatted, ["country", "legal_entity","tos_acceptance"])

    const options = Object.assign({}, this.getDefaultOptions(), allowed)

    return stripe.accounts.create(options)
  }

  static createCustomer(attributes) {
    return stripe.customers.create(attributes)
  }

  static createCharge(attributes) {
    return stripe.charges.create(attributes)
  }
}

module.exports = StripeClient