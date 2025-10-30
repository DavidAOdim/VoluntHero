const VolunteerHistoryService = require('../src/modules/VolunteerHistory/service');

// Mock the database
jest.mock('../../../db', () => ({
    promise: jest.fn(() => ({
        query: jest.fn()
    }))
}));

const db = require('../../../db');

describe('VolunteerHistoryService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Validation', () => {
        it('should validate volunteer ID', () => {
            expect(() => VolunteerHistoryService.validateVolunteerId(null)).toThrow('Valid volunteer ID is required');
            expect(() => VolunteerHistoryService.validateVolunteerId('abc')).toThrow('Valid volunteer ID is required');
            expect(VolunteerHistoryService.validateVolunteerId('123')).toBe(123);
        });

        it('should validate participation status', () => {
            expect(() => VolunteerHistoryService.validateParticipationStatus('invalid')).toThrow('Invalid participation status');
            expect(VolunteerHistoryService.validateParticipationStatus('completed')).toBe('completed');
        });

        it('should validate hours', () => {
            expect(() => VolunteerHistoryService.validateHours(-1)).toThrow('Hours volunteered must be between 0 and 24');
            expect(() => VolunteerHistoryService.validateHours(25)).toThrow('Hours volunteered must be between 0 and 24');
            expect(VolunteerHistoryService.validateHours(5)).toBe(5);
            expect(VolunteerHistoryService.validateHours(null)).toBe(0);
            expect(VolunteerHistoryService.validateHours(undefined)).toBe(0);
        });
    });

    describe('getVolunteerHistory', () => {
        it('should return volunteer history with transformed skills', async () => {
            const mockHistory = [
                {
                    id: 1,
                    volunteerId: 1,
                    volunteerName: 'John Doe',
                    eventId: 1,
                    eventName: 'Food Drive',
                    eventDate: '2024-01-15',
                    eventLocation: 'New York',
                    participationStatus: 'completed',
                    hoursVolunteered: 4,
                    participationDate: '2024-01-15 10:00:00',
                    skillsUsed: '["organizing", "lifting"]'
                }
            ];

            db.promise().query.mockResolvedValue([mockHistory]);

            const result = await VolunteerHistoryService.getVolunteerHistory(1);

            expect(result).toHaveLength(1);
            expect(result[0].volunteerName).toBe('John Doe');
            expect(result[0].skillsUsed).toEqual(['organizing', 'lifting']);
            expect(db.promise().query).toHaveBeenCalledWith(expect.any(String), [1]);
        });

        it('should handle empty history', async () => {
            db.promise().query.mockResolvedValue([[]]);

            const result = await VolunteerHistoryService.getVolunteerHistory(1);

            expect(result).toEqual([]);
        });

        it('should handle database errors', async () => {
            db.promise().query.mockRejectedValue(new Error('Database connection failed'));

            await expect(VolunteerHistoryService.getVolunteerHistory(1))
                .rejects
                .toThrow('Database error fetching history: Database connection failed');
        });
    });

    describe('getVolunteerStats', () => {
        it('should calculate correct statistics from history', async () => {
            const mockHistory = [
                { 
                    participationStatus: 'completed', 
                    hoursVolunteered: 4, 
                    skillsUsed: ['organizing'] 
                },
                { 
                    participationStatus: 'completed', 
                    hoursVolunteered: 3, 
                    skillsUsed: ['lifting'] 
                },
                { 
                    participationStatus: 'registered', 
                    hoursVolunteered: 0, 
                    skillsUsed: [] 
                }
            ];

            jest.spyOn(VolunteerHistoryService, 'getVolunteerHistory').mockResolvedValue(mockHistory);

            const stats = await VolunteerHistoryService.getVolunteerStats(1);

            expect(stats.totalEvents).toBe(3);
            expect(stats.completedEvents).toBe(2);
            expect(stats.totalHours).toBe(7);
            expect(stats.averageHours).toBe(2.3);
            expect(stats.skillsUsed).toEqual(['organizing', 'lifting']);
            expect(stats.participationRate).toBe(66.7);
        });

        it('should handle zero events gracefully', async () => {
            jest.spyOn(VolunteerHistoryService, 'getVolunteerHistory').mockResolvedValue([]);

            const stats = await VolunteerHistoryService.getVolunteerStats(1);

            expect(stats.totalEvents).toBe(0);
            expect(stats.completedEvents).toBe(0);
            expect(stats.totalHours).toBe(0);
            expect(stats.averageHours).toBe(0);
            expect(stats.participationRate).toBe(0);
        });
    });

    describe('addHistoryRecord', () => {
        it('should successfully add new history record', async () => {
            const mockResult = { insertId: 1 };
            const mockRecord = [{ 
                history_id: 1, 
                user_id: 1, 
                event_id: 1, 
                participation_status: 'registered', 
                hours_volunteered: 0,
                participation_date: '2024-01-15 10:00:00'
            }];

            db.promise().query
                .mockResolvedValueOnce([[]]) // No existing record
                .mockResolvedValueOnce([mockResult]) // Insert
                .mockResolvedValueOnce([mockRecord]); // Select new record

            const result = await VolunteerHistoryService.addHistoryRecord(1, 1, 'registered');

            expect(result.id).toBe(1);
            expect(result.volunteerId).toBe(1);
            expect(result.eventId).toBe(1);
            expect(result.participationStatus).toBe('registered');
        });

        it('should prevent duplicate volunteer-event records', async () => {
            const mockExisting = [{ history_id: 1 }];

            db.promise().query.mockResolvedValueOnce([mockExisting]);

            await expect(VolunteerHistoryService.addHistoryRecord(1, 1, 'registered'))
                .rejects.toThrow('Volunteer already registered for this event');
        });

        it('should validate all inputs before adding record', async () => {
            await expect(VolunteerHistoryService.addHistoryRecord(null, 1, 'registered'))
                .rejects.toThrow('Valid volunteer ID is required');
            
            await expect(VolunteerHistoryService.addHistoryRecord(1, null, 'registered'))
                .rejects.toThrow('Valid event ID is required');
            
            await expect(VolunteerHistoryService.addHistoryRecord(1, 1, 'invalid_status'))
                .rejects.toThrow('Invalid participation status');
        });
    });

    describe('updateHistoryRecord', () => {
        it('should successfully update existing record', async () => {
            const mockUpdateResult = { affectedRows: 1 };
            const mockUpdatedRecord = [{ 
                history_id: 1, 
                participation_status: 'completed', 
                hours_volunteered: 5 
            }];

            db.promise().query
                .mockResolvedValueOnce([mockUpdateResult])
                .mockResolvedValueOnce([mockUpdatedRecord]);

            const result = await VolunteerHistoryService.updateHistoryRecord(1, { 
                participation_status: 'completed', 
                hours_volunteered: 5 
            });

            expect(result.history_id).toBe(1);
        });

        it('should reject invalid update fields', async () => {
            await expect(VolunteerHistoryService.updateHistoryRecord(1, { invalid_field: 'value' }))
                .rejects.toThrow('No valid fields to update');
        });

        it('should handle non-existent records', async () => {
            db.promise().query.mockResolvedValueOnce([{ affectedRows: 0 }]);

            await expect(VolunteerHistoryService.updateHistoryRecord(999, { participation_status: 'completed' }))
                .rejects.toThrow('History record not found');
        });
    });

    describe('getAllHistory', () => {
        it('should return paginated history with metadata', async () => {
            const mockHistory = [
                { id: 1, volunteerId: 1, volunteerName: 'John Doe', eventId: 1, eventName: 'Event 1' },
                { id: 2, volunteerId: 2, volunteerName: 'Jane Smith', eventId: 2, eventName: 'Event 2' }
            ];
            const mockCount = [{ total: 2 }];

            db.promise().query
                .mockResolvedValueOnce([mockHistory])
                .mockResolvedValueOnce([mockCount]);

            const result = await VolunteerHistoryService.getAllHistory(1, 10);

            expect(result.data).toHaveLength(2);
            expect(result.pagination.page).toBe(1);
            expect(result.pagination.total).toBe(2);
            expect(result.pagination.totalPages).toBe(1);
        });

        it('should enforce pagination limits', async () => {
            const mockHistory = [];
            const mockCount = [{ total: 100 }];

            db.promise().query
                .mockResolvedValueOnce([mockHistory])
                .mockResolvedValueOnce([mockCount]);

            const result = await VolunteerHistoryService.getAllHistory(2, 10);

            expect(result.pagination.page).toBe(2);
            expect(result.pagination.limit).toBe(10);
            expect(result.pagination.totalPages).toBe(10);
        });
    });

    describe('deleteHistoryRecord', () => {
        it('should successfully delete existing record', async () => {
            db.promise().query.mockResolvedValueOnce([{ affectedRows: 1 }]);

            const result = await VolunteerHistoryService.deleteHistoryRecord(1);

            expect(result.message).toBe('History record deleted successfully');
        });

        it('should handle non-existent records during deletion', async () => {
            db.promise().query.mockResolvedValueOnce([{ affectedRows: 0 }]);

            await expect(VolunteerHistoryService.deleteHistoryRecord(999))
                .rejects.toThrow('History record not found');
        });
    });

    describe('getRecentVolunteerActivity', () => {
        it('should return limited recent activity', async () => {
            const mockActivity = [
                { id: 1, volunteerName: 'John Doe', eventName: 'Event 1', participationStatus: 'completed' },
                { id: 2, volunteerName: 'Jane Smith', eventName: 'Event 2', participationStatus: 'registered' }
            ];

            db.promise().query.mockResolvedValueOnce([mockActivity]);

            const result = await VolunteerHistoryService.getRecentVolunteerActivity(5);

            expect(result).toHaveLength(2);
            expect(db.promise().query).toHaveBeenCalledWith(expect.any(String), [5]);
        });

        it('should enforce activity limit boundaries', async () => {
            const mockActivity = [];
            db.promise().query.mockResolvedValueOnce([mockActivity]);

            const result = await VolunteerHistoryService.getRecentVolunteerActivity(100); // Should be capped

            expect(result).toEqual([]);
        });
    });
});

