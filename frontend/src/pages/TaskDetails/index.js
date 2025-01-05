import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  TextField,
  MenuItem,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
} from "@mui/material";
import {
  ArrowBack as BackIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  CheckCircle as ApproveIcon,
  Archive as ArchiveIcon,
  AttachFile as AttachmentIcon,
  History as HistoryIcon,
  Comment as CommentIcon,
} from "@mui/icons-material";
import {
  updateTask,
  approveTask,
  archiveTask,
  addComment,
  fetchComments,
} from "../../store/slices/tasksSlice";

const priorities = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

function TaskDetails() {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { items: tasks, loading, error } = useSelector((state) => state.tasks);
  const { user } = useSelector((state) => state.auth);

  const [task, setTask] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTask, setEditedTask] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: "",
    action: null,
  });
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState([]);

  useEffect(() => {
    const foundTask = tasks.find((t) => t._id === taskId);
    if (foundTask) {
      const taskWithTags = {
        ...foundTask,
        tags: foundTask.tags || [],
      };
      setTask(taskWithTags);
      setEditedTask(taskWithTags);
    }
  }, [taskId, tasks]);

  useEffect(() => {
    if (taskId) {
      dispatch(fetchComments(taskId))
        .unwrap()
        .then((data) => setComments(data))
        .catch((err) => console.error("Failed to fetch comments:", err));
    }
  }, [taskId, dispatch]);

  const handleBack = () => {
    navigate("/tasks");
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setEditedTask(task);
    setIsEditing(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedTask((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    try {
      await dispatch(updateTask({ taskId, data: editedTask })).unwrap();
      setIsEditing(false);
    } catch (err) {
      console.error("Failed to update task:", err);
    }
  };

  const handleApprove = () => {
    setConfirmDialog({
      open: true,
      title: "Are you sure you want to approve this task?",
      action: async () => {
        try {
          await dispatch(approveTask(taskId)).unwrap();
          setConfirmDialog({ open: false, title: "", action: null });
        } catch (err) {
          console.error("Failed to approve task:", err);
        }
      },
    });
  };

  const handleArchive = () => {
    setConfirmDialog({
      open: true,
      title: "Are you sure you want to archive this task?",
      action: async () => {
        try {
          await dispatch(archiveTask(taskId)).unwrap();
          setConfirmDialog({ open: false, title: "", action: null });
          navigate("/tasks");
        } catch (err) {
          console.error("Failed to archive task:", err);
        }
      },
    });
  };

  const handleAddComment = async () => {
    if (!commentText.trim()) return;

    try {
      const newComment = await dispatch(
        addComment({ taskId, text: commentText })
      ).unwrap();
      setComments((prev) => [newComment, ...prev]);
      setCommentText("");
    } catch (err) {
      console.error("Failed to add comment:", err);
    }
  };

  const canEdit = () => {
    return (
      user?.permissions?.includes("edit_task") &&
      (task?.created_by === user?._id || task?.assigned_to === user?._id)
    );
  };

  const canApprove = () => {
    return (
      user?.permissions?.includes("approve_task") &&
      task?.status === "pending_approval"
    );
  };

  const canArchive = () => {
    return (
      user?.permissions?.includes("access_archives") && task?.status === "done"
    );
  };

  if (loading || !task) {
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
      <Button startIcon={<BackIcon />} onClick={handleBack} sx={{ mb: 3 }}>
        Back to Tasks
      </Button>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 3 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
          }}
        >
          <Typography variant="h5" component="h1">
            Task Details
          </Typography>
          <Box>
            {canEdit() && !isEditing && (
              <Button
                startIcon={<EditIcon />}
                onClick={handleEdit}
                sx={{ mr: 1 }}
              >
                Edit
              </Button>
            )}
            {canApprove() && (
              <Button
                startIcon={<ApproveIcon />}
                color="success"
                onClick={handleApprove}
                sx={{ mr: 1 }}
              >
                Approve
              </Button>
            )}
            {canArchive() && (
              <Button
                startIcon={<ArchiveIcon />}
                color="warning"
                onClick={handleArchive}
              >
                Archive
              </Button>
            )}
          </Box>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Title"
              name="title"
              value={isEditing ? editedTask.title : task.title}
              onChange={handleInputChange}
              disabled={!isEditing}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Description"
              name="description"
              value={isEditing ? editedTask.description : task.description}
              onChange={handleInputChange}
              disabled={!isEditing}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Status"
              value={task.status.replace("_", " ").toUpperCase()}
              disabled
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              select
              label="Priority"
              name="priority"
              value={isEditing ? editedTask.priority : task.priority}
              onChange={handleInputChange}
              disabled={!isEditing}
            >
              {priorities.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="subtitle2" gutterBottom>
              Tags
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
              {(task.tags || []).map((tag, index) => (
                <Chip key={index} label={tag} size="small" />
              ))}
            </Box>
          </Grid>

          {(task.attachments || []).length > 0 && (
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>
                Attachments
              </Typography>
              <List>
                {task.attachments.map((attachment, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <AttachmentIcon />
                    </ListItemIcon>
                    <ListItemText primary={attachment.filename} />
                  </ListItem>
                ))}
              </List>
            </Grid>
          )}

          <Grid item xs={12}>
            <Button
              startIcon={<HistoryIcon />}
              onClick={() => setShowHistory(true)}
            >
              View History
            </Button>
          </Grid>

          {isEditing && (
            <Grid item xs={12}>
              <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
                <Button
                  variant="contained"
                  startIcon={<SaveIcon />}
                  onClick={handleSave}
                >
                  Save Changes
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<CancelIcon />}
                  onClick={handleCancelEdit}
                >
                  Cancel
                </Button>
              </Box>
            </Grid>
          )}
        </Grid>
      </Paper>

      {/* Comment Section */}
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          Comments
        </Typography>
        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Add a comment"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
          />
          <Button
            variant="contained"
            startIcon={<CommentIcon />}
            onClick={handleAddComment}
            sx={{ mt: 2 }}
          >
            Add Comment
          </Button>
        </Box>
        <List>
          {comments.map((comment) => (
            <ListItem key={comment._id}>
              <ListItemText
                primary={comment.comment_text}
                secondary={`By ${
                  comment.createdBy?.name || "Unknown"
                } on ${new Date(comment.createdAt).toLocaleString()}`}
              />
            </ListItem>
          ))}
        </List>
      </Paper>

      <Dialog
        open={showHistory}
        onClose={() => setShowHistory(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Task History</DialogTitle>
        <DialogContent>
          <List>
            {(task.change_log || []).map((change, index) => (
              <ListItem key={index}>
                <ListItemText
                  primary={`${
                    change.field.charAt(0).toUpperCase() + change.field.slice(1)
                  } changed`}
                  secondary={`From: ${change.old_value || "None"} → To: ${
                    change.new_value
                  }`}
                />
                <Typography variant="caption">
                  {new Date(change.changed_at).toLocaleString()}
                </Typography>
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowHistory(false)}>Close</Button>
        </DialogActions>
      </Dialog>

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

export default TaskDetails;
