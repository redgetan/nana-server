
exports.up = function(knex, Promise) {
  return knex.schema.createTableIfNotExists('identities', (table) => {
    table.increments('id').primary()
    table.string('uid')
    table.string('username')
    table.integer('user_id')
    table.foreign('user_id').references("users.id")
    table.string('provider')
    table.string('access_token')
    table.string('refresh_token')
    table.dateTime('expires_at')
    table.json('data')
    table.timestamps(true, true)
  });
};

exports.down = function(knex, Promise) {
  return knex.schema
    .dropTableIfExists('identities') 
};
