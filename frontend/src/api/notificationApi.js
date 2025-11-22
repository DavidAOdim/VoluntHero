// src/api/notificationApi.js

const API_BASE_URL = "http://localhost:8080";

export async function fetchUserNotifications(userId) {
  const response = await fetch(
    `${API_BASE_URL}/notifications?userId=${userId}`
  );
  if (!response.ok) {
    throw new Error(`Failed to fetch notifications: ${response.statusText}`);
  }
  const data = await response.json();

  // Normalize data: backend sends `is_read` (number/boolean), frontend expects `read` (boolean)
  return data.map((n) => ({
    ...n,
    // The backend service already maps is_read to `read` (boolean),
    // but we'll ensure consistency here just in case:
    read: !!n.read,
    // Your frontend uses 'createdAt' and 'title'/'body', while backend uses 'timestamp' and 'message'
    createdAt: n.timestamp, // Rename timestamp to createdAt for frontend consistency
    title: n.message.substring(0, 50) + (n.message.length > 50 ? "..." : ""), // Use message as title for quick display
    body: n.message, // Use message as body
  }));
}

export async function markNotificationAsRead(id, readStatus = true) {
  // The backend only has a PATCH endpoint to mark as read, not unread.
  // For now, we only support marking as read/deleting via API,
  // so we call the specific backend route.
  if (readStatus) {
    const response = await fetch(`${API_BASE_URL}/notifications/${id}/read`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || "Failed to mark notification as read."
      );
    }
    const updatedNotification = await response.json();
    return {
      ...updatedNotification,
      read: !!updatedNotification.read,
      createdAt: updatedNotification.timestamp,
      title:
        updatedNotification.message.substring(0, 50) +
        (updatedNotification.message.length > 50 ? "..." : ""),
      body: updatedNotification.message,
    };
  }
  // Handle the "Mark unread" button click gracefully, even if API doesn't support it easily.
  console.warn(
    "API does not support marking notification as unread easily. Handling locally for now."
  );
  return null;
}

export async function deleteNotification(id) {
  const response = await fetch(`${API_BASE_URL}/notifications/${id}`, {
    method: "DELETE",
  });
  // Backend returns 204 No Content on success
  if (response.status === 404) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Notification not found.");
  }
  if (!response.ok) {
    throw new Error("Failed to delete notification.");
  }
  return true; // Success
}
