import React from "react";
import { GlobalStyles } from "@mui/material";
import { useTheme } from "../contexts/ThemeContext";

/**
 * Injects global styles based on theme mode
 */
const ThemeModeInjector = () => {
  const { darkMode } = useTheme();

  // Custom scrollbar styles and any other global theme-specific styles
  return (
    <GlobalStyles
      styles={{
        "*::-webkit-scrollbar": {
          width: "8px",
          height: "8px",
        },
        "*::-webkit-scrollbar-track": {
          background: darkMode ? "#2d2d2d" : "#f1f1f1",
        },
        "*::-webkit-scrollbar-thumb": {
          background: darkMode ? "#555" : "#ccc",
          borderRadius: "4px",
        },
        "*::-webkit-scrollbar-thumb:hover": {
          background: darkMode ? "#777" : "#aaa",
        },
        // Smooth transitions when switching between modes
        body: {
          transition: "background-color 0.3s ease, color 0.3s ease",
        },
        ".MuiPaper-root, .MuiCard-root, .MuiAppBar-root, .MuiDrawer-paper": {
          transition: "background-color 0.3s ease, box-shadow 0.3s ease",
        },
        // Navigation styling enhancements
        ".MuiListItemButton-root": {
          transition:
            "background-color 0.2s ease, color 0.2s ease, padding 0.2s ease",
        },
        ".MuiAppBar-root": {
          boxShadow: darkMode
            ? "0 1px 8px rgba(0,0,0,0.4)"
            : "0 1px 8px rgba(0,0,0,0.1)",
        },
        ".MuiToolbar-root": {
          transition: "min-height 0.3s ease",
        },
        ".MuiAvatar-root": {
          transition: "background-color 0.3s ease",
        },
      }}
    />
  );
};

export default ThemeModeInjector;
