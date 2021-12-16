const knexConfig = require('./../../knexfile')
const Helper = require('./../util/helper')

const knex = require('knex')(knexConfig[global.env])

const Bookshelf = require('bookshelf')(knex)

Bookshelf.plugin('registry')
Bookshelf.plugin('pagination')

Bookshelf.Model = Bookshelf.Model.extend({
  toJson(fields) {
    let result = {}
    
    fields.forEach((field) => {
      result[field] = this.attributes[field]
    })

    return result
  }
})

module.exports = Bookshelf
