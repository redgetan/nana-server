exports.up = function(knex, Promise) {
  return knex.schema.table('users', (table) => {
    table.string('reset_password_token')
    table.timestamp('reset_password_expires_at')
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.table('users', (table) => {
    table.dropColumn('reset_password_token')
    table.dropColumn('reset_password_expires_at')
  })
};
