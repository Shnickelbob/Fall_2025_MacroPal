import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";
import LandingPage from "./Pages/LandingPage.jsx";
import ModalTest from "./DemoPages/ModalTest.jsx";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/demo" element={<ModalTest />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App
