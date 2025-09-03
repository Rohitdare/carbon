exports.up = function(knex) {
  return knex.schema.createTable('users', function(table) {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('email').unique().notNullable();
    table.string('password_hash').notNullable();
    table.string('first_name').notNullable();
    table.string('last_name').notNullable();
    table.enum('role', ['government', 'ngo', 'researcher', 'field_worker', 'market_player', 'admin']).notNullable();
    table.string('organization').nullable();
    table.string('phone').nullable();
    table.boolean('is_verified').defaultTo(false);
    table.boolean('is_active').defaultTo(true);
    table.timestamp('last_login').nullable();
    table.timestamps(true, true);
    
    table.index(['email']);
    table.index(['role']);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('users');
};

