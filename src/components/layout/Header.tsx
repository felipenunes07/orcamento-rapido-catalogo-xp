import React from 'react'
import { Link, useLocation } from 'react-router-dom'

const Header: React.FC = () => {
  const location = useLocation()

  return (
    <header className="bg-white shadow-sm py-4 md:sticky md:top-0 md:z-10">
      <div className="container-custom">
        <div className="flex justify-between items-center">
          <Link to="/" className="flex items-center gap-3">
            <img
              src="/icon-192x192.png"
              alt="XP Logo"
              className="w-10 h-10 rounded-lg shadow-sm"
            />
            <span className="font-medium text-lg">
              <span className="bg-gradient-to-r from-gray-900 via-blue-700 to-blue-600 bg-clip-text text-transparent">
                Catálogo XP Orçamento
              </span>
            </span>
          </Link>
          
          <div className="flex items-center gap-3">
            {location.pathname !== '/' && (
              <Link to="/" className="text-sm text-accent font-medium">
                Voltar
              </Link>
            )}
            
            {/* Botão Instagram - apenas na página inicial */}
            {location.pathname === '/' && (
              <a
                href="https://www.instagram.com/expor_telas/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center px-3 py-2 sm:px-4 sm:py-2 rounded-lg bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 hover:from-purple-600 hover:via-pink-600 hover:to-orange-500 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
                aria-label="Instagram"
              >
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5 mr-1"
                  fill="white"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M7.75 2h8.5A5.75 5.75 0 0 1 22 7.75v8.5A5.75 5.75 0 0 1 16.25 22h-8.5A5.75 5.75 0 0 1 2 16.25v-8.5A5.75 5.75 0 0 1 7.75 2zm0 1.5A4.25 4.25 0 0 0 3.5 7.75v8.5A4.25 4.25 0 0 0 7.75 20.5h8.5A4.25 4.25 0 0 0 20.5 16.25v-8.5A4.25 4.25 0 0 0 16.25 3.5h-8.5zm4.25 3.25a5.25 5.25 0 1 1 0 10.5a5.25 5.25 0 0 1 0-10.5zm0 1.5a3.75 3.75 0 1 0 0 7.5a3.75 3.75 0 0 0 0-7.5zm5.13.88a1.13 1.13 0 1 1-2.26 0a1.13 1.13 0 0 1 2.26 0z" />
                </svg>
                <span className="text-white text-xs sm:text-sm font-medium">Instagram</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
