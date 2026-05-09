import * as SecureStore from "expo-secure-store";
import { createContext, useContext, useEffect, useState } from "react";

type ThemeContextType = {
  isDark: boolean;
  toggleDark: () => void;
  colors: typeof lightColors;
};

const lightColors = {
  primary: "#6B4EFF",
  success: "#10B981",
  warning: "#F59E0B",
  danger: "#EF4444",
  background: "#f8f8f8",
  card: "#ffffff",
  border: "#eeeeee",
  text: "#1a1a1a",
  textSecondary: "#555555",
  textMuted: "#888888",
  hero: "#6B4EFF",
  tabBar: "#ffffff",
  input: "#f3f3f3",
};

const darkColors = {
  primary: "#8B6FFF",
  success: "#10B981",
  warning: "#F59E0B",
  danger: "#EF4444",
  background: "#0F0F0F",
  card: "#1C1C1E",
  border: "#2C2C2E",
  text: "#FFFFFF",
  textSecondary: "#ABABAB",
  textMuted: "#6B6B6B",
  hero: "#1C1C1E",
  tabBar: "#1C1C1E",
  input: "#2C2C2E",
};

const ThemeContext = createContext<ThemeContextType>({
  isDark: false,
  toggleDark: () => {},
  colors: lightColors,
});

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    SecureStore.getItemAsync("darkMode").then((val) => {
      if (val === "true") setIsDark(true);
    });
  }, []);

  const toggleDark = async () => {
    const next = !isDark;
    setIsDark(next);
    await SecureStore.setItemAsync("darkMode", String(next));
  };

  return (
    <ThemeContext.Provider
      value={{ isDark, toggleDark, colors: isDark ? darkColors : lightColors }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
