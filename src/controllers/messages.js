const createError = require('http-errors')

const User = require('./../models/user')
const Review = require('./../models/review')
const Config = require('./../config/config')[env]
const Helper = require('./../util/helper')
const Mailer = require('./../models/mailer')


// not really used anymore. delete soon
module.exports = {
  create: (req, res, next) => {
    const sender_name   = req.body.sender_name
    const sender_email  = req.body.sender_email
    const text          = req.body.text
    const album_link    = req.body.album_link

    const recepient_id  = req.body.recipient_id

    if (!text) throw new createError(400, "Missing text.")
    if (!sender_email) throw new createError(400, "Missing sender email.")

    return User.where({ email: sender_email}).fetch().then((user) => {
      const senderInfo = user ? (sender_name + "(" + user.profileUrl() + ")" ) : sender_name 
      return Promise.resolve(senderInfo)
    }).then((senderInfo) => {
      return User.where({ id: recepient_id}).fetch().then((user) => {
        if (!user) return next(new createError(400, "User not found"))

        const recepient_email = user.get('email')
        const admin_email     = "info@nanapx.com"
        const analysis        = [sender_name, sender_email, recepient_email, album_link].join(" --> ") + " : " + text

        Mailer.send("Nanapx - Photoshoot Request", { sender_email: admin_email, recepient_email: admin_email, text: analysis }, (err, result) => {
          if (err) {
            next(err)
          } else {
            let body = senderInfo  + " is interested in a photoshoot from you. You can email them at " + 
                       sender_email + " . Their message is shown below. \n\n" +
                       sender_name  + ": " + text
            Mailer.send("Nanapx - Photoshoot Request", { sender_email: admin_email, recepient_email: recepient_email, text: body }, (err, result) => {
              if (err) {
                next(err)
              } else {
                res.send({ result: result })
              }
            })
          }
        })

      })
    }).catch(next)
  }

}

