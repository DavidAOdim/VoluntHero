export default function MatchedEventCard({ ev, useBackend }) {
  if (!ev) {
    return (
      <div className="p-4 border rounded bg-gray-50">
        <div className="text-gray-600">No matched event yet.</div>
      </div>
    );
  }

  return (
    <div className="p-4 border rounded">
      <div className="flex items-baseline justify-between">
        <h3 className="text-lg font-semibold">{ev.title}</h3>
        <div className="flex items-center gap-2">
          {useBackend && (
            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
              Backend
            </span>
          )}
          {typeof ev.score === "number" && (
            <span className="text-sm">Score: {(ev.score * 100).toFixed(0)}%</span>
          )}
        </div>
      </div>
      <div className="text-sm text-gray-600 mt-1">{ev.location}</div>
      <div className="text-sm mt-1">
        Date: {new Date(ev.date).toLocaleString()}
      </div>
      <div className="mt-2 flex flex-wrap gap-1">
        {ev.requiredSkills.map(s => (
          <span key={s.skillId} className="px-2 py-0.5 rounded-full border text-xs">
            {s.name} {s.minLevel ? `(≥${s.minLevel})` : ''}
          </span>
        ))}
      </div>
      {ev.breakdown && (
        <div className="mt-2 text-xs text-gray-600">
          Breakdown — Skill {Math.round(ev.breakdown.skill*100)}% ·
          Availability {Math.round(ev.breakdown.availability*100)}% ·
          Distance {Math.round(ev.breakdown.distance*100)}%
        </div>
      )}
    </div>
  );
}

// export default function MatchedEventCard({ ev }) {
//   if (!ev) {
//     return (
//       <div className="p-4 border rounded bg-gray-50">
//         <div className="text-gray-600">No matched event yet.</div>
//       </div>
//     );
//   }

//   return (
//     <div className="p-4 border rounded">
//       <div className="flex items-baseline justify-between">
//         <h3 className="text-lg font-semibold">{ev.title}</h3>
//         {typeof ev.score === "number" && (
//           <span className="text-sm">Score: {(ev.score * 100).toFixed(0)}%</span>
//         )}
//       </div>
//       <div className="text-sm text-gray-600 mt-1">{ev.location}</div>
//       <div className="text-sm mt-1">
//         Date: {new Date(ev.date).toLocaleString()}
//       </div>
//       <div className="mt-2 flex flex-wrap gap-1">
//         {ev.requiredSkills.map(s => (
//           <span key={s.skillId} className="px-2 py-0.5 rounded-full border text-xs">
//             {s.name} (≥{s.minLevel})
//           </span>
//         ))}
//       </div>
//       {ev.breakdown && (
//         <div className="mt-2 text-xs text-gray-600">
//           Breakdown — Skill {Math.round(ev.breakdown.skill*100)}% ·
//           Availability {Math.round(ev.breakdown.availability*100)}% ·
//           Distance {Math.round(ev.breakdown.distance*100)}%
//         </div>
//       )}
//     </div>
//   );
// }
