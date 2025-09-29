import { useTheme } from "@/hooks/useTheme";
import { Sun, Moon } from "lucide-react";

export const ThemeToggle = () => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        toggleTheme();
      }}
      className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
    >
      {isDarkMode ? <Sun className="w-6 h-6 text-yellow-400" /> : <Moon className="w-6 h-6 text-gray-800" />}
    </button>
  );
};
