import React, { useState, useEffect } from "react";
import TaskForm from "../components/TaskForm";
import TaskList from "../components/TaskList";
import api from "../services/api";

function AdminPage() {
  const [tasks, setTasks] = useState([]);

  const fetchTasks = async () => {
    try {
      const response = await api.get("/tasks/");
      setTasks(response.data.tasks);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  const handleTaskSubmit = async (taskData) => {
    try {
      await api.post("/tasks", taskData);
      alert("Task created successfully");
      fetchTasks(); // Refresh task list
    } catch (error) {
      console.error("Error creating task:", error);
    }
  };

  const handleTaskUpdate = async (taskId, updatedData) => {
    try {
      await api.put(`/tasks/${taskId}`, updatedData);
      alert("Task updated successfully");
      fetchTasks(); // Refresh task list
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  return (
    <div>
      <h1>Admin Dashboard</h1>
      <TaskForm onSubmit={handleTaskSubmit} />
      <TaskList tasks={tasks} onUpdate={handleTaskUpdate} />
    </div>
  );
}

export default AdminPage;
