exports.up = function(knex, Promise) {
  return knex.schema.alterTable('users', (table) => {
    table.string('first_name').defaultTo("").alter()
    table.string('last_name').defaultTo("").alter()
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.alterTable('users', (table) => {
    table.string('first_name').alter()
    table.string('last_name').alter()
  })
};

