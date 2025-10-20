/**
 * This page will serve as the log page for users to log their
 * daily stats
 * Will include: menu component, a button to nav to the search page
 * a button to add a food to the database
 * visual progress bars
 * and access to the logged items for that day
 *
 * @author Emily Howell (Team 6 as a whole)
 * @version October 12, 2025
*/
import { useEffect, useState } from 'react';
import "../App.css";
import ModalAddFood from "../Components/ModalAddFood";
import Menu from "../Components/Menu";
import { FaPlus, FaList} from "react-icons/fa";
import { FaMagnifyingGlass } from "react-icons/fa6";
import { BsPencilFill } from "react-icons/bs";
import ProgressBar from "../Components/ProgressBar";
import ModalGoalVals from "../Components/ModalGoalVals";
import { fetchToday } from "../api/log";

function HomePage() {
  const [open, setOpen] = useState(false); // for menu
  const [showModal, setShowModal] = useState(false); // for AddFood
  const [showEditGoals, setShowEditGoals] = useState(false); // for edit goals

  // for the add food modal:
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

  const handleGoalsSubmit = async (patch) => {
    try {
      const r = await fetch("/api/user/goals", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials:"include",
        body: JSON.stringify(patch), // expects { cal, protein, carbs, fat }
      });
      const body = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(body.error || "Failed to update goals");

      const fresh = await fetchToday();
      setToday(fresh);

      setShowEditGoals(false);
    } catch (e) {
      alert(e.message);
    }
  };

  const [today, setToday] = useState(null);
  const [err, setErr] = useState(null);

  useEffect(() => {
    let mounted = true;
    fetchToday()
      .then((data) => mounted && setToday(data))
      .catch((e) => mounted && setErr(e.message));
    return () => { mounted = false; };
    }, []);

  const [user, setUser] = useState("");
  useEffect(() => {
    // grab stored username
    const storedUser = localStorage.getItem("username");
    if (storedUser) {
      setUser(storedUser);
    }
  }, []);

  return (
    <div className="" style={{ }}>

    {/* // Menu component: */}
    <Menu 
    open={open} 
    setOpen={setOpen}
    />

    <h2>{ user }'s Daily Goals</h2>
    <p>Progress bars for visual indications</p>

    <ProgressBar
      label="Calories"
      bgcolor="#D62E4E"
      height={25}
      part={today?.totals.cal || 0}
      total={today?.goals.cal || 0}
    />

    <ProgressBar
      label="Protein"
      bgcolor="#81ACA6"
      height={25}
      part={today?.totals.protein || 0}
      total={today?.goals.protein || 0}
    />

    <ProgressBar
      label="Carbs"
      bgcolor="#E8A202"
      height={25}
      part={today?.totals.carbs || 0}
      total={today?.goals.carbs || 0}
    />

    <ProgressBar
      label="Fat"
      bgcolor="#B0D095"
      height={25}
      part={today?.totals.fat || 0}
      total={today?.goals.fat || 0}
    />

    {/* // Add Food Button */}
    <button
        title="Edit goals"
        className="mp-btn-homepage"
        style={{ position: "absolute", top: 20, right: 20 }}
        onClick={() => setShowEditGoals(true)}
        >
        <BsPencilFill />
    </button>
    <button
        title="Add food to the database"
        className="mp-btn-homepage"
        style={{ position: "absolute", bottom: 20, right: 20 }}
        onClick={() => setShowModal(true)}
        >
        <FaPlus />
    </button>

    <button
        title="Search for food items"
        className="mp-btn-homepage"
        style={{ position: "absolute", bottom: 20, right: 70 }}
        onClick={() => window.location.href = "/search"}
        >
        <FaMagnifyingGlass />
    </button>
    <button
        title="View daily log"
        className="mp-btn-homepage"
        style={{ position: "absolute", bottom: 20, left: 20 }}
        onClick={() => window.location.href = "/demo"}
        >
        <FaList />
    </button>

    {showModal && (
      <ModalAddFood
        open={showModal}
        setOpen={setShowModal}
        onSubmit={handleSubmit}
      />
    )}

    {showEditGoals && (
      <ModalGoalVals
        open={showEditGoals}
        setOpen={setShowEditGoals}
        onSubmit={handleGoalsSubmit}
      />
    )}

    </div>
  );
}

export default HomePage