exports.up = function(knex, Promise) {
  return knex.schema.table('users', (table) => {
    table.boolean('is_ign').defaultTo(false)
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.table('users', (table) => {
    table.dropColumn('is_ign')
  })
};
