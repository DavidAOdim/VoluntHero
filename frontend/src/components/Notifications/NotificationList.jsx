import React from "react";

const NotificationList = ({ notifications }) => {
  return (
    <div>
      <h4 style={{ margin: "0.5rem 0" }}>Notifications</h4>
      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {notifications.length === 0 ? (
          <li>No new notifications</li>
        ) : (
          notifications.map((note) => (
            <li key={note.id}
              style={{
                padding: "0.5rem",
                borderBottom: "1px solid #eee"
              }}>
              <strong style={{ textTransform: "capitalize" }}>
                {note.type}
              </strong>
              : {note.message}
              <br />
              <small style={{ color: "gray" }}>{note.date}</small>
            </li>
          ))
        )}
      </ul>
    </div>
  );
};

export default NotificationList;
