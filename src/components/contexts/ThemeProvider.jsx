import { useContext, createContext, useEffect, useState } from "react";
import { MdDarkMode, MdLightMode } from "react-icons/md";

const ThemeContext = createContext();

export default function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem("theme") || "light";
    } catch {
      return "light";
    }
  });

  useEffect(() => {
    document.body.className = theme;
    localStorage.setItem("theme", theme);
  }, [theme]);
  return (
    <>
      <ThemeContext value={{ theme, setTheme }}>
        <div>{children}</div>
      </ThemeContext>
    </>
  );
}

export const ThemeToggle = () => {
  const { theme, setTheme } = useContext(ThemeContext);

  return (
    <>
      <span
        className="themeIcon mx-3"
        onClick={() => {
          setTheme((theme) => (theme === "light" ? "dark" : "light"));
        }}
      >
        {theme === "light" ? <MdDarkMode /> : <MdLightMode />}
      </span>
    </>
  );
};
