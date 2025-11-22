// src/components/SelectAccountType.jsx

export default function SelectAccountType({ onSelect }) {
  return (
    <main className="container">
      <div className="card">
        <h2>Create Account</h2>
        <p className="muted">Select the type of account you want to create:</p>
        <div
          style={{
            display: "flex",
            gap: 8,
            marginTop: 16,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <button onClick={() => onSelect("volunteer")}>Volunteer</button>
          <button onClick={() => onSelect("admin")}>Administrator</button>
        </div>
      </div>
    </main>
  );
}
