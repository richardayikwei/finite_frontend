import { useEffect, useState } from "react"

export function useDarkMode() {
  // 1. Detect saved preference OR system preference
  const [dark, setDark] = useState(() => {
    const saved = localStorage.getItem("theme")
    if (saved) return saved === "dark"

    return window.matchMedia("(prefers-color-scheme: dark)").matches
  })

  // 2. Apply/remove dark class on <html>
  useEffect(() => {
    const root = document.documentElement

    if (dark) {
      root.classList.add("dark")
      localStorage.setItem("theme", "dark")
    } else {
      root.classList.remove("dark")
      localStorage.setItem("theme", "light")
    }
  }, [dark])

  return { dark, setDark }
}