const api = require("./../controllers")
const express = require('express')
const middlewares = require('./middlewares')
const router = express.Router()

class RouterIndex {
  static get mapping() {
    return {
      "POST /users":          { handler: api.users.signup,         auth: false }, 
      "POST /users/signin":   { handler: api.users.signin,         auth: false }, 
      "POST /users/s3_sign":   { handler: api.users.s3_sign,       auth: true }, 
      "POST /users/sms_verification":  { handler: api.users.sms_verification, auth: true },    
      "GET /users/current_step": { handler: api.users.current_step,           auth: true },
      "GET /users/:user_id": { handler: api.users.show,           auth: false },
      "PUT /users/:user_id": { handler: api.users.update,           auth: true },
      "PUT /users/:user_id/change_avatar": { handler: api.users.change_avatar,           auth: true },
      "POST /users/:user_id/complete_step": { handler: api.users.complete_step,           auth: true },
      "POST /users/:user_id/apply_as_photographer": { handler: api.users.apply_as_photographer, auth: true },
      "POST /users/:user_id/toggle_services": { handler: api.users.toggle_services, auth: true },
      "GET /users":           { handler: api.users.index,          auth: false },
      "POST /users/password_reset_email":  { handler: api.users.password_reset_email, auth: false },    
      "POST /users/password_reset/:reset_password_token":  { handler: api.users.reset_password, auth: false },    
      "GET /users/reset_password_valid_check/:reset_password_token": { handler: api.users.reset_password_valid_check, auth: false },
      "GET /get_csrf":           { handler: api.users.csrf,          auth: false },
      "GET /login/callback":  { handler: api.users.oauth_callback, auth: false },    
      "GET /account":         { handler: api.users.account,        auth: true  },     

      "GET /reviews":           { handler: api.reviews.index,        auth: false }, 
      "POST /reviews":          { handler: api.reviews.create,       auth: true  },

      "POST /photos":           { handler: api.photos.create,       auth: true  },
      "POST /photos/:id/delete":     { handler: api.photos.destroy,  auth: true  },
      "GET /users/:user_id/photos":   { handler: api.photos.index,   auth: false  },

      "POST /partner_accounts": { handler: api.partners.update_account, auth: true  },

      "POST /messages":         { handler: api.messages.create, auth: false  },
      "POST /book_requests":    { handler: api.book_requests.create, auth: false  },  
      "GET /book_requests":    { handler: api.book_requests.index, auth: true  },
      "GET /book_requests/:token":    { handler: api.book_requests.show, auth: true  },  
      "POST /book_requests/:token/accept":    { handler: api.book_requests.accept, auth: true  },  

      "POST /payment_methods":  { handler: api.payment_methods.create, auth: false  }
    }
  }

  static init() {
    for (let route in this.mapping) {
      let method = route.split(" ")[0]
      let path   = route.split(" ")[1]

      if (this.mapping[route].auth) {
        router[method.toLowerCase()](path, middlewares.authorizationHandler, this.mapping[route].handler)
      } else {
        router[method.toLowerCase()](path, this.mapping[route].handler)
      }
    }
  }

  static get router() {
    return router
  }

}

RouterIndex.init()

module.exports = RouterIndex

