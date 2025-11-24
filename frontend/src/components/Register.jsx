// src/components/Register.jsx

import { useState } from "react";
import { isEmail, required } from "../utils/validation";

// Note: Removed unused props (users, setUsers, accountType) based on backend logic in the original code.

export default function Register({ onNavigate, accountType }) {
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setErr("");
    setOk("");

    if (!isEmail(email)) return setErr("Enter a valid email.");
    if (!required(pw)) return setErr("Password is required.");

    try {
      const response = await fetch("http://localhost:8080/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password: pw,
          role: accountType,
          name: email.split("@")[0], // name logic
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setOk("Account created successfully! You can now log in.");
        // Redirect to login after successful registration
        onNavigate("login");
      } else {
        setErr(result.message || "Registration failed.");
      }
    } catch (error) {
      console.error("Registration error:", error);
      setErr("Network error. Please try again later.");
    }
  }

  return (
    <main className="container">
      <div className="grid">
        <div className="col-12">
          <div className="card">
            <h2>Register</h2>
            <p className="muted">Create an account with email and password.</p>
            <form onSubmit={handleSubmit}>
              <label>Email</label>
              <input
                type="email"
                value={email}
                placeholder="you@example.org"
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <label>Password</label>
              <input
                type="password"
                value={pw}
                onChange={(e) => setPw(e.target.value)}
                required
              />
              {err ? (
                <p className="muted" style={{ color: "crimson" }}>
                  {err}
                </p>
              ) : null}
              {ok ? (
                <p className="muted" style={{ color: "green" }}>
                  {ok}
                </p>
              ) : null}
              <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
                <button type="submit">Create Account</button>
                <button type="button" onClick={() => onNavigate("login")}>
                  Go to Login
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
