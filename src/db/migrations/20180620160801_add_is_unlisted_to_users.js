exports.up = function(knex, Promise) {
  return knex.schema.table('users', (table) => {
    table.boolean('is_unlisted').defaultTo(false)
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.table('users', (table) => {
    table.dropColumn('is_unlisted')
  })
};
