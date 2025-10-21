import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";

/** ------- Register Modal (uses same pattern as ModalAddFood) ------- */
function RegisterModal({ open, setOpen, onRegistered }) {
  const [regUsername, setRegUsername] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirm, setRegConfirm] = useState("");
  const [error, setError] = useState("");

  const backdropMouseDownOnOverlay = useRef(false);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, setOpen]);

  if (!open) return null;

  const handleSubmit = async () => {
    setError("");
    const u = regUsername.trim();
    if (u.length < 3) return setError("Username must be at least 3 characters.");
    if (!regPassword) return setError("Please enter a password.");
    if (regPassword !== regConfirm) return setError("Passwords do not match.");

    try {
      const response = await fetch("http://localhost:5000/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: u, password: regPassword }),
      });
      const result = await response.text();
      if (result === `User ${u} registered`) {
        alert("Account successfully created! Please log in.");
        onRegistered?.(u);
        setRegUsername("");
        setRegPassword("");
        setRegConfirm("");
        setOpen(false);
      } else {
        setError(result || "Username already exists.");
      }
    } catch (e) {
      console.error(e);
      setError("Unable to reach server. Please try again.");
    }
  };

  return (
    <div
      className="mp-modal-overlay"
      role="dialog"
      aria-modal="true"
      onMouseDown={() => (backdropMouseDownOnOverlay.current = true)}
      onClick={() => {
        if (backdropMouseDownOnOverlay.current) setOpen(false);
        backdropMouseDownOnOverlay.current = false;
      }}
    >
      <div
        className="mp-modal-card"
        onMouseDown={(e) => {
          e.stopPropagation();
          backdropMouseDownOnOverlay.current = false;
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mp-modal-header">
          <strong>Create your account</strong>
          <button className="mp-btn" onClick={() => setOpen(false)} aria-label="Close">
            ✕
          </button>
        </div>

        <div className="mp-modal-body">
          <div className="mp-form">
            <input
              className="mp-input"
              placeholder="Username"
              value={regUsername}
              onChange={(e) => setRegUsername(e.target.value)}
              autoComplete="username"
            />
            <input
              className="mp-input"
              type="password"
              placeholder="Password"
              value={regPassword}
              onChange={(e) => setRegPassword(e.target.value)}
              autoComplete="new-password"
            />
            <input
              className="mp-input"
              type="password"
              placeholder="Confirm password"
              value={regConfirm}
              onChange={(e) => setRegConfirm(e.target.value)}
              autoComplete="new-password"
            />
            {error && <div className="mp-error">{error}</div>}
          </div>
        </div>

        <div className="mp-modal-footer">
          <button className="mp-btn" onClick={() => setOpen(false)}>Cancel</button>
          <button className="mp-btn mp-btn-primary" onClick={handleSubmit}>
            Create account
          </button>
        </div>
      </div>
    </div>
  );
}

/** -------------------- Login Page -------------------- */
function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [openRegister, setOpenRegister] = useState(false);

  const verifyLogin = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json().catch(() => null);

      if (!response.ok || !data?.ok) {
        alert(data?.error || "Incorrect username or password");
        return;
      }
      // Save user info for later requests/pages
      localStorage.setItem("mp_user_id", data.userId);
      localStorage.setItem("mp_screen_name", data.screenName || username);

      navigate("/homepage");
    } catch (err) {
      console.error(err);
      alert("Unable to reach server. Please try again.");
    }
  };

  // Simple centered column layout using your theme classes;
  // no new CSS required beyond your existing .mp-* rules.
  const pageWrap = {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };
  const card = {
    width: "min(92vw, 420px)",
    background: "#2b2b2b",
    color: "#fff",
    borderRadius: 16,
    boxShadow: "0 12px 40px rgba(0,0,0,.35)",
    overflow: "hidden",
  };
  const section = { padding: "20px 22px" };
  const header = {
    ...section,
    paddingBottom: 8,
    borderBottom: "1px solid rgba(255,255,255,.08)",
  };
  const title = { margin: 0, fontSize: "1.6rem", letterSpacing: ".5px" };
  const subtitle = { margin: "6px 0 0", opacity: 0.85, fontSize: ".95rem" };
  const form = { display: "flex", flexDirection: "column", gap: 10 };
  const label = { textAlign: "left", fontSize: ".9rem", opacity: 0.9 };
  const actions = { display: "flex", gap: 10, marginTop: 8 };

  return (
    <div className="mp-page" style={pageWrap}>
      <div className="mp-card">
        <div className="mp-card-header">
          <div style={{ maxWidth: 760, margin: '24px auto', padding: '0 16px' }}>
            {/* Slow rainbow animation for the title */}
            <style>{`
              @keyframes hueShift {
                0%   { filter: hue-rotate(0deg); }
                100% { filter: hue-rotate(360deg); }
              }
              .hue-anim {
                animation: hueShift 16s linear infinite;
              }
            `}</style>

            {/* Title and description */}
            <div className="intro">
              <h1
                className="intro-title intro-accent hue-anim"
                style={{
                  backgroundImage: 'linear-gradient(90deg,#7aa2ff,#b38bff,#ff9fb3)',
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                  color: 'transparent'
                }}
              >
                MacroPal
              </h1>
              <p className="intro-subtitle">Simple nutrition tracker & adventure journal</p>
            </div>
          </div>
        </div>

        <div style={section}>
          <div style={form}>
            <label style={label} htmlFor="login-username">Username</label>
            <input
              id="login-username"
              className="mp-input"
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
            />

            <label style={label} htmlFor="login-password">Password</label>
            <input
              id="login-password"
              className="mp-input"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />

            <div style={actions}>
              <button className="mp-btn mp-btn-primary" onClick={verifyLogin}>
                Log in
              </button>
              <button className="mp-btn" onClick={() => setOpenRegister(true)}>
                Create account
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Demo Food Button */}
      <button
        className="mp-btn mp-btn-primary"
        style={{ position: "fixed", bottom: 20, right: 20 }}
        onClick={() => (window.location.href = "/demo")}
      >
        Add Food Demo
      </button>

      {/* Register modal with same CSS stylings as your ModalAddFood */}
      <RegisterModal
        open={openRegister}
        setOpen={setOpenRegister}
        onRegistered={(newUser) => {
          setUsername(newUser);
          setPassword("");
        }}
      />
    </div>
  );
}

export default Login;
