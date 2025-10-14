class VolunteerHistoryService {
    volunteerHistory = [
        {
            id: 1,
            volunteerId: 1,
            volunteerName: "John Doe",
            eventId: 1,
            eventName: "Community Cleanup",
            eventDate: "2024-01-10",
            eventLocation: "Central Park, NY",
            participationStatus: "completed",
            hoursVolunteered: 4,
            skillsUsed: ["organizing", "teamwork"],
            feedback: "Excellent participation",
            rating: 5
        },
        {
            id: 2,
            volunteerId: 1,
            volunteerName: "John Doe", 
            eventId: 2,
            eventName: "Food Drive",
            eventDate: "2024-01-05",
            eventLocation: "Brooklyn Shelter, NY",
            participationStatus: "completed",
            hoursVolunteered: 6,
            skillsUsed: ["cooking", "serving"],
            feedback: "Very helpful volunteer",
            rating: 4
        },
        {
            id: 3,
            volunteerId: 2,
            volunteerName: "Jane Smith",
            eventId: 1,
            eventName: "Community Cleanup",
            eventDate: "2024-01-10",
            eventLocation: "Central Park, NY",
            participationStatus: "completed",
            hoursVolunteered: 3,
            skillsUsed: ["organizing"],
            feedback: "Good team player",
            rating: 4
        }
    ];

    async getVolunteerHistory(volunteerId) {
        return this.volunteerHistory.filter(record => 
            record.volunteerId === parseInt(volunteerId)
        );
    }

    async addHistoryRecord(volunteerId, eventId, participationStatus, hours, feedback) {
        const newRecord = {
            id: Date.now(),
            volunteerId: parseInt(volunteerId),
            volunteerName: `Volunteer ${volunteerId}`,
            eventId: parseInt(eventId),
            eventName: `Event ${eventId}`,
            eventDate: new Date().toISOString().split('T')[0],
            eventLocation: "New York, NY",
            participationStatus: participationStatus || "registered",
            hoursVolunteered: hours || 0,
            skillsUsed: [],
            feedback: feedback || "",
            rating: 0
        };

        this.volunteerHistory.push(newRecord);
        return newRecord;
    }

    async getVolunteerStats(volunteerId) {
        const volunteerHistory = await this.getVolunteerHistory(volunteerId);
        
        const totalHours = volunteerHistory.reduce((sum, record) => 
            sum + record.hoursVolunteered, 0
        );
        
        const completedEvents = volunteerHistory.filter(record => 
            record.participationStatus === "completed"
        ).length;

        const uniqueSkills = [...new Set(
            volunteerHistory.flatMap(record => record.skillsUsed)
        )];

        return {
            volunteerId: parseInt(volunteerId),
            totalEvents: volunteerHistory.length,
            completedEvents,
            totalHours,
            skillsUsed: uniqueSkills,
            firstEvent: volunteerHistory.length > 0 ? volunteerHistory[volunteerHistory.length - 1].eventDate : null,
            lastEvent: volunteerHistory.length > 0 ? volunteerHistory[0].eventDate : null
        };
    }
}

module.exports = new VolunteerHistoryService();