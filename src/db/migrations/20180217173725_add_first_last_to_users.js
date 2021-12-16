
exports.up = function(knex, Promise) {
  return knex.schema.table('users', (table) => {
    table.string('first_name')
    table.string('last_name')
    table.boolean('is_photographer')
    table.string('phone_number')
    table.text('location')
    table.integer('price')
    table.string('currency')
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.table('users', (table) => {
    table.dropColumn('first_name')
    table.dropColumn('last_name')
    table.dropColumn('is_photographer')
    table.dropColumn('phone_number')
    table.dropColumn('price')
    table.dropColumn('currency')
  })
};
