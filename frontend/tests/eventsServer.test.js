// frontend/tests/eventsServer.test.js
import {
  fetchEvents,
  fetchEvent,
  createEvent,
  updateEvent,
  deleteEvent,
} from '../src/api/eventsServer.js';

// mock global fetch
global.fetch = jest.fn();

describe('events API', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  // --- fetchEvents ---
  test('fetchEvents calls GET /events successfully', async () => {
    const mockData = [{ id: '1', title: 'Event 1' }];
    fetch.mockResolvedValueOnce({ ok: true, json: async () => mockData });

    const data = await fetchEvents();
    expect(fetch).toHaveBeenCalledWith('http://localhost:8080/events');
    expect(data).toEqual(mockData);
  });

  test('fetchEvents throws error on failed request', async () => {
    fetch.mockResolvedValueOnce({ ok: false });
    await expect(fetchEvents()).rejects.toThrow('Failed to fetch events');
  });

  // --- fetchEvent ---
  test('fetchEvent calls GET /events/:id successfully', async () => {
    const mockEvent = { id: '1', title: 'Event 1' };
    fetch.mockResolvedValueOnce({ ok: true, json: async () => mockEvent });

    const data = await fetchEvent('1');
    expect(fetch).toHaveBeenCalledWith('http://localhost:8080/events/1');
    expect(data).toEqual(mockEvent);
  });

  test('fetchEvent throws error if event not found', async () => {
    fetch.mockResolvedValueOnce({ ok: false });
    await expect(fetchEvent('1')).rejects.toThrow('Event not found');
  });

  // --- createEvent ---
  test('createEvent calls POST /events successfully', async () => {
    const newEvent = { title: 'New Event' };
    fetch.mockResolvedValueOnce({ ok: true, json: async () => newEvent });

    const res = await createEvent(newEvent);
    expect(fetch).toHaveBeenCalledWith('http://localhost:8080/events', expect.objectContaining({
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newEvent),
    }));
    expect(res).toEqual(newEvent);
  });

  test('createEvent throws error on failed request', async () => {
    fetch.mockResolvedValueOnce({ ok: false });
    await expect(createEvent({ title: 'Fail Event' })).rejects.toThrow('Failed to create event');
  });

  // --- updateEvent ---
  test('updateEvent calls PUT /events/:id successfully', async () => {
    const updatedEvent = { title: 'Updated Event' };
    fetch.mockResolvedValueOnce({ ok: true, json: async () => updatedEvent });

    const res = await updateEvent('1', updatedEvent);
    expect(fetch).toHaveBeenCalledWith('http://localhost:8080/events/1', expect.objectContaining({
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedEvent),
    }));
    expect(res).toEqual(updatedEvent);
  });

  test('updateEvent throws error on failed request', async () => {
    fetch.mockResolvedValueOnce({ ok: false });
    await expect(updateEvent('1', { title: 'Fail Update' })).rejects.toThrow('Failed to update event');
  });

  // --- deleteEvent ---
  test('deleteEvent calls DELETE /events/:id successfully', async () => {
    const mockRes = { success: true };
    fetch.mockResolvedValueOnce({ ok: true, json: async () => mockRes });

    const res = await deleteEvent('1');
    expect(fetch).toHaveBeenCalledWith('http://localhost:8080/events/1', expect.objectContaining({ method: 'DELETE' }));
    expect(res).toEqual(mockRes);
  });

  test('deleteEvent throws error on failed request', async () => {
    fetch.mockResolvedValueOnce({ ok: false });
    await expect(deleteEvent('1')).rejects.toThrow('Failed to delete event');
  });
});