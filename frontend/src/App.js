import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import UserHome from "./pages/UserHome";
import AdminPage from "./pages/AdminPage";

function App() {
  const userRole = localStorage.getItem("userRole"); // Get the user's role from storage

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route
          path="/user-home"
          element={userRole === "User" ? <UserHome /> : <Navigate to="/" />}
        />
        <Route
          path="/admin"
          element={userRole === "Admin" ? <AdminPage /> : <Navigate to="/" />}
        />
        <Route path="/register" element={<Register />} />
      </Routes>
    </Router>
  );
}

export default App;
