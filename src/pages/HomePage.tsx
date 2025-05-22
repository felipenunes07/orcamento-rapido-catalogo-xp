import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Layout from '../components/layout/Layout';
const HomePage: React.FC = () => {
  return <Layout>
      <div className="container-custom py-8">
        <div className="max-w-3xl mx-auto">
          <section className="mb-12 text-center">
            <h1 className="text-3xl sm:text-4xl font-bold mb-4">
              Catálogo Orçamento Fácil
            </h1>
            <p className="text-lg mb-8 text-muted-foreground">Crie orçamentos rápidos e simples</p>
            
            <Button asChild size="lg" className="btn-accent">
              <Link to="/catalogo">
                Ver Catálogo
              </Link>
            </Button>
          </section>
          
          <section className="bg-muted p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Como funciona:</h2>
            
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-md shadow-sm">
                <h3 className="font-semibold mb-2 flex items-center">
                  <span className="bg-accent text-white rounded-full w-6 h-6 inline-flex items-center justify-center mr-2">1</span>
                  Navegue pelo catálogo
                </h3>
                <p className="text-muted-foreground text-sm">
                  Explore todos os produtos disponíveis com seus preços atualizados.
                </p>
              </div>
              
              <div className="bg-white p-4 rounded-md shadow-sm">
                <h3 className="font-semibold mb-2 flex items-center">
                  <span className="bg-accent text-white rounded-full w-6 h-6 inline-flex items-center justify-center mr-2">2</span>
                  Selecione as quantidades
                </h3>
                <p className="text-muted-foreground text-sm">
                  Adicione os produtos desejados e defina a quantidade de cada item.
                </p>
              </div>
              
              <div className="bg-white p-4 rounded-md shadow-sm">
                <h3 className="font-semibold mb-2 flex items-center">
                  <span className="bg-accent text-white rounded-full w-6 h-6 inline-flex items-center justify-center mr-2">3</span>
                  Finalize o orçamento
                </h3>
                <p className="text-muted-foreground text-sm">
                  Revise o orçamento, baixe como PDF ou compartilhe via WhatsApp.
                </p>
              </div>
            </div>
          </section>
          
          <div className="mt-8 text-center">
            <Button asChild size="lg" className="btn-accent">
              <Link to="/catalogo">
                Começar Agora
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </Layout>;
};
export default HomePage;