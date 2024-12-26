import React, { useState } from "react";

function TaskForm({ onSubmit }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [assignedDepartment, setAssignedDepartment] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const taskData = {
      title,
      description,
      priority,
      assigned_department: assignedDepartment,
    };
    onSubmit(taskData);
    setTitle("");
    setDescription("");
    setPriority("Medium");
    setAssignedDepartment("");
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Task Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />
      <textarea
        placeholder="Task Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        required
      />
      <select value={priority} onChange={(e) => setPriority(e.target.value)}>
        <option value="Low">Low</option>
        <option value="Medium">Medium</option>
        <option value="High">High</option>
      </select>
      <input
        type="text"
        placeholder="Assigned Department"
        value={assignedDepartment}
        onChange={(e) => setAssignedDepartment(e.target.value)}
      />
      <button type="submit">Submit Task</button>
    </form>
  );
}

export default TaskForm;
