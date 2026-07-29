import { createContext, useEffect, useState } from "react";

export const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(
    localStorage.getItem("theme") || "light"
  );

  useEffect(() => {
  document.documentElement.classList.remove("light", "dark");
  document.documentElement.classList.add(theme);

  document.body.style.backgroundColor =
    theme === "light" ? "#ffffff" : "#000000";

  document.body.style.color =
    theme === "light" ? "#000000" : "#ffffff";

  localStorage.setItem("theme", theme);
}, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}