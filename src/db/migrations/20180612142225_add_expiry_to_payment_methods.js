exports.up = function(knex, Promise) {
  return knex.schema.table('payment_methods', (table) => {
    table.integer('exp_month')
    table.integer('exp_year')
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.table('payment_methods', (table) => {
    table.dropColumn('exp_month')
    table.dropColumn('exp_year')
  })
};

