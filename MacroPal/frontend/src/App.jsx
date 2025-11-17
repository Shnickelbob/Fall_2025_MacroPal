// App.jsx
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import "./App.css";
import Login from "./pages/login.jsx";
import ModalTest from "./DemoPages/ModalTest.jsx";
import MenuTest from "./DemoPages/MenuTest.jsx";
import Search from "./pages/search.jsx";
import HomePage from "./pages/homepage.jsx";
import GoalValsTest from "./DemoPages/GoalValsTest.jsx";
import DailyLog from "./pages/log.jsx";
import Menu from "./Components/Menu";
import Recipe from "./pages/recipe.jsx";
import { useState } from "react";

function App() {
  const [open, setOpen] = useState(false);   // global menu state
  return (
    <Router>
      <AppContent open={open} setOpen={setOpen} />
    </Router>
  );
}

function AppContent({ open, setOpen }) {
  const location = useLocation();
  const hideMenu = location.pathname === "/"; // hide on login

  return (
    <>
      {/* overlay sits under the menu; click to close */}
      {!hideMenu && open && (
        <div className="menu-overlay show" onClick={() => setOpen(false)} />
      )}

      {/* global menu on all non-login pages */}
      {!hideMenu && <Menu open={open} setOpen={setOpen} />}

      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/demo" element={<ModalTest />} />
        <Route path="/menu" element={<MenuTest />} />
        <Route path="/search" element={<Search />} />
        <Route path="/homepage" element={<HomePage />} />
        <Route path="/goaldemo" element={<GoalValsTest />} />
        <Route path="/recipe/:id" element={<Recipe />} />
        <Route path="/log" element={<DailyLog />} /> {/* merged route */}
      </Routes>
    </>
  );
}

export default App;
