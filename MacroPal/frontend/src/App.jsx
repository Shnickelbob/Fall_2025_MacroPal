import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";
import Login from "./pages/login.jsx";
import ModalTest from "./DemoPages/ModalTest.jsx";
import MenuTest from "./DemoPages/MenuTest.jsx";
import { useState } from 'react'

function App() {
 
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/demo" element={<ModalTest />} />
        <Route path="/menu" element={<MenuTest />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App
