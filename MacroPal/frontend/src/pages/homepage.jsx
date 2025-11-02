/** 
 * Home dashboard: progress vs goals + quick actions
 * @author Team 6
 * @version October 12, 2025
 */
import { useEffect, useState } from "react";
import "../App.css";
// NOTE: Menu is global via App.jsx, so no local Menu import here.
import { FaPlus, FaList } from "react-icons/fa";
import { FaMagnifyingGlass } from "react-icons/fa6";
import { BsPencilFill } from "react-icons/bs";
import ProgressBar from "../Components/ProgressBar";
import ModalAddFood from "../Components/ModalAddFood";
import ModalGoalVals from "../Components/ModalGoalVals";
import { Link } from "react-router-dom";
import { fetchToday } from "../api/log";
import { patchGoals /* getGoals */ } from "../api/user";
import { FaStar } from "react-icons/fa";
import ModalSavedFoods from "../Components/ModalSavedFoods";

function HomePage() {
  // modals
  const [showAddFood, setShowAddFood] = useState(false);
  const [showEditGoals, setShowEditGoals] = useState(false);
  const [showSavedFoods, setShowSavedFoods] = useState(false);

  // header name
  const [screenName, setScreenName] = useState("User");
  useEffect(() => {
    setScreenName(localStorage.getItem("mp_screen_name") || "User");
  }, []);

  // data
  const [today, setToday] = useState({
    totals: { cal: 0, protein: 0, carbs: 0, fat: 0 },
    goals: { cal: 0, protein: 0, carbs: 0, fat: 0 },
  });
  const [err, setErr] = useState("");

  // load + refresh on visibility
  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        setErr("");
        const data = await fetchToday(); // should include x-user-id internally
        if (!mounted) return;

        const safe = {
          totals: {
            cal: Number(data?.totals?.cal) || 0,
            protein: Number(data?.totals?.protein) || 0,
            carbs: Number(data?.totals?.carbs) || 0,
            fat: Number(data?.totals?.fat) || 0,
          },
          goals: {
            cal: Number(data?.goals?.cal) || 0,
            protein: Number(data?.goals?.protein) || 0,
            carbs: Number(data?.goals?.carbs) || 0,
            fat: Number(data?.goals?.fat) || 0,
          },
        };
        setToday(safe);
      } catch (e) {
        console.error(e);
        setErr(e.message || "Failed to load dashboard.");
        setToday({
          totals: { cal: 0, protein: 0, carbs: 0, fat: 0 },
          goals: { cal: 0, protein: 0, carbs: 0, fat: 0 },
        });
      }
    };

    load();
    const onVis = () => {
      if (document.visibilityState === "visible") load();
    };
    window.addEventListener("visibilitychange", onVis);

    return () => {
      mounted = false;
      window.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  // Edit Goals submit
  const handleGoalsSubmit = async (patch) => {
    try {
      await patchGoals(patch); // PATCH /api/user/goals with x-user-id
      const fresh = await fetchToday();
      setToday({
        totals: {
          cal: Number(fresh?.totals?.cal) || 0,
          protein: Number(fresh?.totals?.protein) || 0,
          carbs: Number(fresh?.totals?.carbs) || 0,
          fat: Number(fresh?.totals?.fat) || 0,
        },
        goals: {
          cal: Number(fresh?.goals?.cal) || 0,
          protein: Number(fresh?.goals?.protein) || 0,
          carbs: Number(fresh?.goals?.carbs) || 0,
          fat: Number(fresh?.goals?.fat) || 0,
        },
      });
      setShowEditGoals(false);
    } catch (e) {
      alert(e.message);
    }
  };

  // Add food demo submit
  const handleSubmit = async (data) => {
    try {
      const r = await fetch("/api/foods", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      const body = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(body.error || "Failed to create food");
      alert(`Saved: ${body.Name}`);
    } catch (e) {
      alert(e.message);
    }
  };

  const allGoalsMet =
    today &&
    today.goals &&
    today.totals &&
    (today.goals.cal ? today.totals.cal >= today.goals.cal : false) &&
    (today.goals.protein ? today.totals.protein >= today.goals.protein : false) &&
    (today.goals.carbs ? today.totals.carbs >= today.goals.carbs : false) &&
    (today.goals.fat ? today.totals.fat >= today.goals.fat : false);

  return (
    <div>
      {/* Header */}
      <div className="intro">
        <h1 className="intro-title intro-accent hue-anim">
          {screenName}'s Daily Dashboard
        </h1>
        <p className="intro-subtitle">Track your goals and see today’s progress</p>
        <div className="intro-divider" />
      </div>

      {/* Progress */}
      <ProgressBar
        label="Calories"
        bgcolor="#D62E4E"
        height={25}
        part={today?.totals?.cal || 0}
        total={today?.goals?.cal || 0}
      />
      <ProgressBar
        label="Protein"
        bgcolor="#81ACA6"
        height={25}
        part={today?.totals?.protein || 0}
        total={today?.goals?.protein || 0}
      />
      <ProgressBar
        label="Carbs"
        bgcolor="#E8A202"
        height={25}
        part={today?.totals?.carbs || 0}
        total={today?.goals?.carbs || 0}
      />
      <ProgressBar
        label="Fat"
        bgcolor="#B0D095"
        height={25}
        part={today?.totals?.fat || 0}
        total={today?.goals?.fat || 0}
      />

      {/* All-goals banner */}
      {allGoalsMet && (
        <div className="all-goals-banner">🎉 All goals met for today!</div>
      )}

      {/* Edit goals */}
      <button
        title="Edit goals"
        className="mp-btn-homepage"
        style={{ position: "absolute", top: 20, right: 20 }}
        onClick={() => setShowEditGoals(true)}
      >
        <BsPencilFill />
      </button>

      {/* Add food */}
      <button
        title="Add food to the database"
        className="mp-btn-homepage"
        style={{ position: "absolute", bottom: 20, right: 20 }}
        onClick={() => setShowAddFood(true)}
      >
        <FaPlus />
      </button>

      {/* Search */}
      <button
        title="Search for food items"
        className="mp-btn-homepage"
        style={{ position: "absolute", bottom: 20, right: 70 }}
        onClick={() => (window.location.href = "/search")}
      >
        <FaMagnifyingGlass />
      </button>

      {/* Favorites */}
      <button
        title="View saved foods"
        className="mp-btn-homepage"
        style={{ position: "absolute", bottom: 20, right: 120 }}
        onClick={() => setShowSavedFoods(true)}
      >
        <FaStar />
      </button>


      {/* Daily log link */}
      <Link
        to="/log"
        title="View daily log"
        className="mp-btn-homepage"
        style={{ position: "absolute", bottom: 20, left: 20 }}
      >
        <FaList />
      </Link>

      {/* Errors */}
      {err && <div style={{ color: "crimson", marginTop: 8 }}>{err}</div>}

      {/* Modals */}
      {showAddFood && (
        <ModalAddFood
          open={showAddFood}
          setOpen={setShowAddFood}
          onSubmit={handleSubmit}
        />
      )}
      {showEditGoals && (
        <ModalGoalVals
          open={showEditGoals}
          setOpen={setShowEditGoals}
          onSubmit={handleGoalsSubmit}
          initialGoals={today?.goals}
        />
      )}
      {showSavedFoods && (
        <ModalSavedFoods
          open={showSavedFoods}
          setOpen={setShowSavedFoods}
          // TODO: Replace this static list with data fetched from the backend
          items={[
            { _id: "1", name: "Grilled Chicken", calories: 220, protein: 40, fat: 5, carbs: 0 },
            { _id: "2", name: "Banana", calories: 90, protein: 1, fat: 0, carbs: 23 },
            { _id: "3", name: "Greek Yogurt", calories: 130, protein: 12, fat: 4, carbs: 9 }
          ]}
          onLog={(food) => console.log("Log clicked for:", food)}
        />
      )}
    </div>
  );
}

export default HomePage;
