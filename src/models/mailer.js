const Config = require('./../config/config')[env]
const mailgun = require("mailgun-js")({ apiKey: Config.MAILGUN_API_KEY, domain: "mail.nanapx.com" })

class Mailer {
  constructor() {

  }

  static notifyPhotographerApplication(newUser, callback) {
    const admin_email     = "info@nanapx.com"
    const recepient_email = admin_email
    let body = newUser.get('id') + " " + newUser.get('email') + " applied to be a photographer"

    Mailer.send("Photographer Signup", { sender_email: admin_email, recepient_email: recepient_email, text: body }, callback)
  }

  static sendPasswordReset(user) {
    const admin_email     = "info@nanapx.com"
    const recepient_email = user.get('email')
    const body = 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
          'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
          Config.ORIGIN + '/reset/' + user.get('reset_password_token') + '\n\n' +
          'If you did not request this, please ignore this email and your password will remain unchanged.\n'

    return new Promise((resolve, reject) => {
      Mailer.send("Password Reset", { sender_email: admin_email, recepient_email: recepient_email, text: body }, (error, result) => {
        if (error) return reject(error)

        resolve("ok")
      })
    })
  }

  static send(title, data, callback) {
    const subject = title || '[Nanapx] Photo Request' 
    const params = {
      from: data.sender_email,
      to: data.recepient_email,
      subject: subject,
      text: data.text
    }

    if (env === "production") {
      mailgun.messages().send(params, (error, body) => {
        if (error) { 
          if (error.message.match("not a valid address")) {
            callback(new createError(400, "Email is not a valid address"))
          } else {
            callback(error)
          }
        } else {
          callback(null, "ok")
        }
      })
    } else {
      console.log("==== sent mail\n\n")
      console.log(params)
      callback(null, "ok")
    }
 
  }
}

module.exports = Mailer