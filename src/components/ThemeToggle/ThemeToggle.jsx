
import Styles from "./ThemeToggle.module.css"

function ThemeToggle({ theme, setTheme }) {


    return (
        <>
           {
  theme === "dark" ? (
    <button
      className={`${Styles.themeToggle} ${Styles.dark}`}
      onClick={() => setTheme("light")}
    >
      ☀ 
    </button>
  ) : (
    <button
      className={`${Styles.themeToggle} ${Styles.light}`}
      onClick={() => setTheme("dark")}
    >
      🌙 
    </button>
  )
}
        </>
    )
       
}
export default ThemeToggle;
