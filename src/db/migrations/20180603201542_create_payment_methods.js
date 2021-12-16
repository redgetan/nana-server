exports.up = function(knex, Promise) {
  return knex.schema.createTableIfNotExists('payment_methods', (table) => {
    table.increments('id').primary()
    
    table.string('brand') 
    table.string('country') 
    table.string('last4') 
    table.string('stripe_customer_id')

    table.integer('user_id')
    table.foreign('user_id').references("users.id")

    table.timestamps(true, true)
  });
  
};

exports.down = function(knex, Promise) {
  return knex.schema
    .dropTableIfExists('payment_methods') 
};
