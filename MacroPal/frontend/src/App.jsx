import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";
import Login from "./pages/login.jsx";
import ModalTest from "./DemoPages/ModalTest.jsx";
import MenuTest from "./DemoPages/MenuTest.jsx";
import Search from "./pages/search.jsx";
import HomePage from "./pages/homepage.jsx";
import { useState } from 'react'

function App() {
 
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/demo" element={<ModalTest />} />
        <Route path="/menu" element={<MenuTest />} />
        <Route path="/search" element={<Search />} />
        <Route path="/homepage" element={<HomePage/>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App
