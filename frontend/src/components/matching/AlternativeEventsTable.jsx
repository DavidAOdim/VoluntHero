export default function AlternativeEventsTable({ rows, useBackend }) {
  if (!rows || rows.length === 0) return null;
  
  return (
    <div className="mt-4">
      <div className="flex items-center gap-2 mb-2">
        <h4 className="font-medium">Other matches</h4>
        {useBackend && (
          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
            From Backend
          </span>
        )}
      </div>
      <table className="w-full border rounded overflow-hidden">
        <thead className="bg-gray-50 text-left text-sm">
          <tr>
            <th className="p-2">Event</th>
            <th className="p-2">Date</th>
            <th className="p-2">Location</th>
            <th className="p-2">Score</th>
          </tr>
        </thead>
        <tbody className="text-sm divide-y">
          {rows.map(ev => (
            <tr key={ev.id}>
              <td className="p-2">{ev.title}</td>
              <td className="p-2">{new Date(ev.date).toLocaleString()}</td>
              <td className="p-2">{ev.location}</td>
              <td className="p-2">{ev.score != null ? Math.round(ev.score*100)+"%" : "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// export default function AlternativeEventsTable({ rows }) {
//   if (!rows || rows.length === 0) return null;
//   return (
//     <div className="mt-4">
//       <h4 className="font-medium mb-2">Other matches</h4>
//       <table className="w-full border rounded overflow-hidden">
//         <thead className="bg-gray-50 text-left text-sm">
//           <tr>
//             <th className="p-2">Event</th>
//             <th className="p-2">Date</th>
//             <th className="p-2">Location</th>
//             <th className="p-2">Score</th>
//           </tr>
//         </thead>
//         <tbody className="text-sm divide-y">
//           {rows.map(ev => (
//             <tr key={ev.id}>
//               <td className="p-2">{ev.title}</td>
//               <td className="p-2">{new Date(ev.date).toLocaleString()}</td>
//               <td className="p-2">{ev.location}</td>
//               <td className="p-2">{ev.score != null ? Math.round(ev.score*100)+"%" : "—"}</td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// }
