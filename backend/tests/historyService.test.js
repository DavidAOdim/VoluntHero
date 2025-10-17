const historyService = require('../src/modules/VolunteerHistory/service');

describe('VolunteerHistoryService', () => {
  describe('getVolunteerHistory', () => {
    test('should return history for valid volunteer ID', async () => {
      const history = await historyService.getVolunteerHistory(1);
      
      expect(Array.isArray(history)).toBe(true);
      expect(history.length).toBeGreaterThan(0);
      expect(history[0]).toHaveProperty('eventName');
      expect(history[0]).toHaveProperty('participationStatus');
    });

    test('should return empty array for volunteer with no history', async () => {
      const history = await historyService.getVolunteerHistory(999);
      expect(history).toEqual([]);
    });
  });

  describe('getVolunteerStats', () => {
    test('should calculate correct statistics', async () => {
      const stats = await historyService.getVolunteerStats(1);
      
      expect(stats).toHaveProperty('totalEvents');
      expect(stats).toHaveProperty('completedEvents');
      expect(stats).toHaveProperty('totalHours');
      expect(stats).toHaveProperty('skillsUsed');
      expect(stats.totalEvents).toBeGreaterThan(0);
      expect(stats.completedEvents).toBeLessThanOrEqual(stats.totalEvents);
    });

    test('should handle volunteer with no history', async () => {
      const stats = await historyService.getVolunteerStats(999);
      
      expect(stats.totalEvents).toBe(0);
      expect(stats.completedEvents).toBe(0);
      expect(stats.totalHours).toBe(0);
    });
  });

  describe('addHistoryRecord', () => {
    test('should add new history record', async () => {
      const newRecord = await historyService.addHistoryRecord(3, 1, 'completed', 5, 'Great work!');
      
      expect(newRecord).toHaveProperty('id');
      expect(newRecord.volunteerId).toBe(3);
      expect(newRecord.eventId).toBe(1);
      expect(newRecord.participationStatus).toBe('completed');
      expect(newRecord.hoursVolunteered).toBe(5);
    });
  });
});