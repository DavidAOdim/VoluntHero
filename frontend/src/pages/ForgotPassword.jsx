//a page that lets you enter your email then a new password
import React, { useState } from "react";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage("");
    setError("");
    try {
      const response = await fetch(
        "http://localhost:8080/auth/forgot-password",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, newPassword }),
        }
      );
      const result = await response.json();
      if (response.ok) {
        setMessage("Password reset successful!");
      } else {
        setError(result.message || "Password reset failed.");
      }
    } catch (error) {
      console.error("Password reset error:", error);
      setError("Network error. Please try again later.");
    }
  }
  return (
    <main className="container">
      <div className="grid">
        <div className="col-12">
          <div className="card">
            <h2>Forgot Password</h2>
            <form onSubmit={handleSubmit}>
              <label>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder=""
                required
              />
              <label>New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
              <button type="submit">Reset Password</button>
            </form>
            {message && (
              <p className="muted" style={{ color: "green" }}>
                {message}
              </p>
            )}
            {error && (
              <p className="muted" style={{ color: "crimson" }}>
                {error}
              </p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
