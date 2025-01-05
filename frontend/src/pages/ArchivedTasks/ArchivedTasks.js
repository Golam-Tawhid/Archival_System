import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  Button,
  MenuItem,
  TextField,
} from "@mui/material";
import { fetchTasks, updateTask } from "../../store/slices/tasksSlice";

function ArchivedTasks() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items: tasks, loading } = useSelector((state) => state.tasks);
  const user = useSelector((state) => state.auth.user);
  const isAdminOrSuperAdmin = user?.roles.includes("admin") || user?.roles.includes("super_admin");
  
  const [hasPermission, setHasPermission] = useState(true); // State to track permission

  useEffect(() => {
    if (isAdminOrSuperAdmin) {
      dispatch(fetchTasks({ status: "archived" })); // Fetch only archived tasks
    } else {
      setHasPermission(false); // Set permission state to false
    }
  }, [dispatch, isAdminOrSuperAdmin]);

  const handleStatusChange = (taskId, newStatus) => {
    dispatch(updateTask({ taskId, data: { status: newStatus } }));
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!hasPermission) {
    return <Typography>Sorry, you don't have the permission to see the archived tasks.</Typography>; // Show permission message
  }

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Archived Tasks
      </Typography>
      {tasks.length === 0 ? (
        <Typography>No archived tasks found.</Typography>
      ) : (
        tasks.map((task) => (
          <Card key={task._id} sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6">{task.title}</Typography>
              <Typography variant="body2">{task.description}</Typography>
              <TextField
                select
                label="Change Status"
                onChange={(e) => handleStatusChange(task._id, e.target.value)}
                sx={{ mt: 2 }}
              >
                <MenuItem value="not_started">Not Started</MenuItem>
                <MenuItem value="in_progress">In Progress</MenuItem>
                <MenuItem value="pending_approval">Pending Approval</MenuItem>
                <MenuItem value="done">Done</MenuItem>
              </TextField>
              <Button
                variant="outlined"
                onClick={() => navigate(`/tasks/${task._id}`)}
                sx={{ mt: 2 }}
              >
                View Details
              </Button>
            </CardContent>
          </Card>
        ))
      )}
    </Box>
  );
}

export default ArchivedTasks;