import { useState } from "react";
import ModalAddFood from "../Components/ModalAddFood";
import "../App.css";

function ModalTest() {
  const [open, setOpen] = useState(false);

  const handleSubmit = (data) => {
    console.log("Submitted from ModalAddFood:", data);
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
    </div>
  );
}

export default ModalTest
