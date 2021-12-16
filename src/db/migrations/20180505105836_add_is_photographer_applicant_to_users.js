exports.up = function(knex, Promise) {
  return knex.schema.table('users', (table) => {
    table.string('my_services_step').defaultTo("initial")
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.table('users', (table) => {
    table.dropColumn('my_services_step')
  })
};
