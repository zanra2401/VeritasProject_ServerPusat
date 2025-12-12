// Script untuk cek database tables
const { sequelize } = require('./models');

async function checkDatabase() {
  try {
    console.log('🔍 Checking database connection...');
    await sequelize.authenticate();
    console.log('✅ Database connection OK');

    console.log('\n📋 Checking tables...');
    const [results] = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);

    console.log('\n📊 Tables in database:');
    results.forEach(row => {
      console.log(`  - ${row.table_name}`);
    });

    // Check specific table
    console.log('\n🔍 Checking SinkronisasiLog table...');
    try {
      const [columns] = await sequelize.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'SinkronisasiLog' 
        ORDER BY ordinal_position;
      `);
      
      if (columns.length > 0) {
        console.log('✅ SinkronisasiLog table exists with columns:');
        columns.forEach(col => {
          console.log(`  - ${col.column_name} (${col.data_type})`);
        });
      } else {
        console.log('❌ SinkronisasiLog table NOT found');
        console.log('ℹ️  Run migrations: npm run db:migrate');
      }
    } catch (err) {
      console.error('❌ Error checking SinkronisasiLog:', err.message);
    }

    console.log('\n✅ Database check completed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Database error:', error.message);
    process.exit(1);
  }
}

checkDatabase();
