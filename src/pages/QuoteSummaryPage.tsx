
import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Layout from '../components/layout/Layout'
import QuoteSummary from '../components/quote/QuoteSummary'
import { useCart } from '../context/CartContext'
import { Button } from '@/components/ui/button'
import { shareCompleteQuote } from '../utils/pdf/exportFunctions'
import { getNextQuoteNumber } from '../services/quoteService'

const QuoteSummaryPage: React.FC = () => {
  const { cartItems } = useCart()
  const navigate = useNavigate()
  const [nextQuoteNumber, setNextQuoteNumber] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)

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
        <div className="mb-6">
          <Link to="/catalogo" className="text-accent hover:underline">
            ← Voltar ao catálogo
          </Link>
        </div>

        <div className="mb-6">
          <h1 className="text-2xl font-bold">Orçamento #{nextQuoteNumber}</h1>
          <p className="text-muted-foreground">
            Data: {new Date().toLocaleDateString('pt-BR')}
          </p>
        </div>

        <QuoteSummary items={cartItems} />

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
