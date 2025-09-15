import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { ThemeProvider } from '@/components/theme-provider'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { CartProvider } from './context/CartContext'
import { useTheme } from 'next-themes'
import { useEffect } from 'react'

// Pages
import HomePage from './pages/HomePage'
import CatalogPage from './pages/CatalogPage'
import QuoteSummaryPage from './pages/QuoteSummaryPage'
import ThankYouPage from './pages/ThankYouPage'
import NotFound from './pages/NotFound'

const queryClient = new QueryClient()

const AppWithTheme = () => {
  const { theme } = useTheme()
  
  useEffect(() => {
    console.log("Tema no App:", theme)
  }, [theme])
  
  return (
    <CartProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/catalogo" element={<CatalogPage />} />
            <Route path="/resumo" element={<QuoteSummaryPage />} />
            <Route path="/obrigado" element={<ThankYouPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </CartProvider>
  )
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AppWithTheme />
    </ThemeProvider>
  </QueryClientProvider>
)

export default App
