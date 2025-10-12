import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";
import Login from "./pages/login.jsx";
import ModalTest from "./DemoPages/ModalTest.jsx";
import { useState } from 'react'

function App() {
 
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/demo" element={<ModalTest />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App
