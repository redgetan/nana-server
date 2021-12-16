exports.up = function(knex, Promise) {
  return knex.schema.createTableIfNotExists('book_requests', (table) => {
    table.increments('id').primary()
    table.text('message')
    table.date('start_date')
    table.timestamp('start_time')
    table.integer('duration')
    table.text('location')
    table.integer('price')

    table.integer('user_id')
    table.foreign('user_id').references("users.id")

    table.integer('photographer_id')
    table.foreign('photographer_id').references("users.id")

    table.boolean('is_accepted')

    table.string('token')

    table.timestamps(true, true)
  });
};

exports.down = function(knex, Promise) {
  return knex.schema
    .dropTableIfExists('book_requests') 
};
