const bcrypt = require('bcryptjs');

exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('users').del();
  
  // Hash password for admin user
  const saltRounds = 12;
  const adminPassword = await bcrypt.hash('admin123!', saltRounds);
  
  // Inserts seed entries
  return knex('users').insert([
    {
      id: '00000000-0000-0000-0000-000000000001',
      email: 'admin@bluecarbonmrv.org',
      password_hash: adminPassword,
      first_name: 'System',
      last_name: 'Administrator',
      role: 'admin',
      organization: 'Blue Carbon MRV Platform',
      is_verified: true,
      is_active: true
    },
    {
      id: '00000000-0000-0000-0000-000000000002',
      email: 'government@bluecarbonmrv.org',
      password_hash: await bcrypt.hash('gov123!', saltRounds),
      first_name: 'Government',
      last_name: 'Official',
      role: 'government',
      organization: 'Ministry of Environment',
      is_verified: true,
      is_active: true
    },
    {
      id: '00000000-0000-0000-0000-000000000003',
      email: 'ngo@bluecarbonmrv.org',
      password_hash: await bcrypt.hash('ngo123!', saltRounds),
      first_name: 'NGO',
      last_name: 'Representative',
      role: 'ngo',
      organization: 'Blue Carbon Conservation NGO',
      is_verified: true,
      is_active: true
    },
    {
      id: '00000000-0000-0000-0000-000000000004',
      email: 'researcher@bluecarbonmrv.org',
      password_hash: await bcrypt.hash('research123!', saltRounds),
      first_name: 'Marine',
      last_name: 'Researcher',
      role: 'researcher',
      organization: 'Ocean Research Institute',
      is_verified: true,
      is_active: true
    },
    {
      id: '00000000-0000-0000-0000-000000000005',
      email: 'fieldworker@bluecarbonmrv.org',
      password_hash: await bcrypt.hash('field123!', saltRounds),
      first_name: 'Field',
      last_name: 'Worker',
      role: 'field_worker',
      organization: 'Blue Carbon Conservation NGO',
      is_verified: true,
      is_active: true
    },
    {
      id: '00000000-0000-0000-0000-000000000006',
      email: 'market@bluecarbonmrv.org',
      password_hash: await bcrypt.hash('market123!', saltRounds),
      first_name: 'Carbon',
      last_name: 'Trader',
      role: 'market_player',
      organization: 'Carbon Trading Company',
      is_verified: true,
      is_active: true
    }
  ]);
};

