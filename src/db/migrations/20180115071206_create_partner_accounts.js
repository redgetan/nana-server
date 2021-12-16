
exports.up = function(knex, Promise) {
  return knex.schema.createTableIfNotExists('partner_accounts', (table) => {
    table.increments('id').primary()

    table.string('country')
    table.string('city')

    table.jsonb('account_data')
    table.jsonb('stripe_data')

    table.integer('user_id')
    table.foreign('user_id').references("users.id")
    table.timestamps(true, true)
  });
};

exports.down = function(knex, Promise) {
  return knex.schema
    .dropTableIfExists('partner_accounts') 
};
