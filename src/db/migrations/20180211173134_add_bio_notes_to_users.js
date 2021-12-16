
exports.up = function(knex, Promise) {
  return knex.schema.table('users', (table) => {
    table.text('bio')
    table.text('notes')
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.table('users', (table) => {
    table.dropColumn('bio')
    table.dropColumn('notes')
  })
};
