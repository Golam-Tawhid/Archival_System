import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  Button,
  CircularProgress,
  Chip
} from '@mui/material';
import {
  Assignment as TaskIcon,
  Pending as PendingIcon,
  CheckCircle as DoneIcon,
  Archive as ArchiveIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { fetchTasks } from '../../store/slices/tasksSlice';

const StatusCard = ({ title, count, icon, color }) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        {icon}
        <Typography variant="h6" component="div" sx={{ ml: 1 }}>
          {title}
        </Typography>
      </Box>
      <Typography variant="h3" component="div" color={color}>
        {count}
      </Typography>
    </CardContent>
  </Card>
);

const RecentTaskCard = ({ task, onViewClick }) => (
  <Card sx={{ mb: 2 }}>
    <CardContent>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Typography variant="h6" component="div" noWrap sx={{ maxWidth: '70%' }}>
          {task.title}
        </Typography>
        <Chip
          label={task.status}
          color={
            task.status === 'done' ? 'success' :
            task.status === 'in_progress' ? 'primary' :
            task.status === 'pending_approval' ? 'warning' : 'default'
          }
          size="small"
        />
      </Box>
      <Typography color="text.secondary" gutterBottom>
        Department: {task.department}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {task.description.substring(0, 100)}...
      </Typography>
      <Button size="small" onClick={() => onViewClick(task._id)}>
        View Details
      </Button>
    </CardContent>
  </Card>
);

function Dashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items: tasks, loading } = useSelector((state) => state.tasks);
  const { user } = useSelector((state) => state.auth);
  const [statistics, setStatistics] = useState({
    total: 0,
    inProgress: 0,
    pendingApproval: 0,
    done: 0,
    archived: 0
  });

  useEffect(() => {
    dispatch(fetchTasks());
  }, [dispatch]);

  useEffect(() => {
    if (tasks.length > 0) {
      const stats = tasks.reduce((acc, task) => {
        acc.total++;
        switch (task.status) {
          case 'in_progress':
            acc.inProgress++;
            break;
          case 'pending_approval':
            acc.pendingApproval++;
            break;
          case 'done':
            acc.done++;
            break;
          case 'archived':
            acc.archived++;
            break;
          default:
            break;
        }
        return acc;
      }, {
        total: 0,
        inProgress: 0,
        pendingApproval: 0,
        done: 0,
        archived: 0
      });
      setStatistics(stats);
    }
  }, [tasks]);

  const handleCreateTask = () => {
    navigate('/tasks/create');
  };

  const handleViewTask = (taskId) => {
    navigate(`/tasks/${taskId}`);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1">
          Welcome, {user?.name}
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateTask}
        >
          Create New Task
        </Button>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatusCard
            title="In Progress"
            count={statistics.inProgress}
            icon={<TaskIcon color="primary" />}
            color="primary.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatusCard
            title="Pending Approval"
            count={statistics.pendingApproval}
            icon={<PendingIcon color="warning" />}
            color="warning.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatusCard
            title="Completed"
            count={statistics.done}
            icon={<DoneIcon color="success" />}
            color="success.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatusCard
            title="Archived"
            count={statistics.archived}
            icon={<ArchiveIcon color="action" />}
            color="text.secondary"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
              Recent Tasks
            </Typography>
            {tasks.slice(0, 5).map((task) => (
              <RecentTaskCard
                key={task._id}
                task={task}
                onViewClick={handleViewTask}
              />
            ))}
            {tasks.length === 0 && (
              <Typography color="text.secondary" align="center">
                No tasks found
              </Typography>
            )}
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
              Department Overview
            </Typography>
            {Object.entries(
              tasks.reduce((acc, task) => {
                acc[task.department] = (acc[task.department] || 0) + 1;
                return acc;
              }, {})
            ).map(([department, count]) => (
              <Box
                key={department}
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 1,
                  p: 1,
                  bgcolor: 'background.default',
                  borderRadius: 1
                }}
              >
                <Typography>{department}</Typography>
                <Chip label={count} size="small" />
              </Box>
            ))}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

export default Dashboard;
