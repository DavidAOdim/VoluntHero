// src/pages/Home.jsx

import useNotifications from "../notifications/useNotifications";

export default function Home({ authedEmail, onNavigate }) {
  const { add } = useNotifications();

  return (
    <main className="container">
      <div className="grid">
        <div className="col-12">
          <div className="card">
            <h2>Welcome</h2>
            {authedEmail && (
              <div
                style={{
                  display: "flex",
                  gap: 8,
                  marginTop: 16,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <button onClick={() => onNavigate("profile")}>
                  Complete Profile
                </button>
                <button
                  onClick={() =>
                    add({
                      title: "New Event Assignment",
                      body: "Temitayo matched to “Park Cleanup”.",
                      type: "success",
                      related: { eventId: "E-1001" },
                    })
                  }
                >
                  Trigger Test Notification
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
