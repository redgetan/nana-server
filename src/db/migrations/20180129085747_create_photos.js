exports.up = function(knex, Promise) {
  return knex.schema.createTableIfNotExists('photos', (table) => {
    table.increments('id').primary()
    table.text('url')
    table.boolean('is_cover')
    table.integer('user_id')
    table.foreign('user_id').references("users.id")
    table.timestamps(true, true)
  });
};

exports.down = function(knex, Promise) {
  return knex.schema
    .dropTableIfExists('photos') 
};
