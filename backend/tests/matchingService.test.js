const VolunteerMatchingService = require('../src/modules/VolunteerMatching/service');

// Mock the database at the correct path
jest.mock('../../db', () => ({
    promise: jest.fn(() => ({
        query: jest.fn()
    }))
}));

const db = require('../../db');

describe('VolunteerMatchingService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('findMatchingEvents', () => {
        it('should find matching events for a volunteer', async () => {
            const mockVolunteerId = 1;
            const mockEvents = [
                {
                    event_id: 1,
                    event_name: 'Community Cleanup',
                    description: 'Cleaning local park',
                    event_location: 'New York',
                    required_skills: 'cleaning, organizing',
                    urgency: 'medium',
                    event_date: '2024-02-15',
                    user_id: 1,
                    full_name: 'John Doe',
                    volunteer_skills: 'cleaning, teaching',
                    volunteer_city: 'New York',
                    volunteer_state: 'NY',
                    availability: 'weekends',
                    skill_match: 1,
                    location_match: 1,
                    availability_match: 0.5
                }
            ];

            db.promise().query.mockResolvedValue([mockEvents]);

            const result = await VolunteerMatchingService.findMatchingEvents(mockVolunteerId);

            expect(result).toHaveLength(1);
            expect(result[0].eventId).toBe(1);
            expect(result[0].matchScore).toBe('2.50');
            expect(db.promise().query).toHaveBeenCalledWith(expect.any(String), [mockVolunteerId]);
        });

        it('should handle database errors', async () => {
            db.promise().query.mockRejectedValue(new Error('Database connection failed'));

            await expect(VolunteerMatchingService.findMatchingEvents(1))
                .rejects
                .toThrow('Database error finding matching events: Database connection failed');
        });
    });

    describe('findMatchingVolunteers', () => {
        it('should find matching volunteers for an event', async () => {
            const mockEventId = 1;
            const mockVolunteers = [
                {
                    event_id: 1,
                    event_name: 'Food Drive',
                    required_skills: 'lifting, organizing',
                    event_location: 'Boston',
                    urgency: 'high',
                    user_id: 2,
                    full_name: 'Jane Smith',
                    volunteer_skills: 'lifting, cooking',
                    volunteer_city: 'Boston',
                    volunteer_state: 'MA',
                    availability: 'flexible',
                    skill_match: 1,
                    location_match: 1,
                    availability_match: 1
                }
            ];

            db.promise().query.mockResolvedValue([mockVolunteers]);

            const result = await VolunteerMatchingService.findMatchingVolunteers(mockEventId);

            expect(result).toHaveLength(1);
            expect(result[0].volunteerId).toBe(2);
            expect(result[0].matchScore).toBe('3.00');
            expect(db.promise().query).toHaveBeenCalledWith(expect.any(String), [mockEventId]);
        });
    });

    describe('getMatchRecommendations', () => {
        it('should return limited number of recommendations', async () => {
            const mockEvents = [
                { matchScore: '2.50', eventId: 1, eventName: 'Event 1' },
                { matchScore: '2.00', eventId: 2, eventName: 'Event 2' },
                { matchScore: '1.50', eventId: 3, eventName: 'Event 3' },
                { matchScore: '1.00', eventId: 4, eventName: 'Event 4' },
                { matchScore: '0.50', eventId: 5, eventName: 'Event 5' },
                { matchScore: '0.25', eventId: 6, eventName: 'Event 6' }
            ];

            // Mock the internal method call instead of the database
            const findMatchingEventsSpy = jest.spyOn(VolunteerMatchingService, 'findMatchingEvents').mockResolvedValue(mockEvents);

            const result = await VolunteerMatchingService.getMatchRecommendations(1, 3);

            expect(result).toHaveLength(3);
            expect(result[0].eventId).toBe(1);
            expect(result[2].eventId).toBe(3);
            expect(findMatchingEventsSpy).toHaveBeenCalledWith(1);
        });
    });

    describe('getTopVolunteersForEvent', () => {
        it('should return limited number of top volunteers', async () => {
            const mockVolunteers = [
                { matchScore: '3.00', volunteerId: 1, volunteerName: 'Volunteer 1' },
                { matchScore: '2.50', volunteerId: 2, volunteerName: 'Volunteer 2' },
                { matchScore: '2.00', volunteerId: 3, volunteerName: 'Volunteer 3' },
                { matchScore: '1.50', volunteerId: 4, volunteerName: 'Volunteer 4' }
            ];

            // Mock the internal method call instead of the database
            const findMatchingVolunteersSpy = jest.spyOn(VolunteerMatchingService, 'findMatchingVolunteers').mockResolvedValue(mockVolunteers);

            const result = await VolunteerMatchingService.getTopVolunteersForEvent(1, 2);

            expect(result).toHaveLength(2);
            expect(result[0].volunteerId).toBe(1);
            expect(result[1].volunteerId).toBe(2);
            expect(findMatchingVolunteersSpy).toHaveBeenCalledWith(1);
        });
    });
});