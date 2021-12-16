const Bookshelf   = require("./orm")
const IDGenerator = require("./id_generator")
const Helper = require("./../util/helper")

require("./user")

const Identity = Bookshelf.Model.extend({
  tableName: 'identities',
  user() {
    return this.belongsTo('User')
  }
})

Identity.create = (provider, user_id, attributes) => {
  const fields = {
    user_id: user_id,
    uid: attributes.user.id,
    provider: provider,
    username: attributes.user.username,
    access_token: attributes.access_token,
    data: attributes.user
  }

  return Identity.forge(fields).save()
}


module.exports = Bookshelf.model('Identity', Identity)