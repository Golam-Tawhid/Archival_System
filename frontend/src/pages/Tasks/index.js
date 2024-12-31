import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  MenuItem,
  Grid,
  Card,
  CardContent,
  CardActions,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogActions,
  CircularProgress,
  Tooltip,
} from "@mui/material";
import {
  Add as AddIcon,
  FilterList as FilterIcon,
  CheckCircle as ApproveIcon,
  Archive as ArchiveIcon,
} from "@mui/icons-material";
import {
  fetchTasks,
  updateTask,
  approveTask,
  archiveTask,
} from "../../store/slices/tasksSlice";

const statusOptions = [
  { value: "not_started", label: "Not Started" },
  { value: "in_progress", label: "In Progress" },
  { value: "pending_approval", label: "Pending Approval" },
  { value: "done", label: "Done" },
  { value: "archived", label: "Archived" },
];

const departments = [
  { value: "CSE", label: "Computer Science and Engineering" },
  { value: "ECE", label: "Electronics and Communication Engineering" },
  { value: "ME", label: "Mechanical Engineering" },
  { value: "RESEARCH", label: "Research" },
  { value: "ADMIN", label: "Administration" },
];

function Tasks() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items: tasks, loading } = useSelector((state) => state.tasks);
  const { user } = useSelector((state) => state.auth);

  const [filters, setFilters] = useState({
    status: "",
    department: user?.department || "",
    searchTerm: "",
  });

  const [showFilters, setShowFilters] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: "",
    action: null,
  });

  useEffect(() => {
    dispatch(fetchTasks(filters));
  }, [dispatch, filters]);

  const handleCreateTask = () => {
    navigate("/tasks/create");
  };

  const handleEditTask = (taskId) => {
    navigate(`/tasks/${taskId}`);
  };

  const handleApproveTask = (taskId) => {
    setConfirmDialog({
      open: true,
      title: "Are you sure you want to approve this task?",
      action: () => {
        dispatch(approveTask(taskId));
        setConfirmDialog({ open: false, title: "", action: null });
      },
    });
  };

  const handleArchiveTask = (taskId) => {
    setConfirmDialog({
      open: true,
      title: "Are you sure you want to archive this task?",
      action: () => {
        dispatch(archiveTask(taskId));
        setConfirmDialog({ open: false, title: "", action: null });
      },
    });
  };

  const handleFilterChange = (event) => {
    setFilters({
      ...filters,
      [event.target.name]: event.target.value,
    });
  };

  const handleUpdateTask = (taskId, newStatus) => {
    setConfirmDialog({
      open: true,
      title: "Are you sure you want to change the status of this task?",
      action: () => {
        const updatedTaskData = {
          status: newStatus,
        };
        dispatch(updateTask({ taskId, data: updatedTaskData }));
        setConfirmDialog({ open: false, title: "", action: null });
      },
    });
  };

  const canApprove = (task) => {
    return (
      user?.permissions?.includes("approve_task") &&
      task.status === "pending_approval"
    );
  };

  const canArchive = (task) => {
    return (
      user?.permissions?.includes("access_archives") && task.status === "done"
    );
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "not_started":
        return "default";
      case "in_progress":
        return "primary";
      case "pending_approval":
        return "warning";
      case "done":
        return "success";
      case "archived":
        return "error";
      default:
        return "default";
    }
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="80vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h4" component="h1">
          Tasks
        </Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<FilterIcon />}
            onClick={() => setShowFilters(!showFilters)}
            sx={{ mr: 2 }}
          >
            Filters
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreateTask}
          >
            Create Task
          </Button>
        </Box>
      </Box>

      {showFilters && (
        <Paper sx={{ p: 2, mb: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Search"
                name="searchTerm"
                value={filters.searchTerm}
                onChange={handleFilterChange}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                select
                label="Status"
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
              >
                <MenuItem value="">All</MenuItem>
                {statusOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                select
                label="Department"
                name="department"
                value={filters.department}
                onChange={handleFilterChange}
              >
                <MenuItem value="">All</MenuItem>
                {departments.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>
        </Paper>
      )}

      <Grid container spacing={3}>
        {tasks.map((task) => (
          <Grid item xs={12} sm={6} md={4} key={task._id}>
            <Card>
              <CardContent>
                <Typography variant="h6" component="div" noWrap>
                  {task.title}
                </Typography>
                <Box sx={{ mt: 1, mb: 2 }}>
                  <Chip
                    label={task.status.replace("_", " ").toUpperCase()}
                    color={getStatusColor(task.status)}
                    size="small"
                    sx={{ mr: 1 }}
                  />
                  <Chip
                    label={task.department}
                    variant="outlined"
                    size="small"
                  />
                </Box>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 2 }}
                >
                  {task.description
                    ? task.description.substring(0, 100)
                    : "No description available"}
                  ...
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Created by: {task.created_by}
                </Typography>
              </CardContent>
              <CardActions>
                <Button size="small" onClick={() => handleEditTask(task._id)}>
                  View Details
                </Button>
                <TextField
                  select
                  label="Status"
                  value={task.status}
                  onChange={(e) => handleUpdateTask(task._id, e.target.value)}
                  sx={{ mr: 1 }}
                >
                  {statusOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
                {canApprove(task) && (
                  <Tooltip title="Approve Task">
                    <IconButton
                      size="small"
                      color="success"
                      onClick={() => handleApproveTask(task._id)}
                    >
                      <ApproveIcon />
                    </IconButton>
                  </Tooltip>
                )}
                {canArchive(task) && (
                  <Tooltip title="Archive Task">
                    <IconButton
                      size="small"
                      color="warning"
                      onClick={() => handleArchiveTask(task._id)}
                    >
                      <ArchiveIcon />
                    </IconButton>
                  </Tooltip>
                )}
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog
        open={confirmDialog.open}
        onClose={() =>
          setConfirmDialog({ open: false, title: "", action: null })
        }
      >
        <DialogTitle>{confirmDialog.title}</DialogTitle>
        <DialogActions>
          <Button
            onClick={() =>
              setConfirmDialog({ open: false, title: "", action: null })
            }
          >
            Cancel
          </Button>
          <Button
            onClick={confirmDialog.action}
            variant="contained"
            color="primary"
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Tasks;
