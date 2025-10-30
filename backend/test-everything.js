console.log('🧪 Testing VolunteerHistory with Railway database...\n');

try {
    const volunteerHistoryService = require('./src/modules/VolunteerHistory/service');
    console.log('✅ Service loaded successfully!');
    
    async function testWithRailway() {
        try {
            console.log('\n1. Testing getAllHistory...');
            const result = await volunteerHistoryService.getAllHistory(1, 5);
            console.log(`✅ Found ${result.data.length} records in Railway database`);
            
            console.log('\n2. Testing getRecentVolunteerActivity...');
            const activity = await volunteerHistoryService.getRecentVolunteerActivity(3);
            console.log(`✅ Recent activity: ${activity.length} records`);
            
            console.log('\n🎉 VOLUNTEERHISTORY IS WORKING WITH RAILWAY!');
            
        } catch (error) {
            console.log('❌ Service test failed:', error.message);
        }
    }
    
    testWithRailway();
    
} catch (error) {
    console.log('❌ Failed to load service:', error.message);
}