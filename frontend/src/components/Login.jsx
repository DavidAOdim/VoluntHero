// src/components/Login.jsx

import { useState } from "react";

export default function Login({ onLogin, onNavigate }) {
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setErr("");
    setOk("");

    try {
      const response = await fetch("http://localhost:8080/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: pw }),
      });

      const result = await response.json();

      if (response.ok) {
        setOk("Login successful!");
        onLogin(result);
        onNavigate("profile");
        console.log("Login successful for user:", result);
      } else {
        setErr(result.message || "Login failed.");
      }
    } catch (error) {
      console.error("Login error:", error);
      setErr("Network error. Please try again later.");
    }
  }

  return (
    <main className="container">
      <div className="grid">
        <div className="col-12">
          <div className="card">
            <h2>Login</h2>
            <p className="muted">Use your email and password.</p>
            <form onSubmit={handleSubmit}>
              <label>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.org"
                required
              />
              <label>Password</label>
              <input
                type="password"
                value={pw}
                onChange={(e) => setPw(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => {setErr(""); setOk(""); onNavigate("forgotPassword")}}
              >
                Forgot Password
              </button>
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
              <div
                style={{
                  display: "flex",
                  gap: 8,
                  marginTop: 16,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <button type="submit">Login</button>
                <button type="button" onClick={() => onNavigate("register")}>
                  Go to Register
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
