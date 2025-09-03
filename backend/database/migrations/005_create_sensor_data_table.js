exports.up = function(knex) {
  return knex.schema.createTable('sensor_data', function(table) {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('project_id').references('id').inTable('projects').onDelete('CASCADE');
    table.string('sensor_id').notNullable(); // IoT sensor identifier
    table.enum('sensor_type', ['soil', 'water', 'air', 'biomass', 'weather']).notNullable();
    table.geometry('location', 4326).notNullable(); // Sensor location
    table.json('measurements').notNullable(); // Sensor readings
    table.timestamp('timestamp').notNullable();
    table.decimal('battery_level', 5, 2).nullable(); // Battery percentage
    table.string('signal_strength').nullable(); // Signal quality
    table.json('metadata').nullable(); // Additional sensor data
    table.timestamps(true, true);
    
    table.index(['project_id']);
    table.index(['sensor_id']);
    table.index(['sensor_type']);
    table.index(['timestamp']);
    table.index(['location'], 'sensor_data_location_gist', 'gist');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('sensor_data');
};

