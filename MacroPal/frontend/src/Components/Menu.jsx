import { useEffect, useRef } from "react";
import "../App.css";

const Menu = ({ open, setOpen }) => {
  const menuRef = useRef();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (open && menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open, setOpen]);

  async function handleLogout(e) {
    e.preventDefault();

    try {
      await fetch("http://localhost:5000/api/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (err) {
      console.error("Logout failed:", err);
    }

    localStorage.removeItem("mp_user_id");
    localStorage.removeItem("mp_screen_name");

    window.location.href = "/";
  }

  return (
    <div ref={menuRef}>
      <button
        onClick={() => setOpen(!open)}
        className="burger"
        aria-label="Open menu"
      >
        <div />
        <div />
        <div />
      </button>

      <nav className={`menu ${open ? "open" : ""}`}>
        <button
          className="close-button"
          aria-label="Close menu"
          onClick={() => setOpen(false)}
        >
          ×
        </button>
        <a href="/homepage">Homepage</a>
        <a href="/search">Search</a>
        <a href="/log">Daily Log</a>
        <a href="/" onClick={handleLogout}>Log out</a>
      </nav>
    </div>
  );
};

export default Menu;
