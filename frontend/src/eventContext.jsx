import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import {
  fetchAllEvents,
  createEvent,
  updateEvent,
  deleteEvent,
} from "./api/eventsServer";

// Define the Event Context
const EventContext = createContext();

// Hook to use the Event Context
export function useEvents() {
  const context = useContext(EventContext);
  if (!context) {
    throw new Error("useEvents must be used within an EventProvider");
  }
  return context;
}

// Event Provider Component
export function EventProvider({ children }) {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- Data Fetching ---
  const loadEvents = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchAllEvents();
      setEvents(data);
    } catch (err) {
      console.error("Failed to load events:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load events on mount
  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  // --- CRUD Operations ---

  // Create
  const addEvent = useCallback(async (eventData) => {
    try {
      const newEvent = await createEvent(eventData);
      setEvents((currentEvents) => [newEvent, ...currentEvents]);
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
      setEvents((currentEvents) =>
        currentEvents.map((event) =>
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
      setEvents((currentEvents) =>
        currentEvents.filter((event) => event.id !== id)
      );
      return true;
    } catch (err) {
      console.error("Failed to delete event:", err);
      throw err;
    }
  }, []);

  // --- Context Value ---
  const value = useMemo(
    () => ({
      events,
      isLoading,
      error,
      loadEvents, // Allows pages to manually refresh the data
      addEvent,
      editEvent,
      removeEvent,
    }),
    [events, isLoading, error, loadEvents, addEvent, editEvent, removeEvent]
  );

  return (
    <EventContext.Provider value={value}>{children}</EventContext.Provider>
  );
}
