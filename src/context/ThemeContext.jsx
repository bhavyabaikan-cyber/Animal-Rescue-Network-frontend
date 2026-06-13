import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem("theme");
    console.log("Initial theme from storage:", savedTheme);
    return savedTheme || "light";
  });

  useEffect(() => {
    const root = window.document.documentElement;
    console.log("Applying theme:", theme);
    
    if (theme === "dark") {
      root.classList.add("dark");
      console.log("Added 'dark' class to <html>");
    } else {
      root.classList.remove("dark");
      console.log("Removed 'dark' class from <html>");
    }
    
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    console.log("Toggle button clicked!");
    setTheme((prev) => {
      const newTheme = prev === "light" ? "dark" : "light";
      console.log("New theme state:", newTheme);
      return newTheme;
    });
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
    }
  return context;
};