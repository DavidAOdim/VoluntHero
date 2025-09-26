// src/components/VolunteerHistory.jsx
import { useEffect, useMemo, useState } from "react";

const USERS_KEY = "volunthero_users";
const EVENTS_KEY = "volunthero_events";

function getUsers() {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY)) || {};
  } catch {
    return {};
  }
}
function setUsers(next) {
  localStorage.setItem(USERS_KEY, JSON.stringify(next));
}
function getUser(users, email) {
  if (!email) return null;
  return users[email.toLowerCase()] || null;
}
function setUser(users, email, data) {
  const next = { ...users, [email.toLowerCase()]: data };
  setUsers(next);
  return next;
}
function getEvents() {
  try {
    return JSON.parse(localStorage.getItem(EVENTS_KEY)) || [];
  } catch {
    return [];
  }
}

const STATUSES = ["Assigned", "Attended", "No-show", "Cancelled"];

export default function VolunteerHistory({ authedEmail }) {
  const [users, setUsersState] = useState(getUsers);
  const me = useMemo(() => getUser(users, authedEmail), [users, authedEmail]);
  const history = me?.history || [];

  const [modal, setModal] = useState(null);

  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === USERS_KEY) setUsersState(getUsers());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  function saveHistory(nextHistory) {
    if (!me) return;
    const nextUser = { ...me, history: nextHistory };
    const nextUsers = setUser(users, me.email || authedEmail, nextUser);
    setUsersState(nextUsers);
  }

  function importAllFromEvents() {
    const events = getEvents();
    if (!events.length) return;
    const mapped = events.map((e) => ({
      id: e.id,
      name: e.name,
      description: e.description || "",
      location: e.location || "",
      skillsRequired: Array.isArray(e.skills) ? e.skills : (e.skills ? [e.skills] : []),
      urgency: e.urgency || "Low",
      date: e.date || new Date().toISOString().slice(0, 10),
      status: "Assigned",
    }));
    saveHistory(mapped);
  }
  function clearAll() {
    saveHistory([]);
  }
  function removeRow(idx) {
    const next = history.filter((_, i) => i !== idx);
    saveHistory(next);
  }
  function updateStatus(idx, value) {
    const next = history.map((row, i) => (i === idx ? { ...row, status: value } : row));
    saveHistory(next);
  }
  function openModal(row) {
    setModal({ open: true, row });
  }
  function closeModal() {
    setModal(null);
  }

  const empty = history.length === 0;

  const tableStyle = {
    width: "100%",
    borderCollapse: "collapse",
    tableLayout: "fixed",
  };
  const thtd = {
    padding: "12px 10px",
    borderBottom: "1px solid rgba(255,255,255,.08)",
    verticalAlign: "top",
    textAlign: "left",
  };
  const headerStyle = {
    ...thtd,
    fontWeight: 600,
    color: "rgba(255,255,255,.85)",
  };

  const truncate = {
    display: "block",
    width: "100%",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  };

  return (
    <div className="card" style={{ marginTop: 16 }}>
      <h2 style={{ marginTop: 0 }}>Volunteer History</h2>
      <p className="muted" style={{ marginTop: -8 }}>
        Tabular display of your participation. All event fields + your status.
      </p>

      <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
        <button onClick={importAllFromEvents}>Import all current events as “Assigned”</button>
        <button onClick={clearAll}>Clear all</button>
      </div>

      {empty ? (
        <div className="muted" style={{ padding: 16 }}>No current events yet.</div>
      ) : (
        <div style={{ overflowX: "hidden" }}>
          <table style={tableStyle}>
            {/* widths now sum to 100%; Actions widened so buttons sit side-by-side */}
            <colgroup>
              <col style={{ width: "14%" }} /> {/* Event Name */}
              <col style={{ width: "22%" }} /> {/* Description */}
              <col style={{ width: "11%" }} /> {/* Location */}
              <col style={{ width: "14%" }} /> {/* Required Skills */}
              <col style={{ width: "7%"  }} /> {/* Urgency */}
              <col style={{ width: "7%"  }} /> {/* Date */}
              <col style={{ width: "8%"  }} /> {/* Status */}
              <col style={{ width: "17%" }} /> {/* Actions (wider) */}
            </colgroup>

            <thead>
              <tr>
                <th style={headerStyle}>Event Name</th>
                <th style={headerStyle}>Description</th>
                <th style={headerStyle}>Location</th>
                <th style={headerStyle}>Required Skills</th>
                <th style={headerStyle}>Urgency</th>
                <th style={headerStyle}>Date</th>
                <th style={headerStyle}>Status</th>
                <th style={headerStyle}>Actions</th>
              </tr>
            </thead>

            <tbody>
              {history.map((row, idx) => (
                <tr key={row.id ?? idx}>
                  <td style={thtd}>{row.name || "-"}</td>

                  <td style={{ ...thtd, overflow: "hidden" }}>
                    <span title={row.description} style={truncate}>
                      {row.description || "-"}
                    </span>
                  </td>

                  <td style={{ ...thtd, overflow: "hidden" }}>
                    <span title={row.location} style={truncate}>
                      {row.location || "-"}
                    </span>
                  </td>

                  <td style={{ ...thtd, overflow: "hidden" }}>
                    <span
                      title={(row.skillsRequired || []).join(", ")}
                      style={truncate}
                    >
                      {(row.skillsRequired || []).join(", ") || "-"}
                    </span>
                  </td>

                  <td style={thtd}>{row.urgency || "-"}</td>
                  <td style={thtd}>{formatDate(row.date)}</td>

                  <td style={thtd}>
                    <select
                      value={row.status || "Assigned"}
                      onChange={(e) => updateStatus(idx, e.target.value)}
                      style={{ width: "100%" }}
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </td>

                  {/* 👉 keep buttons on one line, give the cell a minimum width */}
                  <td style={{ ...thtd, minWidth: 170 }}>
                    <div style={{ display: "flex", gap: 8, flexWrap: "nowrap" }}>
                      <button className="btn-ghost" onClick={() => removeRow(idx)}>Remove</button>
                      <button onClick={() => openModal(row)}>View</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal?.open && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,.55)",
            display: "grid",
            placeItems: "center",
            zIndex: 1000,
          }}
          onClick={closeModal}
        >
          <div
            style={{
              background: "#1b1c1f",
              border: "1px solid rgba(255,255,255,.08)",
              borderRadius: 12,
              width: "min(820px, 92vw)",
              maxHeight: "82vh",
              overflow: "auto",
              padding: 20,
              color: "#fff",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ marginTop: 0 }}>{modal.row?.name}</h3>
            <Detail label="Date" value={formatDate(modal.row?.date, true)} />
            <Detail label="Location" value={modal.row?.location} />
            <Detail label="Urgency" value={modal.row?.urgency} />
            <Detail label="Skills" value={(modal.row?.skillsRequired || []).join(", ")} />
            <div style={{ marginTop: 12, fontWeight: 600, marginBottom: 4 }}>Description</div>
            <div style={{ whiteSpace: "pre-wrap", lineHeight: 1.5 }}>
              {modal.row?.description || "—"}
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 18 }}>
              <button onClick={closeModal}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Detail({ label, value }) {
  return (
    <div style={{ marginTop: 6 }}>
      <span style={{ fontWeight: 600 }}>{label}:</span>{" "}
      <span>{value || "—"}</span>
    </div>
  );
}

function formatDate(d, includeTime = false) {
  if (!d) return "—";
  const date =
    typeof d === "string" && /^\d{4}-\d{2}-\d{2}$/.test(d)
      ? new Date(`${d}T00:00:00`)
      : new Date(d);
  if (Number.isNaN(date.getTime())) return d;
  return includeTime ? date.toLocaleString() : date.toLocaleDateString();
}
