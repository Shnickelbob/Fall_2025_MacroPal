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
import ProtectedRoute from "./Components/ProtectedRoute.jsx";
import { useState } from "react";

function App() {
  const [open, setOpen] = useState(false);
  return (
    <Router>
      <AppContent open={open} setOpen={setOpen} />
    </Router>
  );
}

function AppContent({ open, setOpen }) {
  const location = useLocation();
  const hideMenu = location.pathname === "/";

  return (
    <>
      {!hideMenu && open && (
        <div className="menu-overlay show" onClick={() => setOpen(false)} />
      )}

      {!hideMenu && <Menu open={open} setOpen={setOpen} />}

      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/demo" element={<ModalTest />} />
        <Route path="/menu" element={<MenuTest />} />

        <Route
          path="/search"
          element={
            <ProtectedRoute>
              <Search />
            </ProtectedRoute>
          }
        />
        <Route
          path="/homepage"
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/goaldemo"
          element={
            <ProtectedRoute>
              <GoalValsTest />
            </ProtectedRoute>
          }
        />
        <Route
          path="/log"
          element={
            <ProtectedRoute>
              <DailyLog />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
}

export default App;
