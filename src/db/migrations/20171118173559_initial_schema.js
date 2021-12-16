exports.up = function(knex, Promise) {
  return knex.schema.createTableIfNotExists('users', (table) => {
    table.increments('id').primary()
    table.string('email').unique()
    table.string('username').unique()
    table.string('password_hash')
    table.string('password_salt')
    table.boolean('is_verified')
    table.string('authentication_token')
    table.text('verify_token')
    table.json('data')
    table.timestamps(true, true)
  });
  
};

exports.down = function(knex, Promise) {
  return knex.schema
    .dropTableIfExists('users') 
}
