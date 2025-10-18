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
import { useState } from 'react';
import "../App.css";
import ModalAddFood from "../Components/ModalAddFood";
import Menu from "../Components/Menu";

function HomePage() {
  const [open, setOpen] = useState(false); // for menu

  return (
    <div className="" style={{ padding: 24 }}>

    {/* // Menu component: */}
    <Menu 
    open={open} 
    setOpen={setOpen}
    />

    <h2>Test Homepage</h2>
    <p>Adding menu and add food buttons for now</p>

    {/* // Add Food Button */}
    <button
        className="mp-btn mp-btn-primary"
        style={{ position: "absolute", top: 20, right: 20 }}
        onClick={() => window.location.href = "/demo"}
        >
        Add Food Demo
    </button>

    </div>
  );
}

export default HomePage