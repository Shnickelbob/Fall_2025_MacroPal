import { useState } from "react";
import "../App.css";

function Login() {
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

      {/*---------This is temp for easy demo access----------*/}
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

export default Login