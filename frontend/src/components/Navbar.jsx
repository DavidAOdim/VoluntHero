// src/components/Navbar.jsx

import NotificationBell from "../notifications/NotificationBell";

export default function Navbar({
  onNavigate,
  current,
  authedEmail,
  authedUser,
  onLogout,
}) {
  return (
    <header>
      <div
        className="bar"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h1>VoluntHero</h1>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <nav>
            <button
              onClick={() => onNavigate("home")}
              aria-pressed={current === "home"}
            >
              Home
            </button>

            {!authedEmail && (
              <button
                onClick={() => onNavigate("login")}
                aria-pressed={current === "login"}
              >
                Login
              </button>
            )}

            {!authedEmail && (
              <button
                onClick={() => onNavigate("register")}
                aria-pressed={current === "register"}
              >
                Register
              </button>
            )}

            <button
              onClick={() => onNavigate("profile")}
              aria-pressed={current === "profile"}
            >
              Profile
            </button>

            <button
              onClick={() => onNavigate("events")}
              aria-pressed={current === "events"}
            >
              {authedUser?.role === "admin" ? "Manage Events" : "Events"}
            </button>

            {authedEmail && (
              <button
                onClick={() => onNavigate("volunteer-history")}
                aria-pressed={current === "volunteer-history"}
              >
                Volunteer History
              </button>
            )}

            {authedEmail && authedUser?.role === "admin" && (
              <button
                onClick={() => onNavigate("matching")}
                aria-pressed={current === "matching"}
              >
                Match Volunteers
              </button>
            )}

            {/* ⭐ NEW REPORTS BUTTON — visible for ALL logged-in users */}
            {authedEmail && (
              <button
                onClick={() => onNavigate("reports")}
                aria-pressed={current === "reports"}
              >
                Reports
              </button>
            )}

            {authedEmail ? (
              <button onClick={onLogout}>Logout ({authedEmail})</button>
            ) : null}
          </nav>

          {authedEmail && (
            <NotificationBell onClick={() => onNavigate("inbox")} />
          )}
        </div>
      </div>
    </header>
  );
}
