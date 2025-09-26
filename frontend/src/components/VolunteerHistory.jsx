import { useState, useEffect } from "react";

function VolunteerHistory({ authedEmail }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch the volunteer data from localStorage
    const users = JSON.parse(localStorage.getItem("volunthero_users"));

    if (users) {
      const volunteer = users[authedEmail.toLowerCase()];

      if (volunteer && volunteer.history) {
        setHistory(volunteer.history);  // Set the volunteer's history to state
      }
    }
    
    setLoading(false);
  }, [authedEmail]);

  if (loading) {
    return <p>Loading history...</p>;
  }

  return (
    <div className="history">
      <h2>Volunteer History</h2>
      {history.length === 0 ? (
        <p>No history available.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Event Name</th>
              <th>Date</th>
              <th>Location</th>
              <th>Skills Required</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {history.map((event, index) => (
              <tr key={index}>
                <td>{event.eventName}</td>
                <td>{new Date(event.eventDate).toLocaleDateString()}</td> {/* Format date */}
                <td>{event.eventLocation}</td>
                <td>{event.skillsRequired.join(", ")}</td>
                <td>{event.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default VolunteerHistory;


// import { useState, useEffect } from "react";

// function VolunteerHistory({ authedEmail }) {
//   const [history, setHistory] = useState([]);

//   useEffect(() => {
//     // Fetch the volunteer data from localStorage
//     const users = JSON.parse(localStorage.getItem("volunthero_users"));
//     const volunteer = users[authedEmail.toLowerCase()];

//     if (volunteer && volunteer.history) {
//       setHistory(volunteer.history);  // Set the volunteer's history to state
//     }
//   }, [authedEmail]);

//   return (
//     <div className="history">
//       <h2>Volunteer History</h2>
//       {history.length === 0 ? (
//         <p>No history available.</p>
//       ) : (
//         <table>
//           <thead>
//             <tr>
//               <th>Event Name</th>
//               <th>Date</th>
//               <th>Location</th>
//               <th>Skills Required</th>
//               <th>Status</th>
//             </tr>
//           </thead>
//           <tbody>
//             {history.map((event, index) => (
//               <tr key={index}>
//                 <td>{event.eventName}</td>
//                 <td>{event.eventDate}</td>
//                 <td>{event.eventLocation}</td>
//                 <td>{event.skillsRequired.join(", ")}</td>
//                 <td>{event.status}</td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       )}
//     </div>
//   );
// }

// export default VolunteerHistory;
