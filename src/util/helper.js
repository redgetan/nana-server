const crypto = require('crypto')
const bluebird = require('bluebird')

module.exports = {
  isProduction: () => {
    return process.env.NODE_ENV === "production"
  },
  computeHash: (password, saltCheck) => {
    // Bytesize
    const len = 128
    const iterations = 4096

    return new Promise((resolve, reject) => {
      crypto.randomBytes(len, function(err, salt) {
        if (err) reject(err)
        const saltString = saltCheck || salt.toString('base64')
        crypto.pbkdf2(password, saltString, iterations, len, 'sha512', function(err, derivedKey) {
          if (err) reject(err)
          resolve({ 
            salt: saltString, 
            hash: derivedKey.toString('base64')
          })
        })
      })
    })
  },
  randomToken: (length) => {
    const len = length || 128
    return new Promise((resolve, reject) => {
      crypto.randomBytes(len, function(err, token) {
        if (err) reject(err)

        resolve(token.toString('hex'))
      })
    })
  },
  getRouteString: (req) => {
    return [event.httpMethod, event.resource].join(" ")
  },
  formatDate(date) {
    var monthNames = [
      "January", "February", "March",
      "April", "May", "June", "July",
      "August", "September", "October",
      "November", "December"
    ];

    var day = date.getDate()
    var monthIndex = date.getMonth()
    var year = date.getFullYear()

    return [monthNames[monthIndex], day , year].join(" ")
  }
}