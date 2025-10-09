import React, {useEffect, useState } from "react";
import VolunteerHistory from "../components/VolunteerHistory";
import { use } from "react";

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

  useEffect(() => {
    if (!authedEmail) return;
    fetch(`http://localhost:8080/profile/${authedEmail}`)
      .then((res) => {
        if (!res.ok) throw new Error("Profile not found");
        return res.json();
      })
      .then(data => {
        console.log("Fetched profile data:", data);
        setProfile(data);
      })
      .catch((err) => console.error("Error fetching profile:", err));
  }, [authedEmail]);

  //function to save profile data to backend
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
      } else {
        setMessage(`Error: ${result.message}`);
      }
    } catch (error) { 
      setMessage("Network error, please try again later.");
      }
  }


  //UI and volunteer history component
  return (
    <div className="profile">
      <h1>Profile</h1>

      <label>Full Name</label>
      <input
        value={profile.fullName}
        onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
      />

      <label>City</label>
      <input
        value={profile.city}
        onChange={(e) => setProfile({ ...profile, city: e.target.value })}
      />

      <label>State (2 Letters)</label>
      <input
        value={profile.state}
        onChange={(e) => setProfile({ ...profile, state: e.target.value })}
      />

      <label>Address Line 1</label>
      <input
        value={profile.address1}
        onChange={(e) => setProfile({ ...profile, address1: e.target.value })}
      />

      <label>Zipcode</label>
      <input 
        value={profile.zip}
        onChange={(e) => setProfile({ ...profile, zip: e.target.value })}
      />

      <label>Skills (comma separated)</label>
      <input
        value={profile.skills.join(", ")}
        onChange={(e) =>
          setProfile({ ...profile, skills: e.target.value.split(",").map(s => s.trim()) })
        }
      />

      <label>Availability (comma separated)</label>
      <input
        value={profile.availability.join(", ")}
        onChange={(e) =>
          setProfile({ ...profile, availability: e.target.value.split(",").map(s => s.trim()) })
        }
      />

      <button onClick={handleSave}>Save Profile</button>
      {message && <p>{message}</p>}

      <VolunteerHistory email={authedEmail} />
    </div>
  );
}

