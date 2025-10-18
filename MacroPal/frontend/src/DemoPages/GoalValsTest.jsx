import { useState } from "react";
import ModalGoalVals from "../Components/ModalGoalVals";
import "../App.css";

function GoalValsTest() {
    const [open, setOpen] = useState(false);

    return (
    <div className="mp-page" style={{ padding: 24 }}>
        <h2>Goal Vals Demo Page</h2>

        <button className="mp-btn" onClick={() => setOpen(true)}>
        Goal Vals
        </button>

        <ModalGoalVals
        open={open}
        setOpen={setOpen}
        // TODO: Implement the handle submit once
        // backend is ready to roll - commented out for now
        // onSubmit={handleSubmit}
        />

    </div>
    );
}

export default GoalValsTest