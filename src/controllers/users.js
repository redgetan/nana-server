const createError = require('http-errors')
const request = require('request-promise-native')
const requestOrig = require('request')
const Guid = require('guid');
const Querystring  = require('querystring');
const crypto = require('crypto')


const User = require('./../models/user')
const Identity = require('./../models/identity')
const Config = require('./../config/config')[env]
const Helper = require('./../util/helper')
const AWSClient = require('./../models/aws_client')
const Mailer = require('./../models/mailer')

const csrf_guid = Guid.raw();
const token_exchange_base_url = 'https://graph.accountkit.com/v1.0/access_token';
const me_endpoint_base_url = 'https://graph.accountkit.com/v1.0/me'


module.exports = {
  signup: (req, res, next) => {
    const email = stripeWhitespace(req.body.email)
    const password = req.body.password
    const first_name = req.body.first_name
    const last_name  = req.body.last_name

    return User.where({
      email: email
    }).fetch().then((user) => {
      if (user) return res.send({ error: "Email is already taken" })

      return Promise.resolve({})
    }).then(() => {
      return User.create({
        first_name: first_name,
        last_name: last_name,
        email: email,
        password: password
      }).catch((err) => {
        res.send({ error: err.message })
      })
    }).then((user) => {
      res.send(user.toJsonForOwner())
    }).catch((err) => {
      console.log(err)
      res.send({ error: "Unable to create user" })
    })
  },

  oauth_callback(req, res, next) {
    const code   = req.query.code
    const authentication_token  = req.query.state

    const isUserLoggedin = !!authentication_token 
    let isNewlyConnected = null

    if (!isUserLoggedin) {
      return requestInstagramAccessToken(code).then((data) => {
        return findOrCreateUserIdentity(data)
      }).then((result) => {
        return User.where({ id: result.identity.get('user_id') }).fetch()
      }).then((user) => {
        res.cookie('access_token', user.get('authentication_token'), { httpOnly: true })
        res.redirect(Config.INSTAGRAM_SUCCESSFUL_REDIRECT_URI)
      }).catch(next)
    } else {
      // already logged in
      User.findByAuthenticationToken(authentication_token).then((user) => {
        if (user.related("identities").length > 0) {
          isNewlyConnected = false
          return Promise.resolve(user.related("identities")[0])
        }

        return requestInstagramAccessToken(code).then((data) => {
          return updateAttributesFromInstagram(user, data).then((newUser) => {
            isNewlyConnected = true
            return Identity.create("instagram", user.get('id'), data)
          })
        })
      }).then((identity) => {
        res.cookie('access_token', authentication_token, { httpOnly: true })
        if (isNewlyConnected) {
          res.redirect(Config.INSTAGRAM_INITIAL_CONNECT_REDIRECT_URI)
        } else {
          res.redirect(Config.INSTAGRAM_SUCCESSFUL_REDIRECT_URI)
        }
      })
    }

  },

  s3_sign: (req, res, next) => {
    const filename = req.body.filename
    const mimetype = req.body.type
    const user = res.locals.current_user

    const params = { 
      Bucket: Config.AWS_S3_BUCKET, 
      Key: "photos/" + user.id + "/" + filename ,
      ContentType: mimetype,
      ACL: "public-read"
    }

    AWSClient.getS3().getSignedUrl('putObject', params, (err, url) => {
      res.send({
        method: "PUT",
        url: url,
        fields: []
      })
    })
  },

  sms_verification: (req, res) => {
    const current_user = res.locals.current_user
    const code = req.body.code
    if (req.body.csrf === csrf_guid || true) {
      const app_access_token = ['AA', Config.FACEBOOK_ACCOUNT_KIT_APP_ID, Config.FACEBOOK_ACCOUNT_KIT_SECRET].join('|')
      const params = {
        grant_type: 'authorization_code',
        code: code,
        access_token: app_access_token
      }

      const token_exchange_url = token_exchange_base_url + '?' + Querystring.stringify(params)

      return request({
        method: "GET",
        uri: token_exchange_url,
        json: true
      }).then((data) => {
        const me_endpoint_url = me_endpoint_base_url + '?access_token=' + data.access_token

        return request({ method: "GET", uri: me_endpoint_url, json: true})
      }).then((data) => {
        return new User({id: current_user.id }).save({ phone_number: data.phone.number}, { patch: true})
      }).then((user) => {
        res.send(user.toJsonForOwner())
      }).catch((data) => {
        res.send({ error: "SMS Verification Failed" })
      })

    }

  },

  signin: (req, res, next) => {
    let email = stripeWhitespace(req.body.email)
    let password = req.body.password
    let user = null

    // access token auth via cookie (i.e. instagram oauth)
    const accessToken = req.cookies['access_token']
    if (accessToken) {
      return User.where({ authentication_token: accessToken }).fetch({withRelated: ['identities', 'account', 'paymentMethods']}).then((user) => {
        res.send(user.toJsonForOwner())
      })
    }

    return User.where({ email: email }).fetch({withRelated: ['identities', 'account', 'paymentMethods']}).then((_user) => {
      if (!_user) return next(new createError(401, "User not found"))
      user = _user

      return Helper.computeHash(password, user.get('password_salt'))
    }).then((result) => {
      if (result.hash === user.get('password_hash')) {
        res.send(user.toJsonForOwner())
      } else {
        res.send({ error: "email or password is incorrect" })
      }
    })
  },

  password_reset_email: (req, res, next) => {
    const email = stripeWhitespace(req.body.email)
    let resetToken

    return Helper.randomToken(20).then((token) => {
      resetToken = token

      return User.where({ email: email }).fetch()
    }).then((user) => {
      if (!user) throw new createError(401, "Email not found")

      let date = new Date() 
      date.setHours(date.getHours() + 1) // 1 hour

      return user.save({
        reset_password_token: resetToken,
        reset_password_expires_at:  date
      }, { patch: true })
    }).then((user) => {
      return Mailer.sendPasswordReset(user)
    }).then((result) => {
      res.send("An e-mail has been sent to " + email + " for password reset instructions")
    }).catch(next)
  },

  reset_password_valid_check: (req, res) => {
    const timeNow = (new Date())
    const reset_password_token = req.params.reset_password_token

    return User.where({reset_password_token: reset_password_token }).where('reset_password_expires_at', '>', timeNow).fetch().then((user) => {
      if (!user) return res.send({ expired: true })

      res.send({ expired: false })
    })
  },

  reset_password: (req, res, next) => {
    const reset_password_token = req.params.reset_password_token
    const timeNow = new Date()
    const password = req.body.password

    if (req.body.password !== req.body.password_confirmation) {
      return next(createError(400, "Password Confirmation doesnt match Password"))
    }

    return User.where({reset_password_token: reset_password_token }).where('reset_password_expires_at', '>', timeNow).fetch().then((user) => {
      if (!user) throw new createError(400, "Password reset link has already expired. Go to www.nanapx.com/forgot_password to get a new password reset link")

      return Helper.computeHash(password).then((result) => {
        return user.save({
          password_hash: result.hash,
          password_salt: result.salt,
          reset_password_token: null,
          reset_password_expires_at:  null
        }, { patch: true })
      })
    }).then(() => {
      return res.send({ result: "ok"})
    }).catch(next)
  },

  show: (req, res) => {
    const user_id = req.params.user_id
    const username = user_id
    const isUsername = username.match(/[^\d]/)

    let userConditionPromise = isUsername ? User.where({ username: username }) : User.where({ id: user_id})

    return userConditionPromise.fetch({withRelated: ['reviewsReceived.reviewer', 'photos']}).then((user) => {
      if (user) {
        res.send(user.toJsonWithReviewsAndPhotos())
      } else {
        res.send({ error: "user not found" })
      }
    })
  },

  account: (req, res, next) => {
    const user = res.locals.current_user
    res.send(user.toJsonForOwner())
  },

  csrf: (req, res, next) => {
    res.send(csrf_guid)
  },

  update: (req, res, next) => {
    const user = res.locals.current_user
    const stepType = req.body.user.step_type
    delete req.body.user["step_type"]

    user.updateAttributes(req.body.user).then((result) => {
      if (result.error) throw new createError(400, result.error)

      const newUser = result
      res.send(newUser.toJsonForOwner())
    }).catch(next)
  },

  change_avatar: (req, res, next) => {
    const user = res.locals.current_user
    const avatar = req.body.avatar

    if (!avatar) throw new createError(400, "Missing avatar.")

    return user.save('avatar', avatar).then((newUser) => {
      res.send(newUser.toJsonForOwner())
    }).catch(next)

  },

  current_step: (req, res) => {
    const user = res.locals.current_user
    res.send(user.get('my_services_step'))
  },

  complete_step: (req, res, next) => {
    const user = res.locals.current_user
    const stepType = req.body.step_type
    const step     = req.body.step

    return user.completeStep(stepType, step).then((newUser) => {
      if (step === "submit") {
        Mailer.notifyPhotographerApplication(newUser, (err, result) => {
          if (err) return next(err)

          res.send(newUser.toJsonForOwner())
        })
      } else {
        res.send(newUser.toJsonForOwner())
      }
    }).catch(next)

  },

  apply_as_photographer: (req, res, next) => {
    const user = res.locals.current_user

    return user.completeStep("my_services_step", "initial").then((newUser) => {
      res.send(newUser.toJsonForOwner())
    }).catch(next)

  },

  toggle_services: (req, res, next) => {
    const user = res.locals.current_user
    const is_photographer = req.body.is_photographer

    return user.save({ is_photographer: is_photographer }, { patch: true }).then((newUser) => {
      res.send(newUser.toJsonForOwner())
    }).catch(next)

  },

  index(req, res, next) {
    const pageIndex = 0
    const pageSize  = 30
    const formattedAddress = req.query.address

    let scope = User.where({ is_photographer: true, is_approved: true, is_unlisted: false }) 

    if (formattedAddress) {
      const address = deformatAddress(formattedAddress)
      scope = scope.where({ location: address })
    }
     
    scope.fetchPage({ pageSize: 30 , page: pageIndex, withRelated: ['reviewsReceived.reviewer', 'photos'] }).then((users) => {
      let userList = users.models.map((user) => {
        return user.toJsonWithReviewsAndPhotos()
      })

      res.send(userList)
    }).catch(next)
  }
}


