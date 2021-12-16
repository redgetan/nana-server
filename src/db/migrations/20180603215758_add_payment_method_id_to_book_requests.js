
exports.up = function(knex, Promise) {
  return knex.schema.table('book_requests', (table) => {
    table.integer('payment_method_id')
    table.foreign('payment_method_id').references("payment_methods.id")
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.table('book_requests', (table) => {
    table.dropColumn('payment_method_id')
  })
};
