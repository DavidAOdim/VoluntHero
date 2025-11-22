// src/components/AvailabilityPicker.jsx

import { useState } from "react";

export default function AvailabilityPicker({ dates, onAdd, onRemove }) {
  const [tmp, setTmp] = useState("");
  return (
    <>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <input
          type="date"
          value={tmp}
          onChange={(e) => setTmp(e.target.value)}
        />
        <button
          type="button"
          onClick={() => {
            onAdd(tmp);
            setTmp("");
          }}
        >
          Add Date
        </button>
      </div>
      {dates?.length ? (
        <ul style={{ marginTop: 8 }}>
          {dates.map((d, idx) => (
            <li
              key={d + idx}
              style={{ display: "flex", gap: 8, alignItems: "center" }}
            >
              <span>{d}</span>
              <button type="button" onClick={() => onRemove(idx)}>
                Remove
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="muted" style={{ marginTop: 8 }}>
          No dates added yet.
        </p>
      )}
    </>
  );
}
