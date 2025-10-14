class VolunteerMatchingService {
    volunteers = [
        {
            id: 1,
            name: "John Doe",
            skills: ["teaching", "mentoring", "first-aid"],
            location: "New York, NY",
            availability: ["2024-01-15", "2024-01-20", "2024-01-25"]
        },
        {
            id: 2, 
            name: "Jane Smith",
            skills: ["cooking", "organizing", "driving"],
            location: "Jersey City, NJ", 
            availability: ["2024-01-10", "2024-01-15", "2024-01-30"]
        },
        {
            id: 3,
            name: "Mike Johnson",
            skills: ["construction", "heavy-lifting"],
            location: "New York, NY",
            availability: ["2024-01-25", "2024-02-01"]
        }
    ];

    events = [
        {
            id: 1,
            name: "Community Food Drive",
            requiredSkills: ["cooking", "organizing"],
            location: "New York, NY",
            date: "2024-01-15",
            urgency: "high"
        },
        {
            id: 2,
            name: "Youth Mentorship Program", 
            requiredSkills: ["teaching", "mentoring"],
            location: "Brooklyn, NY",
            date: "2024-01-20",
            urgency: "normal"
        },
        {
            id: 3,
            name: "Shelter Construction",
            requiredSkills: ["construction", "heavy-lifting"],
            location: "Queens, NY", 
            date: "2024-01-25",
            urgency: "urgent"
        }
    ];

    async findVolunteerMatches(eventId) {
        const event = this.events.find(e => e.id === parseInt(eventId));
        if (!event) {
            throw new Error("Event not found");
        }

        const matches = this.volunteers.map(volunteer => {
            const matchScore = this.calculateMatchScore(volunteer, event);
            const matchingSkills = volunteer.skills.filter(skill => 
                event.requiredSkills.includes(skill)
            );
            
            return {
                volunteer: {
                    id: volunteer.id,
                    name: volunteer.name,
                    skills: volunteer.skills,
                    location: volunteer.location,
                    availability: volunteer.availability
                },
                matchScore: matchScore,
                matchingSkills: matchingSkills,
                isAvailable: volunteer.availability.includes(event.date),
                reason: this.generateMatchReason(volunteer, event, matchingSkills, matchScore)
            };
        });

        return matches
            .filter(match => match.matchScore > 0.3)
            .sort((a, b) => b.matchScore - a.matchScore);
    }

    calculateMatchScore(volunteer, event) {
        // Skills matching (50% weight)
        const skillsMatch = volunteer.skills.filter(skill => 
            event.requiredSkills.includes(skill)
        ).length / event.requiredSkills.length;

        // Location matching (30% weight)
        const volCity = volunteer.location.split(',')[0].trim();
        const eventCity = event.location.split(',')[0].trim();
        const locationMatch = volCity === eventCity ? 1 : 0.3;

        // Availability matching (20% weight)
        const availabilityMatch = volunteer.availability.includes(event.date) ? 1 : 0;

        const totalScore = (skillsMatch * 0.5) + (locationMatch * 0.3) + (availabilityMatch * 0.2);
        return Math.round(totalScore * 100) / 100;
    }

    generateMatchReason(volunteer, event, matchingSkills, matchScore) {
        const reasons = [];
        
        if (matchingSkills.length > 0) {
            reasons.push(`Matches ${matchingSkills.length} required skills: ${matchingSkills.join(', ')}`);
        }
        
        if (volunteer.availability.includes(event.date)) {
            reasons.push("Available on event date");
        }
        
        const volCity = volunteer.location.split(',')[0].trim();
        const eventCity = event.location.split(',')[0].trim();
        if (volCity === eventCity) {
            reasons.push("Same city location");
        }
        
        return reasons.length > 0 ? reasons.join('; ') : "Low match score";
    }

    async createVolunteerMatch(volunteerId, eventId) {
        const volunteer = this.volunteers.find(v => v.id === parseInt(volunteerId));
        const event = this.events.find(e => e.id === parseInt(eventId));
        
        if (!volunteer || !event) {
            throw new Error("Volunteer or event not found");
        }

        const matchScore = this.calculateMatchScore(volunteer, event);

        return {
            matchId: Date.now(),
            volunteerId: parseInt(volunteerId),
            eventId: parseInt(eventId),
            volunteerName: volunteer.name,
            eventName: event.name,
            matchScore: matchScore,
            matchDate: new Date().toISOString(),
            status: "matched"
        };
    }
}

module.exports = new VolunteerMatchingService();