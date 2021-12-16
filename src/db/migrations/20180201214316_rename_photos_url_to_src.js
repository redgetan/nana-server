exports.up = function(knex, Promise) {
  return knex.schema.table('photos', function (table) {
    table.renameColumn('url','src')
  })
}

exports.down = function(knex, Promise) {
  return knex.schema.table('photos', function (table) {
    table.renameColumn('src','url')
  })
};
