import React from "react";
import VolunteerHistory from "../components/VolunteerHistory";

export default function ProfilePage({ authedEmail }) {
  return (
    <div className="profile">
      <h1>Profile</h1>
      {/* Display volunteer's history */}
      <VolunteerHistory authedEmail={authedEmail} />
    </div>
  );
}
