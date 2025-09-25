import { useEffect, useMemo, useState } from "react";
import { listVolunteers } from "../../api/mockServer";

export default function VolunteerPicker({ onSelect, placeholder }) {
  const [query, setQuery] = useState("");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const res = await listVolunteers(query);
      if (!cancelled) setItems(res);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [query]);

  const show = useMemo(() => items.slice(0, 8), [items]);

  return (
    <div className="w-full max-w-xl">
      <label className="text-sm font-medium">Volunteer Name</label>
      <input
        className="mt-1 w-full rounded border px-3 py-2"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder || "Search by name or email..."}
      />
      {loading && <div className="text-xs mt-1">Searching…</div>}

      {show.length > 0 && (
        <ul className="mt-2 border rounded divide-y">
          {show.map(v => (
            <li
              key={v.id}
              className="px-3 py-2 hover:bg-gray-50 cursor-pointer"
              onClick={() => onSelect(v)}
            >
              <div className="font-medium">{v.fullName}</div>
              <div className="text-xs text-gray-500">{v.email}</div>
            </li>
          ))}
        </ul>
      )}
      {!loading && query && show.length === 0 && (
        <div className="text-xs mt-2 text-gray-500">No volunteers found.</div>
      )}
    </div>
  );
}
