exports.up = function(knex, Promise) {
  return knex.schema.table('book_requests', (table) => {
    table.dropColumn('start_date')
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.table('book_requests', (table) => {
    table.date('start_date')
  })
};
