exports.up = function(knex, Promise) {
  return knex.schema.table('book_requests', (table) => {
    table.string('currency')
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.table('book_requests', (table) => {
    table.dropColumn('currency')
  })
};
