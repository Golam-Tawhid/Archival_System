import { createTheme } from "@mui/material/styles";

// Common palette values
const primaryColor = {
  light: "#5e35b1", // rich purple
  dark: "#7c4dff", // brighter purple for dark mode
};

const secondaryColor = {
  light: "#ff6e40", // vibrant orange
  dark: "#ff9e80", // softer orange for dark mode
};

// Theme factory function that creates a theme based on mode
export const createAppTheme = (mode) =>
  createTheme({
    palette: {
      mode,
      primary: {
        main: mode === "dark" ? primaryColor.dark : primaryColor.light,
        ...(mode === "dark" && {
          light: "#9575cd",
        }),
      },
      secondary: {
        main: mode === "dark" ? secondaryColor.dark : secondaryColor.light,
      },
      background: {
        default: mode === "dark" ? "#121212" : "#f5f5f5",
        paper: mode === "dark" ? "#1e1e1e" : "#ffffff",
      },
    },
    components: {
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: mode === "dark" ? "#1a1a2e" : primaryColor.light,
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundColor: mode === "dark" ? "#1a1a2e" : "#ffffff",
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            boxShadow:
              mode === "dark"
                ? "0 4px 8px rgba(0,0,0,0.4)"
                : "0 2px 4px rgba(0,0,0,0.1)",
            transition: "transform 0.3s ease, box-shadow 0.3s ease",
            "&:hover": {
              transform: "translateY(-2px)",
              boxShadow:
                mode === "dark"
                  ? "0 6px 12px rgba(0,0,0,0.6)"
                  : "0 4px 8px rgba(0,0,0,0.2)",
            },
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: "8px",
            textTransform: "none",
            fontWeight: 500,
            boxShadow: "none",
            "&:hover": {
              boxShadow:
                mode === "dark"
                  ? "0 2px 8px rgba(124, 77, 255, 0.6)"
                  : "0 2px 8px rgba(94, 53, 177, 0.3)",
            },
          },
          containedPrimary: {
            background:
              mode === "dark"
                ? "linear-gradient(45deg, #7c4dff 30%, #9575cd 90%)"
                : "linear-gradient(45deg, #5e35b1 30%, #7c4dff 90%)",
          },
        },
      },
    },
    typography: {
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
      h1: {
        fontWeight: 700,
      },
      h4: {
        fontWeight: 600,
      },
      button: {
        fontWeight: 500,
      },
    },
    shape: {
      borderRadius: 8,
    },
  });

// Default export for backward compatibility
export default createAppTheme("light");
