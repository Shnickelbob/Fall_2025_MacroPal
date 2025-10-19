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
import { FaPlus, FaList} from "react-icons/fa";
import { FaMagnifyingGlass } from "react-icons/fa6";
import { BsPencilFill } from "react-icons/bs";
import ProgressBar from "../Components/ProgressBar";

function HomePage() {
  const [open, setOpen] = useState(false); // for menu

  return (
    <div className="" style={{ }}>

    {/* // Menu component: */}
    <Menu 
    open={open} 
    setOpen={setOpen}
    />

    <h2>USER'S Daily Goals</h2>
    <p>Progress bars for visual indications</p>
    <ProgressBar
      label="Calories"
      bgcolor="#D62E4E"
      height={25}
      part={850}
      total={2000}
    />

    <ProgressBar
      label="Protein"
      bgcolor="#81ACA6"
      height={25}
      part={55}
      total={100}
    />

    <ProgressBar
      label="Carbs"
      bgcolor="#E8A202"
      height={25}
      part={10}
      total={75}
    />

    <ProgressBar
      label="Fat"
      bgcolor="#B0D095"
      height={25}
      part={15}
      total={40}
    />

    {/* // Add Food Button */}
    <button
        title="Edit goals"
        className="mp-btn-homepage"
        style={{ position: "absolute", top: 20, right: 20 }}
        onClick={() => window.location.href = "/demo"}
        >
        <BsPencilFill />
    </button>
    <button
        title="Add food to the database"
        className="mp-btn-homepage"
        style={{ position: "absolute", bottom: 20, right: 20 }}
        onClick={() => window.location.href = "/demo"}
        >
        <FaPlus />
    </button>
    <button
        title="Search for food items"
        className="mp-btn-homepage"
        style={{ position: "absolute", bottom: 20, right: 70 }}
        onClick={() => window.location.href = "/search"}
        >
        <FaMagnifyingGlass />
    </button>
    <button
        title="View daily log"
        className="mp-btn-homepage"
        style={{ position: "absolute", bottom: 20, left: 20 }}
        onClick={() => window.location.href = "/demo"}
        >
        <FaList />
    </button>

    </div>
  );
}

export default HomePage