const db = require('../db');

async function setupRailway() {
    try {
        console.log('🚀 Setting up VolunteerHistory table on Railway...');
        
        // Create the table
        await db.promise().query(`
            CREATE TABLE IF NOT EXISTS VolunteerHistory (
                history_id INT PRIMARY KEY AUTO_INCREMENT,
                user_id INT NOT NULL,
                event_id INT NOT NULL,
                participation_status VARCHAR(20) DEFAULT 'registered',
                hours_volunteered DECIMAL(5,2) DEFAULT 0,
                participation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                feedback TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE KEY unique_user_event (user_id, event_id)
            )
        `);
        
        console.log('✅ VolunteerHistory table created on Railway!');
        
        // Check if we have data
        const [count] = await db.promise().query('SELECT COUNT(*) as total FROM VolunteerHistory');
        console.log(`📊 Current records: ${count[0].total}`);
        
        if (count[0].total === 0) {
            console.log('📝 Adding sample data...');
            await db.promise().query(`
                INSERT INTO VolunteerHistory (user_id, event_id, participation_status, hours_volunteered, feedback) VALUES
                (1, 1, 'completed', 4.5, 'Great experience on Railway'),
                (2, 1, 'completed', 3.0, 'Enjoyed helping the community'),
                (3, 2, 'registered', 0, NULL),
                (1, 3, 'attended', 2.5, 'Well organized event'),
                (2, 3, 'completed', 5.0, 'Would volunteer again')
            `);
            console.log('✅ Sample data added to Railway!');
        }
        
    } catch (error) {
        console.error('❌ Railway setup failed:', error.message);
    }
}

setupRailway();