import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider as MuiThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import App from "./App";
import store from "./store";
import { ThemeProvider } from "./contexts/ThemeContext";
import { createAppTheme } from "./theme";
import { useTheme } from "./contexts/ThemeContext";

// Theme wrapper component that uses the context
const ThemedApp = () => {
  const { darkMode } = useTheme();
  const theme = createAppTheme(darkMode ? "dark" : "light");

  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </MuiThemeProvider>
  );
};

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <ThemeProvider>
          <ThemedApp />
        </ThemeProvider>
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);
