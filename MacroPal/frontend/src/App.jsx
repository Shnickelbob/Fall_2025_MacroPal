import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";
import LandingPage from "./Pages/LandingPage.jsx";
import ModalTest from "./DemoPages/ModalTest.jsx";
import { useState } from 'react'

function App() {
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const registerNewUser = async () => {

    //send username and password in a POST request to api/register
    const response = await fetch("http://localhost:5000/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const result = await response.text();
    if(result === `User ${username} registered`){
      console.log("User registered successfully");
      //redirect to user dashboard (not implemented yet)
    }
    else{
      alert("Username already exists");
    }
  }
  const verifyLogin = async () => {

    //send username and password in a POST request to api/login
    const response = await fetch("http://localhost:5000/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const result = await response.text();
    if(result === "Login Successful"){
      console.log("Login Successful");
      //redirect to user dashboard (not implemented yet)
    }
    else{
      alert("Incorrect username or password");
    }
  }

  
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/demo" element={<ModalTest />} />
      </Routes>
    </BrowserRouter>

    <div className="App">
      <h1>Macro Pal Begins</h1>
      <p>Welcome to your simple nutrition tracker and adventure journal!</p>
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        type="text"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      
      {/* Buttons to trigger login and register */}
      <button onClick={verifyLogin}>Login</button>
      <button onClick={registerNewUser}>Create an Account</button>

    </div>
  )
}

export default App
