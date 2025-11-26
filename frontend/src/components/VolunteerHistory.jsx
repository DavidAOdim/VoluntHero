import { useEffect, useState } from "react";
import axios from "axios";

export default function VolunteerHistory({ authedUser }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const email = authedUser?.email;

  useEffect(() => {
    if (!email) return;
    loadHistory();
  }, [email]);

  async function loadHistory() {
    try {
      const res = await axios.get(
        `http://localhost:8080/history/email/${email}`
      );

      setHistory(res.data.data || []);
    } catch (err) {
      console.error("History load error:", err);
      setHistory([]);
    }

    setLoading(false);
  }

  function formatDate(d) {
    const date = new Date(d);
    if (!isNaN(date)) {
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    }
    return d;
  }

  if (loading) return <p>Loading history...</p>;
  if (!history.length) return <p>No volunteer history found.</p>;

  return (
    <div style={{ padding: "20px" }}>
      <h2 style={{ marginBottom: "20px" }}>Volunteer History</h2>

      <div
        style={{
          display: "grid",
          gap: "18px",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
        }}
      >
        {history.map((record) => (
          <div
            key={record.id}
            style={{
              background: "#1f2937",
              padding: "18px",
              borderRadius: "12px",
              boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
              transition: "transform 0.2s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.02)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1.0)")}
          >
            <h3 style={{ marginBottom: "6px", color: "#fff" }}>
              {record.eventName}
            </h3>

            <p style={{ margin: "4px 0", color: "#cbd5e1" }}>
              📅 {formatDate(record.eventDate)}
            </p>

            <p style={{ margin: "4px 0", color: "#cbd5e1" }}>
              ⏱ Hours volunteered: {record.hoursVolunteered}
            </p>

            <span
              style={{
                display: "inline-block",
                marginTop: "10px",
                padding: "6px 12px",
                borderRadius: "8px",
                backgroundColor: "#3b82f6",
                color: "white",
                fontSize: "0.85rem",
              }}
            >
              {record.participationStatus}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

