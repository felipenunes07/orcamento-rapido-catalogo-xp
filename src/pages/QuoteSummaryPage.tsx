import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Layout from '../components/layout/Layout'
import QuoteSummary from '../components/quote/QuoteSummary'
import { useCart } from '../context/CartContext'
import { Button } from '@/components/ui/button'
import { shareCompleteQuote } from '../utils/pdf/exportFunctions'
import { getNextQuoteNumber } from '../services/quoteService'
import { fetchProducts } from '../services/sheetService'
import { Product } from '../types'

const QuoteSummaryPage: React.FC = () => {
  const { cartItems } = useCart()
  const navigate = useNavigate()
  const [nextQuoteNumber, setNextQuoteNumber] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [originalProducts, setOriginalProducts] = useState<Product[]>([])
  const [appliedCode, setAppliedCode] = useState<string>('')

  // Load next quote number from Supabase
  useEffect(() => {
    const loadNextQuoteNumber = async () => {
      try {
        const number = await getNextQuoteNumber()
        setNextQuoteNumber(number)
      } catch (error) {
        console.error('Error fetching next quote number:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadNextQuoteNumber()
  }, [])

  // Carregar produtos originais para calcular desconto
  useEffect(() => {
    const loadOriginalProducts = async () => {
      try {
        const products = await fetchProducts()
        setOriginalProducts(products)

        // Verificar se há código aplicado no localStorage
        const savedCode = localStorage.getItem('appliedCode')
        if (savedCode) {
          setAppliedCode(savedCode)
        }
      } catch (error) {
        console.error('Error loading original products:', error)
      }
    }

    loadOriginalProducts()
  }, [])

  // Redirect to catalog if cart is empty
  useEffect(() => {
    if (cartItems.length === 0) {
      navigate('/catalogo')
    }
  }, [cartItems, navigate])

  const handleShareWhatsApp = async () => {
    try {
      await shareCompleteQuote(cartItems)
      navigate('/obrigado')
    } catch (error) {
      console.error('Erro ao compartilhar orçamento:', error)
    }
  }

  // Calcular total original (sem desconto)
  const calculateOriginalTotal = () => {
    if (originalProducts.length === 0) return 0

    return cartItems.reduce((sum, item) => {
      // Encontrar o produto original
      const originalProduct = originalProducts.find(
        (p) => p.id === item.product.id
      )
      if (!originalProduct) return sum

      // Usar o preço original (sem desconto aplicado)
      const unitPrice =
        originalProduct.promocao && originalProduct.promocao > 0
          ? Math.min(originalProduct.valor, originalProduct.promocao)
          : originalProduct.valor

      return sum + unitPrice * item.quantity
    }, 0)
  }

  if (cartItems.length === 0) {
    return null // Will redirect via useEffect
  }

  if (isLoading) {
    return (
      <Layout>
        <div className="container-custom py-8 text-center">
          <p>Carregando...</p>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="container-custom py-8 bg-background">
        <div className="mb-6 flex items-center justify-between gap-3">
          <Link to="/catalogo" className="text-accent hover:underline">
            ← Voltar ao catálogo
          </Link>

          {/* Botão WhatsApp no topo para facilitar em orçamentos longos */}
          <Button
            onClick={handleShareWhatsApp}
            size="sm"
            className="btn-accent h-8 px-3 text-xs md:h-9 md:px-4 md:text-sm rounded-md"
          >
            Enviar via WhatsApp
          </Button>
        </div>

        <div className="mb-6">
          <h1 className="text-2xl font-bold">Orçamento #{nextQuoteNumber}</h1>
          <p className="text-muted-foreground">
            Data: {new Date().toLocaleDateString('pt-BR')}
          </p>
        </div>

        <QuoteSummary
          items={cartItems}
          appliedCode={appliedCode}
          originalTotal={calculateOriginalTotal()}
        />

        <div className="mt-8 flex justify-center">
          <Button onClick={handleShareWhatsApp} className="btn-accent">
            Enviar via WhatsApp
          </Button>
        </div>
      </div>
    </Layout>
  )
}

export default QuoteSummaryPage
