// backend/tests/reportController.test.js
const { Writable } = require('stream');
const reportController = require('../src/controllers/reportController');
const db = require('../../db');

jest.mock('../../db', () => ({
  query: jest.fn(),
}));

describe('reportController', () => {
  let res;

  beforeEach(() => {
    // Create a writable stream and extend it with Express-like methods
    res = Object.assign(
      new Writable({
        write(chunk, encoding, callback) {
          callback(); // discard chunks
        },
      }),
      {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
        header: jest.fn(),
        attachment: jest.fn(),
        send: jest.fn(),
        setHeader: jest.fn(),
      }
    );
    jest.clearAllMocks();
  });

  // ---------------- JSON endpoints ----------------
  describe('getVolunteerReport', () => {
    it('returns volunteer rows as JSON', async () => {
      const fakeRows = [{ id: 1, volunteerName: 'Alice' }];
      db.query.mockResolvedValue([fakeRows]);

      await reportController.getVolunteerReport({}, res);

      expect(res.json).toHaveBeenCalledWith(fakeRows);
    });

    it('handles errors gracefully', async () => {
      const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
      db.query.mockRejectedValue(new Error('DB fail'));

      await reportController.getVolunteerReport({}, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Error generating volunteer report',
      });

      spy.mockRestore();
    });
  });

  describe('getEventReport', () => {
    it('returns event rows as JSON', async () => {
      const fakeRows = [{ eventId: 1, title: 'Test Event' }];
      db.query.mockResolvedValue([fakeRows]);

      await reportController.getEventReport({}, res);

      expect(res.json).toHaveBeenCalledWith(fakeRows);
    });
  });

  // ---------------- CSV endpoints ----------------
  describe('getVolunteerCSV', () => {
    it('returns CSV with headers', async () => {
      const fakeRows = [{ id: 1, volunteerName: 'Alice' }];
      db.query.mockResolvedValue([fakeRows]);

      await reportController.getVolunteerCSV({}, res);

      expect(res.header).toHaveBeenCalledWith('Content-Type', 'text/csv');
      expect(res.attachment).toHaveBeenCalledWith('volunteer_report.csv');
      expect(res.send).toHaveBeenCalledWith(expect.stringContaining('volunteerName'));
    });
  });

  describe('getEventCSV', () => {
    it('returns CSV with headers', async () => {
      const fakeRows = [{ eventId: 1, title: 'Test Event' }];
      db.query.mockResolvedValue([fakeRows]);

      await reportController.getEventCSV({}, res);

      expect(res.header).toHaveBeenCalledWith('Content-Type', 'text/csv');
      expect(res.attachment).toHaveBeenCalledWith('event_report.csv');
      expect(res.send).toHaveBeenCalledWith(expect.stringContaining('title'));
    });
  });

  // ---------------- PDF endpoints ----------------
  describe('getVolunteerPDF', () => {
    it('sets PDF headers and pipes doc', async () => {
      const fakeRows = [
        {
          volunteerId: 1,
          volunteerName: 'Alice',
          eventId: 2,
          eventName: 'Test',
          eventDate: '2025-01-01',
          eventLocation: 'Hall',
          hoursVolunteered: 5,
          participationStatus: 'Attended',
          rating: 4,
        },
      ];
      db.query.mockResolvedValue([fakeRows]);

      await reportController.getVolunteerPDF({}, res);

      expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'application/pdf');
      expect(res.setHeader).toHaveBeenCalledWith(
        'Content-Disposition',
        'attachment; filename=volunteer_report.pdf'
      );
    });
  });

  describe('getEventPDF', () => {
    it('sets PDF headers and pipes doc', async () => {
      const fakeRows = [
        {
          eventId: 1,
          title: 'Test Event',
          date: '2025-01-01',
          location: 'Hall',
          description: 'Desc',
          volunteerCount: 10,
        },
      ];
      db.query.mockResolvedValue([fakeRows]);

      await reportController.getEventPDF({}, res);

      expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'application/pdf');
      expect(res.setHeader).toHaveBeenCalledWith(
        'Content-Disposition',
        'attachment; filename=event_report.pdf'
      );
    });
  });

  // ---------------- Error handling for all endpoints ----------------
  describe('error handling', () => {
    let spy;
    beforeEach(() => {
      spy = jest.spyOn(console, 'error').mockImplementation(() => {});
      db.query.mockRejectedValue(new Error('DB fail'));
    });
    afterEach(() => {
      spy.mockRestore();
    });

    it('handles errors in getEventReport', async () => {
      await reportController.getEventReport({}, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Error generating event report',
      });
    });

    it('handles errors in getVolunteerCSV', async () => {
      await reportController.getVolunteerCSV({}, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Error generating volunteer CSV',
      });
    });

    it('handles errors in getEventCSV', async () => {
      await reportController.getEventCSV({}, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Error generating event CSV',
      });
    });

    it('handles errors in getVolunteerPDF', async () => {
      await reportController.getVolunteerPDF({}, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Error generating volunteer PDF',
      });
    });

    it('handles errors in getEventPDF', async () => {
      await reportController.getEventPDF({}, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Error generating event PDF',
      });
    });
  });
});
