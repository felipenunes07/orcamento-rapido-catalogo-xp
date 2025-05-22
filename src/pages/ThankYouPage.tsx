import React from 'react'
import { Link } from 'react-router-dom'
import Layout from '../components/layout/Layout'
import { Button } from '@/components/ui/button'
import { CheckCircle } from 'lucide-react'

const ThankYouPage: React.FC = () => {
  return (
    <Layout>
      <div className="container-custom py-16">
        <div className="max-w-md mx-auto text-center">
          <div className="flex justify-center mb-6">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>

          <h1 className="text-2xl font-bold mb-4">Orçamento Finalizado!</h1>

          <p className="mb-8 text-muted-foreground">
            Seu orçamento foi gerado com sucesso. Agradecemos pela preferência!
          </p>

          <div className="space-y-4">
            <Button asChild className="w-full btn-accent">
              <Link to="/catalogo">Criar Novo Orçamento</Link>
            </Button>

            <Button asChild variant="outline" className="w-full">
              <Link to="/">Voltar à Página Inicial</Link>
            </Button>
          </div>

          <div className="mt-12 p-4 bg-muted rounded-lg">
            <h2 className="font-semibold mb-2">Precisa de ajuda?</h2>
            <p className="text-sm text-muted-foreground">
              Entre em contato conosco pelo WhatsApp: (11) 91127-9702
            </p>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default ThankYouPage
