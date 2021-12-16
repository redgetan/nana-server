exports.up = function(knex, Promise) {
  return knex.schema.createTableIfNotExists('reviews', (table) => {
    table.increments('id').primary()
    table.text('text')
    table.integer('rating')
    table.integer('user_id')
    table.foreign('user_id').references("users.id")
    table.integer('reviewer_id')
    table.foreign('reviewer_id').references("users.id")
    table.timestamps(true, true)
  });
};

exports.down = function(knex, Promise) {
  return knex.schema
    .dropTableIfExists('reviews') 
};
