// src/pages/ReportsPage.jsx

import { useState } from "react";

// --- Reusable Table Component ---
function ReportTable({ data }) {
  if (!data || data.length === 0) return null;

  const columns = Object.keys(data[0]);

  return (
    <div style={{ overflowX: "auto", marginTop: 20 }}>
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          background: "#0d1117",
          color: "#d1e7ff",
        }}
      >
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col}
                style={{
                  borderBottom: "2px solid #1f2937",
                  padding: "10px",
                  textAlign: "left",
                  background: "#111827",
                }}
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i}>
              {columns.map((col) => (
                <td
                  key={col}
                  style={{
                    borderBottom: "1px solid #1f2937",
                    padding: "8px",
                  }}
                >
                  {String(row[col])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// --- Main Reports Page ---
export default function ReportsPage() {
  const [volunteerData, setVolunteerData] = useState(null);
  const [eventData, setEventData] = useState(null);

  const fetchVolunteerReport = async () => {
    const res = await fetch("http://localhost:8080/reports/volunteers");
    const data = await res.json();
    setVolunteerData(data);
  };

  const fetchEventReport = async () => {
    const res = await fetch("http://localhost:8080/reports/events");
    const data = await res.json();
    setEventData(data);
  };

  return (
    <main className="container">
      <h1>Reports</h1>

      {/* Volunteer Reports */}
      <section className="card" style={{ padding: 20, marginBottom: 20 }}>
        <h2>Volunteer Reports</h2>

        <button onClick={fetchVolunteerReport}>View Report</button>
        <button onClick={() => window.open("http://localhost:8080/reports/volunteers/csv")}>
          Download CSV
        </button>
        <button onClick={() => window.open("http://localhost:8080/reports/volunteers/pdf")}>
          Download PDF
        </button>

        {/* Table UI */}
        {volunteerData && <ReportTable data={volunteerData} />}
      </section>

      {/* Event Reports */}
      <section className="card" style={{ padding: 20 }}>
        <h2>Event Reports</h2>

        <button onClick={fetchEventReport}>View Report</button>
        <button onClick={() => window.open("http://localhost:8080/reports/events/csv")}>
          Download CSV
        </button>
        <button onClick={() => window.open("http://localhost:8080/reports/events/pdf")}>
          Download PDF
        </button>

        {/* Table UI */}
        {eventData && <ReportTable data={eventData} />}
      </section>
    </main>
  );
}
