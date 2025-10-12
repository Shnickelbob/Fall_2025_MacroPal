import { useState } from "react";
import Menu from "../Components/Menu";
import "../App.css";

function MenuTest() {
  const [open, setOpen] = useState(false);

  return (
    <div className="" style={{ padding: 24 }}>
      <h2>Test Menu Page</h2>

      <Menu 
      open={open} 
      setOpen={setOpen}
      />
    </div>
  );
}

export default MenuTest
