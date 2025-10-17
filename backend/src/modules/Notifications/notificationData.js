const notifications = [
  {
    id: "1",
    userId: "volunteer123",
    message: "You’ve been assigned to the Park Cleanup event!",
    type: "assignment",
    read: false,
    timestamp: "2025-10-15T15:00:00Z",
  },
  {
    id: "2",
    userId: "volunteer123",
    message: "Reminder: Park Cleanup starts in 2 hours!",
    type: "reminder",
    read: false,
    timestamp: "2025-10-16T14:00:00Z",
  },
];

module.exports = { notifications };
