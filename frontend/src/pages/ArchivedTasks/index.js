import React, { useEffect, useState } from "react";
import axios from "axios";

const ArchivedTasks = () => {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    const fetchArchivedTasks = async () => {
      try {
        const response = await axios.get("/api/tasks/archived");
        setTasks(response.data);
      } catch (error) {
        console.error("Error fetching archived tasks:", error);
      }
    };

    fetchArchivedTasks();
  }, []);

  return (
    <div>
      <h1>Archived Tasks</h1>
      <ul>
        {tasks.map((task) => (
          <li key={task._id}>
            <h2>{task.title}</h2>
            <p>{task.description}</p>
            <p>Status: {task.status}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ArchivedTasks;
