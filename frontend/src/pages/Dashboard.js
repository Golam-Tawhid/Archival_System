import React from "react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function Dashboard({ role }) {
  const navigate = useNavigate();

  useEffect(() => {
    if (role === "Admin") {
      navigate("/admin-dashboard");
    } else if (role === "Department Head") {
      navigate("/department-dashboard");
    } else {
      navigate("/user-dashboard");
    }
  }, [role, navigate]);

  return <div>Welcome to the Dashboard!</div>;
}

export default Dashboard;
