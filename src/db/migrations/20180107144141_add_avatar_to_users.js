
exports.up = function(knex, Promise) {
  return knex.schema.table('users', (table) => {
    table.string('avatar')
  })
}

exports.down = function(knex, Promise) {
  return knex.schema.table('users', (table) => {
    table.dropColumn('avatar')
  })
}
