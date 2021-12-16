exports.up = function(knex, Promise) {
  return knex.schema.table('users', (table) => {
    table.boolean('is_approved').defaultTo(false)
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.table('users', (table) => {
    table.boolean('is_approved')
  })
};
