
import React from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import { Button } from '@/components/ui/button';

const NotFound: React.FC = () => {
  return (
    <Layout>
      <div className="container-custom py-16 bg-background">
        <div className="max-w-md mx-auto text-center">
          <h1 className="text-4xl font-bold mb-4">404</h1>
          <p className="text-xl text-muted-foreground mb-8">
            Oops! Página não encontrada
          </p>
          
          <Button asChild>
            <Link to="/">Voltar à Página Inicial</Link>
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default NotFound;
