import React from "react";
import { IconButton, Tooltip, useTheme as useMuiTheme } from "@mui/material";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import { useTheme } from "../../contexts/ThemeContext";

const ThemeToggle = () => {
  const { darkMode, toggleDarkMode } = useTheme();
  const theme = useMuiTheme();

  return (
    <Tooltip title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}>
      <IconButton
        onClick={toggleDarkMode}
        color="inherit"
        aria-label="toggle dark/light mode"
        sx={{
          backgroundColor: "rgba(255, 255, 255, 0.1)",
          transition: "transform 0.3s ease, background-color 0.3s ease",
          "&:hover": {
            backgroundColor: "rgba(255, 255, 255, 0.2)",
            transform: "rotate(30deg)",
          },
        }}
      >
        {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
      </IconButton>
    </Tooltip>
  );
};

export default ThemeToggle;
