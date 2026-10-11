
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        "http://localhost:8080/auth/login",
        { email, password }
      );

      const user = response.data;
      localStorage.setItem("user", JSON.stringify(user));

      if (user.userType === "ADMIN") {
        navigate("/admin");
      } else if (user.userType === "FACULTY") {
        navigate("/faculty");
      } else if (user.userType === "STUDENT") {
        navigate("/student");
      } else {
        alert("Unknown user role");
      }
    } catch (error) {
      alert(
        error.response?.data?.message ||
        "Login failed. Check your email and password."
      );
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <input
        type="email"
        placeholder="Enter email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />

      <input
        type="password"
        placeholder="Enter password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />

      <button type="submit">Login</button>
    </form>
  );
}

export default Login;
