import { useState } from "react";
import "../App.css";

const Menu = ({ open, setOpen}) => (
    <div>
        <button 
            onClick={() => setOpen(!open)} 
            className="burger" 
            aria-label="Open menu">
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
            &#x2715; 
            </button>
            <a href="/homepage">Homepage</a>
            <a href="/search">Search</a>
            <a href="/">Log out</a>
        </nav>
    </div>
);

export default Menu;