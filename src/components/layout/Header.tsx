import React from 'react'
import { Link, useLocation } from 'react-router-dom'

const Header: React.FC = () => {
  const location = useLocation()

  return (
    <header className="bg-white shadow-sm py-4 sticky top-0 z-10">
      <div className="container-custom">
        <div className="flex justify-between items-center">
          <Link to="/" className="font-bold text-lg text-primary">
            Catálogo XP Orçamento
          </Link>
          {location.pathname !== '/' && (
            <Link to="/" className="text-sm text-accent font-medium">
              Voltar
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header
