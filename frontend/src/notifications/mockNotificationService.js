export function seedInitial() {
  // A little demo data so your screenshots show something immediately
  return [
    {
      id: 1,
      title: "New Event Assignment",
      body: "You’ve been assigned to ‘Park Cleanup’ on Oct 18.",
      type: "success",
      read: false,
      createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
      related: { eventId: "E-1001" }
    },
    {
      id: 2,
      title: "Event Update",
      body: "‘Food Bank Sort’ start time moved to 9:30 AM.",
      type: "info",
      read: true,
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      related: { eventId: "E-1002" }
    },
  ];
}
