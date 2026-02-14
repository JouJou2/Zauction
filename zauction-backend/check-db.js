const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

async function checkDatabase() {
    try {
        console.log('Checking database connection...');
        const result = await pool.query('SELECT NOW()');
        console.log('✅ Database connected successfully');
        console.log('Current time:', result.rows[0].now);
        
        console.log('\nChecking tables...');
        const tables = await pool.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            ORDER BY table_name
        `);
        
        console.log('\nExisting tables:');
        tables.rows.forEach(row => {
            console.log('  -', row.table_name);
        });
        
        if (tables.rows.length === 0) {
            console.log('\n⚠️  No tables found! You need to run migrations.');
            console.log('Run: npx prisma migrate deploy');
        }
        
    } catch (error) {
        console.error('❌ Database error:', error.message);
    } finally {
        await pool.end();
    }
}

checkDatabase();
