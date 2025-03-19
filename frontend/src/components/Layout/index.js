import React, { useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  AppBar,
  Box,
  CssBaseline,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Menu,
  MenuItem,
  Divider,
  Tooltip,
  Avatar,
  ListItemButton,
  Stack,
  Badge,
  useTheme,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Dashboard,
  Assignment,
  Assessment,
  People,
  Search,
  AccountCircle,
  ChevronLeft,
  Notifications,
} from "@mui/icons-material";
import { logout } from "../../store/slices/authSlice";
import ThemeToggle from "../ThemeToggle";

const drawerWidth = 260;

function Layout() {
  const [open, setOpen] = useState(true);
  const [anchorEl, setAnchorEl] = useState(null);
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();

  const handleDrawerToggle = () => {
    setOpen(!open);
  };

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const handleProfile = () => {
    navigate("/profile");
    handleClose();
  };

  const menuItems = [
    { text: "Dashboard", icon: <Dashboard />, path: "/dashboard" },
    { text: "Tasks", icon: <Assignment />, path: "/tasks" },
    { text: "Reports", icon: <Assessment />, path: "/reports" },
    { text: "Query Management", icon: <Search />, path: "/query" },
  ];

  // Add User Management for admin users
  if (user?.roles?.includes("admin") || user?.roles?.includes("super_admin")) {
    menuItems.push({
      text: "User Management",
      icon: <People />,
      path: "/users",
    });
  }

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          transition: (theme) =>
            theme.transitions.create(["width", "margin"], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.leavingScreen,
            }),
          ...(open && {
            marginLeft: drawerWidth,
            width: `calc(100% - ${drawerWidth}px)`,
            transition: (theme) =>
              theme.transitions.create(["width", "margin"], {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
              }),
          }),
          background:
            theme.palette.mode === "dark"
              ? `linear-gradient(90deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`
              : `linear-gradient(90deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 100%)`,
        }}
      >
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              onClick={handleDrawerToggle}
              edge="start"
              sx={{
                mr: 2,
                ...(open && { display: "none" }),
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                "&:hover": {
                  backgroundColor: "rgba(255, 255, 255, 0.2)",
                },
              }}
            >
              <MenuIcon />
            </IconButton>
            <Typography
              variant="h6"
              noWrap
              component="div"
              sx={{
                fontWeight: 600,
                letterSpacing: "0.5px",
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              RECoT Archival System
            </Typography>
          </Box>

          <Stack direction="row" spacing={1} alignItems="center">
            <Tooltip title="Notifications">
              <IconButton
                color="inherit"
                sx={{ backgroundColor: "rgba(255, 255, 255, 0.1)" }}
              >
                <Badge badgeContent={0} color="error">
                  <Notifications />
                </Badge>
              </IconButton>
            </Tooltip>

            <ThemeToggle />

            <Box>
              <Tooltip title="Account settings">
                <IconButton
                  onClick={handleMenu}
                  size="small"
                  sx={{
                    ml: 1,
                    backgroundColor: "rgba(255, 255, 255, 0.1)",
                    "&:hover": {
                      backgroundColor: "rgba(255, 255, 255, 0.2)",
                    },
                  }}
                >
                  <Avatar
                    sx={{
                      width: 32,
                      height: 32,
                      bgcolor: "secondary.main",
                      fontSize: "1rem",
                      fontWeight: 600,
                    }}
                  >
                    {user?.name?.[0] || <AccountCircle />}
                  </Avatar>
                </IconButton>
              </Tooltip>
              <Menu
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: "bottom",
                  horizontal: "right",
                }}
                keepMounted
                transformOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                PaperProps={{
                  elevation: 2,
                  sx: {
                    mt: 1,
                    minWidth: 180,
                    overflow: "visible",
                    filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.1))",
                  },
                }}
              >
                <Box sx={{ py: 1, px: 2 }}>
                  <Typography variant="subtitle2" noWrap>
                    {user?.name || "User"}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" noWrap>
                    {user?.email || ""}
                  </Typography>
                </Box>
                <Divider />
                <MenuItem onClick={handleProfile} sx={{ py: 1.5 }}>
                  Profile Settings
                </MenuItem>
                <MenuItem onClick={handleLogout} sx={{ py: 1.5 }}>
                  Sign Out
                </MenuItem>
              </Menu>
            </Box>
          </Stack>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="permanent"
        open={open}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
            borderRight: `1px solid ${theme.palette.divider}`,
            ...(open && {
              width: drawerWidth,
              transition: (theme) =>
                theme.transitions.create("width", {
                  easing: theme.transitions.easing.sharp,
                  duration: theme.transitions.duration.enteringScreen,
                }),
              overflowX: "hidden",
            }),
            ...(!open && {
              width: (theme) => theme.spacing(7),
              transition: (theme) =>
                theme.transitions.create("width", {
                  easing: theme.transitions.easing.sharp,
                  duration: theme.transitions.duration.leavingScreen,
                }),
              overflowX: "hidden",
            }),
          },
        }}
      >
        <Toolbar
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            px: [1],
          }}
        >
          <Box
            sx={{ flexGrow: 1, display: "flex", alignItems: "center", pl: 1 }}
          >
            {open && (
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 600,
                  opacity: 0.9,
                  letterSpacing: "0.5px",
                }}
              >
                Navigation
              </Typography>
            )}
          </Box>
          <IconButton onClick={handleDrawerToggle}>
            <ChevronLeft />
          </IconButton>
        </Toolbar>

        <Divider />

        <Box sx={{ py: 1 }}>
          <List>
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;

              return (
                <ListItem
                  key={item.text}
                  disablePadding
                  sx={{ display: "block" }}
                >
                  <ListItemButton
                    onClick={() => navigate(item.path)}
                    selected={isActive}
                    sx={{
                      minHeight: 48,
                      justifyContent: open ? "initial" : "center",
                      px: 2.5,
                      mb: 0.5,
                      borderRadius: "0 24px 24px 0",
                      mr: 1,
                      ...(isActive && {
                        backgroundColor:
                          theme.palette.mode === "dark"
                            ? "rgba(124, 77, 255, 0.15)"
                            : "rgba(94, 53, 177, 0.1)",
                        "&:hover": {
                          backgroundColor:
                            theme.palette.mode === "dark"
                              ? "rgba(124, 77, 255, 0.25)"
                              : "rgba(94, 53, 177, 0.2)",
                        },
                      }),
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: 0,
                        mr: open ? 3 : "auto",
                        justifyContent: "center",
                        color: isActive ? "primary.main" : "inherit",
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={item.text}
                      sx={{
                        opacity: open ? 1 : 0,
                        "& .MuiTypography-root": {
                          fontWeight: isActive ? 600 : 400,
                        },
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              );
            })}
          </List>
        </Box>
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          marginTop: "64px",
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}

export default Layout;
