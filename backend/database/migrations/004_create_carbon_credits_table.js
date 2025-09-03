exports.up = function(knex) {
  return knex.schema.createTable('carbon_credits', function(table) {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('project_id').references('id').inTable('projects').onDelete('CASCADE');
    table.string('credit_id').unique().notNullable(); // Blockchain credit ID
    table.decimal('amount_tonnes_co2', 15, 6).notNullable();
    table.enum('status', ['pending', 'verified', 'issued', 'retired', 'transferred']).defaultTo('pending');
    table.enum('verification_standard', ['VCS', 'Gold_Standard', 'CAR', 'ACR']).notNullable();
    table.date('vintage_year').notNullable();
    table.date('issuance_date').nullable();
    table.date('expiry_date').nullable();
    table.uuid('verifier_id').references('id').inTable('users').nullable();
    table.text('verification_notes').nullable();
    table.string('blockchain_transaction_hash').nullable();
    table.json('metadata').nullable();
    table.timestamps(true, true);
    
    table.index(['project_id']);
    table.index(['credit_id']);
    table.index(['status']);
    table.index(['vintage_year']);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('carbon_credits');
};

