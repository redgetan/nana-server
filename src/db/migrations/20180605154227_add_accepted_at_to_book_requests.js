exports.up = function(knex, Promise) {
  return knex.schema.table('book_requests', (table) => {
    table.timestamp('accepted_at')
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.table('book_requests', (table) => {
    table.dropColumn('accepted_at')
  })
};
