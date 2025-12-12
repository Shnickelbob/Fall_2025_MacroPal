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

  const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

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
      const response = await fetch(`${API}/api/register`, {
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
      const response = await fetch(`${API}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // send/receive cookie for express-session
        body: JSON.stringify({ username, password }),
      });

      // Be resilient to either JSON or text
      const raw = await response.text();
      let data = null; // <-- removed TypeScript type annotation
      try { data = raw ? JSON.parse(raw) : null; } catch { /* ignore */ }

      if (!response.ok) {
        alert(data?.error || "Incorrect username or password");
        return;
      }

      const loginSuccess =
        data?.ok === true ||
        data?.message === "Login Successful";

      if (loginSuccess) {
        // store IDs/names for later pages (support both payload shapes)
        if (data?.userId) localStorage.setItem("mp_user_id", String(data.userId));
        const screen =
          data?.screenName ??
          data?.username ??
          username;
        if (screen) localStorage.setItem("mp_screen_name", screen);

        navigate("/homepage");
      } else {
        alert(data?.error || "Incorrect username or password");
      }
    } catch (err) {
      console.error(err);
      alert("Unable to reach server. Please try again.");
    }
  };

  // Simple centered column layout using your theme classes
  const pageWrap = {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };
  const section = { padding: "20px 22px" };
  const form = { display: "flex", flexDirection: "column", gap: 10 };
  const label = { textAlign: "left", fontSize: ".9rem", opacity: 0.9 };
  const actions = { display: "flex", gap: 10, marginTop: 8 };

  return (
    <div className="mp-page" style={pageWrap}>
      <div className="mp-card">
        <div className="mp-card-header">
          <div style={{ maxWidth: 760, margin: '24px auto', padding: '0 16px' }}>
            <style>{`
              @keyframes hueShift { 0% { filter: hue-rotate(0deg); } 100% { filter: hue-rotate(360deg); } }
              .hue-anim { animation: hueShift 16s linear infinite; }
            `}</style>

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
