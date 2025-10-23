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
import ModalGoalVals from "../Components/ModalGoalVals";
import Menu from "../Components/Menu";
import { FaPlus, FaList } from "react-icons/fa";
import { FaMagnifyingGlass } from "react-icons/fa6";
import { BsPencilFill } from "react-icons/bs";
import ProgressBar from "../Components/ProgressBar";
import { Link } from "react-router-dom";
import { fetchToday } from "../api/log";
import { getGoals, patchGoals } from "../api/user";

function HomePage() {
  const [open, setOpen] = useState(false);           // menu
  const [showAddFood, setShowAddFood] = useState(false);
  const [showEditGoals, setShowEditGoals] = useState(false);

  // Today’s data from backend
  const [today, setToday] = useState(null);
  const [err, setErr] = useState("");

  // for users:
  const [user, setUser] = useState("");
    useEffect(() => {
      // grab stored username
      const storedUser = localStorage.getItem("mp_screen_name");
      if (storedUser) {
        setUser(storedUser);
      }
    }, []);


  useEffect(() => {
    let mounted = true;
    fetchToday()
      .then((data) => mounted && setToday(data))
      .catch((e) => mounted && setErr(e.message));
    return () => { mounted = false; };
    }, []);

    // Load totals/goals on mount
  // useEffect(() => {
  //   let mounted = true;

  //   const load = async () => {
  //     try {
  //       setErr("");
  //       const data = await fetchToday(); // now sends x-user-id
  //       if (!mounted) return;

  //       const safe = {
  //         totals: {
  //           cal: Number(data?.totals?.cal) || 0,
  //           protein: Number(data?.totals?.protein) || 0,
  //           carbs: Number(data?.totals?.carbs) || 0,
  //           fat: Number(data?.totals?.fat) || 0,
  //         },
  //         goals: {
  //           cal: Number(data?.goals?.cal) || 0,
  //           protein: Number(data?.goals?.protein) || 0,
  //           carbs: Number(data?.goals?.carbs) || 0,
  //           fat: Number(data?.goals?.fat) || 0,
  //         },
  //       };
  //       setToday(safe);
  //     } catch (e) {
  //       console.error(e);
  //       setErr(e.message || "Failed to load dashboard.");
  //       setToday({
  //         totals: { cal: 0, protein: 0, carbs: 0, fat: 0 },
  //         goals: { cal: 0, protein: 0, carbs: 0, fat: 0 },
  //       });
  //     }
  //   };

  //   load();

  //   // Refetch when tab regains focus (e.g., after logging food)
  //   const onVis = () => { if (document.visibilityState === "visible") load(); };
  //   window.addEventListener("visibilitychange", onVis);
  //   return () => {
  //     mounted = false;
  //     window.removeEventListener("visibilitychange", onVis);
  //   };
  // }, []);

  // Submit handler for the Edit Goals modal
  // const handleGoalsSubmit = async (patch) => {
  //   try {
  //     await patchGoals(patch);     // PATCH /api/user/goals with x-user-id
  //     const fresh = await fetchToday(); // refresh totals + goals
  //     setToday({
  //       totals: {
  //         cal: Number(fresh?.totals?.cal) || 0,
  //         protein: Number(fresh?.totals?.protein) || 0,
  //         carbs: Number(fresh?.totals?.carbs) || 0,
  //         fat: Number(fresh?.totals?.fat) || 0,
  //       },
  //       goals: {
  //         cal: Number(fresh?.goals?.cal) || 0,
  //         protein: Number(fresh?.goals?.protein) || 0,
  //         carbs: Number(fresh?.goals?.carbs) || 0,
  //         fat: Number(fresh?.goals?.fat) || 0,
  //       },
  //     });
  //     setShowEditGoals(false);
  //   } catch (e) {
  //     alert(e.message);
  //   }
  // };

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


  // Preload goals into the modal when opening it
  // const openEditGoals = async () => {
  //   try {
  //     const g = await getGoals();
  //     setToday((t) => ({
  //       ...(t || { totals: { cal: 0, protein: 0, carbs: 0, fat: 0 }, goals: { cal: 0, protein: 0, carbs: 0, fat: 0 } }),
  //       goals: {
  //         cal: Number(g?.cal) || 0,
  //         protein: Number(g?.protein) || 0,
  //         carbs: Number(g?.carbs) || 0,
  //         fat: Number(g?.fat) || 0,
  //       }
  //     }));
  //   } catch { }
  //   setShowEditGoals(true);
  // };

  // (Unchanged) Add food demo
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

  return (
    <div className="" style={{}}>

      {/* Menu */}
      <Menu open={open} setOpen={setOpen} />

      <h2>{ user }'s Daily Goals</h2>
      <p>Progress bars for visual indications</p>

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

      {/* Edit goals button */}
      {/* <button
        title="Edit goals"
        className="mp-btn-homepage"
        style={{ position: "absolute", top: 20, right: 20 }}
        onClick={openEditGoals}
      >
        <BsPencilFill />
      </button> */}

    <button
        title="Edit goals"
        className="mp-btn-homepage"
        style={{ position: "absolute", top: 20, right: 20 }}
        onClick={() => setShowEditGoals(true)}
        >
        <BsPencilFill />
    </button>

     {/* Add food to DB (demo)  */}
      <button
        title="Add food to the database"
        className="mp-btn-homepage"
        style={{ position: "absolute", bottom: 20, right: 20 }}
        onClick={() => setShowAddFood(true)}
      >
        <FaPlus />
      </button>


      {/* Search page */}
      <button
        title="Search for food items"
        className="mp-btn-homepage"
        style={{ position: "absolute", bottom: 20, right: 70 }}
        onClick={() => (window.location.href = "/search")}
      >
        <FaMagnifyingGlass />
      </button>

      {/* Daily log (link) */}
      <Link
        to="/log"
        title="View daily log"
        className="mp-btn-homepage"
        style={{ position: "absolute", bottom: 20, left: 20 }}
      >
        <FaList />
      </Link>

      {err && <div style={{ color: "crimson", marginTop: 8 }}>{err}</div>}

      {showAddFood && (
        <ModalAddFood
          open={showAddFood}
          setOpen={setShowAddFood}
          onSubmit={handleSubmit}
        />
      )}

      {/* Goals modal lives here now */}
      {showEditGoals && (
        <ModalGoalVals
          open={showEditGoals}
          setOpen={setShowEditGoals}
          onSubmit={handleGoalsSubmit}
        />
      )}

      {/* <ModalGoalVals
        open={showEditGoals}
        setOpen={setShowEditGoals}
        onSubmit={handleGoalsSubmit}
        // initialGoals={today?.goals}
      /> */}
    </div>

  );
}

export default HomePage;
