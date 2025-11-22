import React, { useEffect, useState } from "react";

export default function ProfilePage({ authedEmail }) {
  const [profile, setProfile] = useState({
    fullName: "",
    address1: "",
    address2: "",
    city: "",
    state: "",
    zip: "",
    skills: [],
    preferences: "",
    availability: [],
  });
  const [message, setMessage] = useState("");
  const [isEditing, setIsEditing] = useState(true); // default true when no profile exists
  const [isLoaded, setIsLoaded] = useState(false);

  // Fetch profile on load
  useEffect(() => {
    if (!authedEmail) return;

    fetch(`http://localhost:8080/profile/${authedEmail}`)
      .then((res) => {
        if (!res.ok) throw new Error("Profile not found");
        return res.json();
      })
      .then((data) => {
        console.log("Fetched profile data:", data);
        setProfile(data);
        setIsEditing(false); // profile exists, start in view mode
        setIsLoaded(true);
      })
      .catch((err) => {
        console.warn("No existing profile found:", err.message);
        setIsEditing(true); // allow creating new profile
        setIsLoaded(true);
      });
  }, [authedEmail]);

  // Save profile to backend
  async function handleSave() {
    try {
      const response = await fetch("http://localhost:8080/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: authedEmail, ...profile }),
      });

      const result = await response.json();
      if (response.ok) {
        setMessage("Profile saved successfully!");
        setIsEditing(false);
      } else {
        setMessage(`Error: ${result.message}`);
      }
    } catch (error) {
      setMessage("Network error, please try again later.");
    }
  }

  function handleEdit() {
    setIsEditing(true);
    setMessage("");
  }

  if (!authedEmail) {
    return (
      <div className="profile">
        <h1>Profile</h1>
        <p>Please log in to view or edit your profile.</p>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="profile">
        <h1>Loading profile...</h1>
      </div>
    );
  }

  return (
    <div className="profile">
      <h1>Profile</h1>

      <label>Full Name</label>
      <input
        value={profile.fullName}
        onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
        disabled={!isEditing}
      />

      <label>City</label>
      <input
        value={profile.city}
        onChange={(e) => setProfile({ ...profile, city: e.target.value })}
        disabled={!isEditing}
      />

      <label>State (2 Letters)</label>
      <input
        value={profile.state}
        onChange={(e) => setProfile({ ...profile, state: e.target.value })}
        disabled={!isEditing}
      />

      <label>Address Line 1</label>
      <input
        value={profile.address1}
        onChange={(e) => setProfile({ ...profile, address1: e.target.value })}
        disabled={!isEditing}
      />

      <label>Zipcode</label>
      <input
        value={profile.zip}
        onChange={(e) => setProfile({ ...profile, zip: e.target.value })}
        disabled={!isEditing}
      />

      <label>Skills (comma separated)</label>
      <input
        value={profile.skills.join(", ")}
        onChange={(e) =>
          setProfile({
            ...profile,
            skills: e.target.value.split(",").map((s) => s.trim()),
          })
        }
        disabled={!isEditing}
      />

      <label>Availability (comma separated)</label>
      <input
        value={profile.availability.join(", ")}
        onChange={(e) =>
          setProfile({
            ...profile,
            availability: e.target.value.split(",").map((s) => s.trim()),
          })
        }
        disabled={!isEditing}
      />

      {/* Conditionally show buttons */}
      <div style={{ marginTop: "10px" }}>
        {isEditing ? (
          <button onClick={handleSave}>Save Profile</button>
        ) : (
          <button onClick={handleEdit}>Edit Profile</button>
        )}
      </div>

      {message && (
        <p
          style={{ color: message.includes("successfully") ? "green" : "red" }}
        >
          {message}
        </p>
      )}

    </div>
  );
}
