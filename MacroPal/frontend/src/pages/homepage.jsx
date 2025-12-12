/**
 * Home dashboard: progress vs goals + quick actions
 * @author Team 6
 * @version October 12, 2025
 */
import { useEffect, useState } from "react";
import "../App.css";
// NOTE: Menu is global via App.jsx, so no local Menu import here.
import { FaPlus, FaList, FaStar, FaPlusCircle } from "react-icons/fa";
import { FaMagnifyingGlass } from "react-icons/fa6";
import { BsPencilFill } from "react-icons/bs";
import { GiMeal } from "react-icons/gi";
import ProgressBar from "../Components/ProgressBar";
import ModalAddFood from "../Components/ModalAddFood";
import ModalGoalVals from "../Components/ModalGoalVals";
import ModalAddRecipe from "../Components/ModalAddRecipe";
import { Link } from "react-router-dom";
import { fetchToday } from "../api/log";
import { patchGoals /* getGoals */ } from "../api/user";
import ModalSavedFoods from "../Components/ModalSavedFoods";
import ModalRecipes from "../Components/ModalRecipes";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

function HomePage() {
  // modals
  const [showAddFood, setShowAddFood] = useState(false);
  const [showAddRecipe, setShowAddRecipe] = useState(false);
  const [showEditGoals, setShowEditGoals] = useState(false);
  const [showSavedFoods, setShowSavedFoods] = useState(false);

// saved foods state
const [savedFoods, setSavedFoods] = useState([]);
const [savedRecipes, setSavedRecipes] = useState([]);
const [loadingSaved, setLoadingSaved] = useState(false);

// recipes modal state
// const [showRecipes, setShowRecipes] = useState(false);
// const [recipes, setRecipes] = useState([]);
// const [loadingRecipes, setLoadingRecipes] = useState(false);


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

//Recipes fetch
  // useEffect(() => {
  //   if (!showRecipes) return;
  //   (async () => {
  //     setLoadingRecipes(true);
  //     try {
  //       const r = await fetch("http://localhost:5000/api/recipes", { credentials: "include" });
  //       const body = await r.json().catch(() => ({}));
  //       setRecipes(body.recipes || []);
  //     } catch {
  //       setRecipes([]);
  //     } finally {
  //       setLoadingRecipes(false);
  //     }
  //   })();
  // }, [showRecipes]);

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

  // fetch saved foods and recipes when the modal opens
  useEffect(() => {
    if (!showSavedFoods) return;
    (async () => {
      setLoadingSaved(true);
      try {
        const res = await fetch(`${API}/api/saved`, {
          headers: { "x-user-id": localStorage.getItem("mp_user_id") || "" },
          credentials: "include",
        });

        if (!res.ok) {
          setSavedFoods([]);
          setSavedRecipes([]);
        } else {
          const data = await res.json();

          // foods
          const foods = data.savedFoods ?? [];
          const normFoods = foods.map(f => ({
            ...f,
            _id: f._id ?? f.id ?? f.Name ?? f.name,
          }));
          setSavedFoods(normFoods);

          // recipes
          const recipes = data.savedRecipes ?? [];
          setSavedRecipes(recipes);
        }
      } catch {
        setSavedFoods([]);
        setSavedRecipes([]);
      } finally {
        setLoadingSaved(false);
      }
    })();
  }, [showSavedFoods]);


  // log a saved food (same payload as Search) (NEW)
  async function logSavedFood(food) {
    const payload = {
      foodId: food._id,
      name: food.name ?? food.Name ?? "Unnamed",
      cal: food.calories ?? food.Calories ?? 0,
      protein: food.protein ?? food.Protein ?? 0,
      carbs: food.carbs ?? food.Carbs ?? 0,
      fat: food.fat ?? food.Fat ?? 0,
      qty: 1,
    };

    const res = await fetch(`${API}/api/log`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      alert(body.error || "Failed to log food");
      return;
    }
    window.location.href = "/log";
  }

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

  async function logRecipe(payload) {
    const res = await fetch(`${API}/api/log`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error || "Failed to log recipe");
    }
    window.location.href = "/log";
  }

  // async function logSavedRecipe(recipe) {
  //   const payload = { recipeId: recipe._id };
  //   await logRecipe(payload);
  // }

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

  // Add recipe submit
  const handleRecipeSubmit = async (data) => {
    try {
      const r = await fetch("/api/recipe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      const body = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(body.error || "Failed to create recipe");
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
        style={{ position: "absolute", bottom: 20, left: 20 }} 
        onClick={() => setShowEditGoals(true)}
      >
        <BsPencilFill />
      </button>

      {/* Add Recipe */}
      <button
        title="Add Recipe"
        className="mp-btn-homepage"
        style={{ position: "absolute", top: 20, right: 20 }}
        onClick={() => setShowAddRecipe(true)}
      >
        <FaPlusCircle />
      </button>

      {/* Add food */}
      <button
        title="Add food to the database"
        className="mp-btn-homepage"
        style={{ position: "absolute", top: 20, right: 70 }}
        onClick={() => setShowAddFood(true)}
      >
        <FaPlus />
      </button>

      {/* Search */}
      <button
        title="Search for food items"
        className="mp-btn-homepage"
        style={{ position: "absolute", bottom: 20, right: 120 }}
        onClick={() => (window.location.href = "/search")}
      >
        <FaMagnifyingGlass />
      </button>

      {/* Favorites */}
      <button
        title="View saved foods"
        className="mp-btn-homepage"
        style={{ position: "absolute", bottom: 20, right: 70 }}
        onClick={() => setShowSavedFoods(true)}
      >
        <FaStar />
      </button>

      {/* Daily log link */}
      <Link
        to="/log"
        title="View daily log"
        className="mp-btn-homepage"
        style={{ position: "absolute", bottom: 20, right: 20 }}
      >
        <FaList />
      </Link>

      {/* <button
        title="Log a recipe"
        className="mp-btn-homepage"
        style={{ position: "absolute", bottom: 20, right: 20 }}
        onClick={() => setShowRecipes(true)}
      >
        <GiMeal />
      </button> */}


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
          foods={loadingSaved ? [] : savedFoods}
          recipes={loadingSaved ? [] : savedRecipes}
          onLogFood={logSavedFood}
          onLogRecipe={logRecipe}  //  uses the same function as Log Recipe modal
        />
      )}
      {showAddRecipe && (
        <ModalAddRecipe
          open={showAddRecipe}
          setOpen={setShowAddRecipe}
          onSubmit={handleRecipeSubmit}
        />
      )}
      {/* {showRecipes && (
        <ModalRecipes
          open={showRecipes}
          setOpen={setShowRecipes}
          items={loadingRecipes ? [] : recipes}
          onLog={logRecipe}
        />
      )} */}
    </div>
  );
}

export default HomePage;
