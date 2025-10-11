import { useState } from "react";
import ModalAddFood from "../Components/ModalAddFood";
import "../App.css";

function ModalTest() {
  const [open, setOpen] = useState(false);

  const handleSubmit = async (data) => {
    try {
      const r = await fetch("/api/foods", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const body = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(body.error || "Failed to create food");
      alert(`Saved: ${body.Name}`);
    } catch (e) {
      alert(e.message);
    }
  };

  return (
    <div className="mp-page" style={{ padding: 24 }}>
      <h2>Demo Page</h2>

      <button className="mp-btn" onClick={() => setOpen(true)}>
        Add Food
      </button>

      <ModalAddFood
        open={open}
        setOpen={setOpen}
        onSubmit={handleSubmit}
      />

      <button
        className="mp-btn"
        style={{ position: "absolute", top: 20, left: 20 }}
        onClick={() => window.history.back()}
      >
        ← Back
      </button>

    </div>
  );
}

export default ModalTest
