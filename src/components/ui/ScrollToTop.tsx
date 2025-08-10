import React, { useState, useEffect } from 'react'
import { ChevronUp } from 'lucide-react'
import { Button } from './button'

const ScrollToTop: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false)

  // Mostrar/esconder o botão baseado na posição do scroll
  useEffect(() => {
    const toggleVisibility = () => {
      const scrollHeight = document.documentElement.scrollHeight
      const clientHeight = document.documentElement.clientHeight
      const scrollTop = window.pageYOffset

      // Aparecer apenas quando estiver nos últimos 70% da página
      const threshold = (scrollHeight - clientHeight) * 0.3

      if (scrollTop > threshold && scrollTop > 800) {
        setIsVisible(true)
      } else {
        setIsVisible(false)
      }
    }

    window.addEventListener('scroll', toggleVisibility)

    return () => {
      window.removeEventListener('scroll', toggleVisibility)
    }
  }, [])

  // Função para rolar suavemente ao topo
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  if (!isVisible) {
    return null
  }

  return (
    <Button
      onClick={scrollToTop}
      className="fixed bottom-20 right-4 z-50 rounded-full w-10 h-10 p-0 shadow-md hover:shadow-lg transition-all duration-300 bg-gray-600/80 hover:bg-gray-700/90 backdrop-blur-sm opacity-70 hover:opacity-100"
      size="sm"
      aria-label="Voltar ao topo"
    >
      <ChevronUp className="h-4 w-4" />
    </Button>
  )
}

export default ScrollToTop
