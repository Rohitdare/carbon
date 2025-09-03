exports.up = function(knex) {
  return knex.schema.createTable('mrv_reports', function(table) {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('project_id').references('id').inTable('projects').onDelete('CASCADE');
    table.enum('report_type', ['baseline', 'monitoring', 'verification', 'final']).notNullable();
    table.json('reporting_period').notNullable(); // Start and end dates
    table.json('data').notNullable(); // Main report data
    table.json('satellite_data').nullable(); // Satellite imagery data
    table.json('sensor_data').nullable(); // IoT sensor data
    table.json('field_measurements').nullable(); // Field measurement data
    table.decimal('carbon_estimate', 15, 6).notNullable(); // Estimated carbon in tonnes CO2
    table.enum('status', ['draft', 'submitted', 'under_review', 'approved', 'rejected']).defaultTo('draft');
    table.uuid('submitted_by').references('id').inTable('users').onDelete('SET NULL');
    table.timestamp('submitted_at').nullable();
    table.uuid('verified_by').references('id').inTable('users').onDelete('SET NULL');
    table.timestamp('verified_at').nullable();
    table.text('verification_notes').nullable();
    table.timestamps(true, true);
    
    table.index(['project_id']);
    table.index(['report_type']);
    table.index(['status']);
    table.index(['submitted_by']);
    table.index(['verified_by']);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('mrv_reports');
};

