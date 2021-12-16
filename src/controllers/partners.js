const createError = require('http-errors')
const request = require('request-promise-native')

const User = require('./../models/user')
const PartnerAccount = require('./../models/partner_account')
const Identity = require('./../models/identity')
const StripeClient = require('./../models/stripe_client')
const Config = require('./../config/config')[env]
const Helper = require('./../util/helper')

module.exports = {
  show: (req, res) => {
    const current_user = res.locals.current_user

    return PartnerAccount.findByUserId(current_user.id).then((partnerAccount) => {
      if (!partnerAccount) {
        debugger
      } else {
        debugger
      }
    })
  },
  update_account: (req, res, next) => {
    const current_user = req.body
    const clientIp = req.connection.remoteAddress


    const additionalOptions = {
      tos_acceptance: {
        date: Math.floor(new Date() / 1000),
        ip: clientIp
      }
    }

    const attributes = Object.assign({}, additionalOptions, req.body)
    delete attributes['current_user']

    return PartnerAccount.findByUserId(current_user.id).then((partnerAccount) => {
      if (partnerAccount) throw new createError(400, "Partner account already created for user")

      return StripeClient.createAccount(attributes)
    }).then((stripeAccount) => {
      return PartnerAccount.create({
        user_id: current_user.id,
        city: stripeAccount.legal_entity.address.city,
        country: stripeAccount.legal_entity.address.country,
        account_data: attributes,
        stripe_data: stripeAccount
      })
    }).then((partnerAccount) => {
      res.send("ok")
    }).catch(next)

  }
  
}


