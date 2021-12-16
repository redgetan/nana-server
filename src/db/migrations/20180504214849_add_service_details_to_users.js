exports.up = function(knex, Promise) {
  return knex.schema.table('users', (table) => {
    table.string('languages')
    table.string('cameras')
    table.text('expectation')
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.table('users', (table) => {
    table.dropColumn('languages')
    table.dropColumn('cameras')
    table.dropColumn('expectation')
  })
};

