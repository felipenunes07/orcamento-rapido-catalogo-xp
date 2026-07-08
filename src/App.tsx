import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { ThemeProvider } from '@/components/theme-provider'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom'
import { CartProvider } from './context/CartContext'
import { fetchBateriaProducts } from './services/sheetService'

// Pages
import HomePage from './pages/HomePage'
import CatalogPage from './pages/CatalogPage'
import QuoteSummaryPage from './pages/QuoteSummaryPage'
import ThankYouPage from './pages/ThankYouPage'
import NotFound from './pages/NotFound'

const queryClient = new QueryClient()

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Fluxo de Telas e Doc de Carga (carrinho próprio) */}
            <Route
              element={
                // key força o React a remontar o provider ao trocar de fluxo,
                // evitando que o carrinho de um catálogo vaze para o outro
                <CartProvider key="cart" storageKey="cart">
                  <Outlet />
                </CartProvider>
              }
            >
              <Route path="/" element={<HomePage />} />
              <Route path="/catalogo" element={<CatalogPage />} />
              <Route path="/resumo" element={<QuoteSummaryPage />} />
              <Route path="/obrigado" element={<ThankYouPage />} />
            </Route>

            {/* Fluxo de Baterias (carrinho separado, mesmo banco de dados) */}
            <Route
              element={
                <CartProvider key="cart-baterias" storageKey="cart-baterias">
                  <Outlet />
                </CartProvider>
              }
            >
              <Route
                path="/baterias"
                element={
                  <CatalogPage
                    fetchProductsFn={fetchBateriaProducts}
                    checkoutPath="/baterias/resumo"
                    pageTitle="Tabela de Baterias"
                    catalogType="baterias"
                  />
                }
              />
              <Route
                path="/baterias/resumo"
                element={
                  <QuoteSummaryPage
                    fetchProductsFn={fetchBateriaProducts}
                    catalogPath="/baterias"
                    thankYouPath="/baterias/obrigado"
                  />
                }
              />
              <Route
                path="/baterias/obrigado"
                element={<ThankYouPage catalogPath="/baterias" />}
              />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
)

export default App
