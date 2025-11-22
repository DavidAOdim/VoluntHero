// src/eventContext.js
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import {
  fetchEvents,
  createEvent,
  updateEvent,
  deleteEvent,
} from "./api/eventsServer";

// Create the context
const EventContext = createContext();

// Hook to consume the context
export function useEvents() {
  const context = useContext(EventContext);
  if (!context) {
    throw new Error("useEvents must be used within an EventProvider");
  }
  return context;
}

// Provider component
export function EventProvider({ children }) {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load events from server
  const loadEvents = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchEvents();
      setEvents(data);
    } catch (err) {
      console.error("Failed to load events:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  // Create
  const addEvent = useCallback(async (eventData) => {
    try {
      const newEvent = await createEvent(eventData);
      setEvents((prev) => [newEvent, ...prev]);
      return newEvent;
    } catch (err) {
      console.error("Failed to add event:", err);
      throw err;
    }
  }, []);

  // Update
  const editEvent = useCallback(async (id, updatedData) => {
    try {
      const updatedEvent = await updateEvent(id, updatedData);
      setEvents((prev) =>
        prev.map((event) =>
          event.id === id ? { ...event, ...updatedEvent } : event
        )
      );
      return updatedEvent;
    } catch (err) {
      console.error("Failed to edit event:", err);
      throw err;
    }
  }, []);

  // Delete
  const removeEvent = useCallback(async (id) => {
    try {
      await deleteEvent(id);
      setEvents((prev) => prev.filter((event) => event.id !== id));
      return true;
    } catch (err) {
      console.error("Failed to delete event:", err);
      throw err;
    }
  }, []);

  // Memoize the value
  const value = useMemo(
    () => ({
      events,
      isLoading,
      error,
      loadEvents,
      addEvent,
      editEvent,
      removeEvent,
    }),
    [events, isLoading, error, loadEvents, addEvent, editEvent, removeEvent]
  );

  return <EventContext.Provider value={value}>{children}</EventContext.Provider>;
}