const findOrCreateUserIdentity = (data) => {
  return Identity.where({ provider: "instagram", uid: data.user.id }).fetch().then((identity) => {
    if (!identity) {
      const names = data.user.full_name.split(/\s+/)
      return User.create({
        first_name: names[0],
        last_name: names[1],
        email: "",
        username: data.user.username,
        password: "",
        avatar: data.user.profile_picture
      }).then((user) => {
        return Identity.create("instagram", user.get('id'), data)
      }).then((identity) => {
        return Promise.resolve({ initial: true, identity: identity })
      })
    }

    return Promise.resolve({ initial: false, identity: identity })
  })
}

const updateAttributesFromInstagram = (user, data) => {
  let attributes = {}

  if (!user.get('avatar')) attributes['avatar'] = data.user.profile_picture
  if (!user.get('username')) attributes['username'] = data.user.username

  return user.save(attributes)
}

const deformatAddress = (formattedAddress) => {
  return formattedAddress.replace(/--/g,", ").replace(/-/g," ")
}

const stripeWhitespace = (text) => {
  return text.replace(/\s+/g, '')
}

const requestInstagramAccessToken = (code) => {
  return request({
    method: "POST",
    uri: "https://api.instagram.com/oauth/access_token",
    json: true,
    form: {
      client_id: Config.INSTAGRAM_CLIENT_ID,
      client_secret: Config.INSTAGRAM_CLIENT_SECRET,
      redirect_uri: Config.INSTAGRAM_REDIRECT_URI,
      grant_type: "authorization_code",
      code: code
    }
  })
}


