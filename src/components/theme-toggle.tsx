import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { useEffect } from "react"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  // Adicionar log para verificar se o tema está sendo aplicado
  useEffect(() => {
    console.log("Tema atual:", theme)
  }, [theme])

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => {
        const newTheme = theme === "dark" ? "light" : "dark"
        console.log("Mudando tema para:", newTheme)
        setTheme(newTheme)
      }}
      aria-label="Toggle theme"
    >
      <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
    </Button>
  )
}