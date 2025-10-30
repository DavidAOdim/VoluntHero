const db = require('../db');

async function testRailwayConnection() {
    try {
        console.log('🔗 Testing Railway database connection...');
        console.log('Host:', process.env.DB_HOST);
        console.log('Port:', process.env.DB_PORT);
        console.log('Database:', process.env.DB_NAME);
        
        // Test basic query
        const [rows] = await db.promise().query('SELECT 1 + 1 AS result');
        console.log('✅ Railway database connection successful!');
        console.log('Test result:', rows[0].result);
        
        // Check tables
        const [tables] = await db.promise().query(`
            SELECT TABLE_NAME 
            FROM INFORMATION_SCHEMA.TABLES 
            WHERE TABLE_SCHEMA = ?
        `, [process.env.DB_NAME]);
        
        console.log('\n📊 Tables in database:');
        tables.forEach(table => {
            console.log('   -', table.TABLE_NAME);
        });
        
    } catch (error) {
        console.error('❌ Railway connection failed:', error.message);
        console.log('\n💡 Check:');
        console.log('   - Internet connection');
        console.log('   - Railway service status');
        console.log('   - Database credentials in Railway dashboard');
    }
}

testRailwayConnection();