// const historyService = require('../src/modules/VolunteerHistory/service');

// describe('VolunteerHistoryService', () => {
//   describe('getVolunteerHistory', () => {
//     test('should return history for valid volunteer ID', async () => {
//       const history = await historyService.getVolunteerHistory(1);
      
//       expect(Array.isArray(history)).toBe(true);
//       expect(history.length).toBeGreaterThan(0);
//       expect(history[0]).toHaveProperty('eventName');
//       expect(history[0]).toHaveProperty('participationStatus');
//     });

//     test('should return empty array for volunteer with no history', async () => {
//       const history = await historyService.getVolunteerHistory(999);
//       expect(history).toEqual([]);
//     });
//   });

//   describe('getVolunteerStats', () => {
//     test('should calculate correct statistics', async () => {
//       const stats = await historyService.getVolunteerStats(1);
      
//       expect(stats).toHaveProperty('totalEvents');
//       expect(stats).toHaveProperty('completedEvents');
//       expect(stats).toHaveProperty('totalHours');
//       expect(stats).toHaveProperty('skillsUsed');
//       expect(stats.totalEvents).toBeGreaterThan(0);
//       expect(stats.completedEvents).toBeLessThanOrEqual(stats.totalEvents);
//     });

//     test('should handle volunteer with no history', async () => {
//       const stats = await historyService.getVolunteerStats(999);
      
//       expect(stats.totalEvents).toBe(0);
//       expect(stats.completedEvents).toBe(0);
//       expect(stats.totalHours).toBe(0);
//     });
//   });

//   describe('addHistoryRecord', () => {
//     test('should add new history record', async () => {
//       const newRecord = await historyService.addHistoryRecord(3, 1, 'completed', 5, 'Great work!');
      
//       expect(newRecord).toHaveProperty('id');
//       expect(newRecord.volunteerId).toBe(3);
//       expect(newRecord.eventId).toBe(1);
//       expect(newRecord.participationStatus).toBe('completed');
//       expect(newRecord.hoursVolunteered).toBe(5);
//     });
//   });
// });