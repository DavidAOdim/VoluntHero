// src/pages/Home.jsx

import useNotifications from "../notifications/useNotifications";
import volunteerImage from "../assets/volunteer.jpg";

export default function Home({ authedEmail, onNavigate }) {
  return (
    <main className="container">
      <div className="grid">
        <div className="col-12">
          <div className="card">
            {/* <h2 style={{ textAlign: "center" }}
            // >Welcome</h2> */}
            {/* {authedEmail && (
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
              </div>
            )} */}
            <div
              className="testName"
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                flexDirection: "column",
              }}
            >
              <img
                style={{ width: "65%", borderRadius: "8px" }}
                src="https://greatfallsmt.net/sites/default/files/styles/gallery500/public/imageattachments/community/page/35751/volunteer.jpg?itok=V-FUqlBz"
              ></img>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
