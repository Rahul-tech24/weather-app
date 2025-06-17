import { useState,useEffect } from 'react'
import Weather from './components/weather/Weather';
import ThemeToggle from './components/ThemeToggle/ThemeToggle';
import './App.css'

function App() {
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem("theme");
    const systemPrefersDark = window?.matchMedia?.("(prefers-color-scheme: dark)")?.matches;
    return savedTheme ? savedTheme : (systemPrefersDark.matches ? "light" : "dark");
});
useEffect(() => {
  document.body.classList.remove("dark", "light");
  document.body.classList.add(theme);
    localStorage.setItem("theme", theme);
}, [theme]);



  return (
    <>
      <ThemeToggle  theme={theme} setTheme={setTheme} />
      <Weather  theme={theme} />
      
    </>
  )
}

export default App;