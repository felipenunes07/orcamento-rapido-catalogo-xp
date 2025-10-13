import React from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { CartItem } from '../../types'
import { formatCurrency } from '../../utils/formatters'
import { useIsMobile } from '../../hooks/use-mobile'
import { X, ChevronUp, ChevronDown } from 'lucide-react'

interface QuoteCartProps {
  cartItems: CartItem[]
  onClearCart: () => void
}

const QuoteCart: React.FC<QuoteCartProps> = ({ cartItems, onClearCart }) => {
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0)
  const totalValue = cartItems.reduce((sum, item) => {
    const unitPrice = item.product.promocao && item.product.promocao > 0
      ? Math.min(item.product.valor, item.product.promocao)
      : item.product.valor
    return sum + unitPrice * item.quantity
  }, 0)
  const hasItems = cartItems.length > 0 && totalItems > 0
  const isMobile = useIsMobile()
  const [isMinimized, setIsMinimized] = React.useState(true)

  // Visível apenas em dispositivos móveis
  const toggleMinimized = () => {
    setIsMinimized(!isMinimized)
  }

  return (
    <div
      className={`bg-background rounded-t-lg md:rounded-lg shadow-lg fixed md:sticky bottom-0 md:bottom-4 left-0 right-0 mt-6 border z-50 max-w-screen-xl mx-auto transition-all duration-300 dark:border-gray-700 ${
        isMinimized && isMobile ? 'pb-1.5 pt-2' : 'p-4 sm:p-6'
      }`}
    >
      {/* Cabeçalho com botão para minimizar em dispositivos móveis */}
      <div
        className={`flex items-start justify-between ${
          isMinimized && isMobile ? 'px-4' : ''
        } ${isMobile ? 'cursor-pointer' : ''}`}
        onClick={isMobile ? toggleMinimized : undefined}
      >
        {/* Lado esquerdo: informações sobre o orçamento */}
        <div className="flex items-start flex-1">
          <div className="flex-1">
            <p
              className={`${
                isMinimized && isMobile ? 'text-sm' : 'text-xl'
              } font-bold leading-tight dark:text-gray-100`}
            >
              Total do Orçamento
            </p>
            <p
              className={`text-xs text-muted-foreground ${
                isMinimized && isMobile ? 'text-[10px]' : 'text-sm'
              } leading-tight mt-0.5 dark:text-gray-400`}
            >
              {totalItems} item(ns)
            </p>
          </div>
        </div>

        {/* Lado direito em dispositivos não móveis: valor e botões */}
        {!isMobile ? (
          <div className="flex items-center gap-4">
            <span className="text-3xl font-bold text-accent dark:text-blue-400">
              {formatCurrency(totalValue)}
            </span>

            <div className="flex gap-3">
              {hasItems && (
                <Button
                  variant="outline"
                  size="lg"
                  onClick={onClearCart}
                  className="whitespace-nowrap dark:border-gray-600 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-100"
                >
                  Limpar Orçamento
                </Button>
              )}

              <Button
                size="lg"
                className="whitespace-nowrap"
                disabled={!hasItems}
                asChild
              >
                <Link to={hasItems ? '/resumo' : '#'}>Finalizar Orçamento</Link>
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2">
              <div
                className={`${
                  isMinimized ? 'text-lg' : 'text-3xl'
                } font-bold text-accent md:mb-0 mb-0 md:text-right dark:text-blue-400`}
              >
                {formatCurrency(totalValue)}
              </div>

              <div className="md:hidden flex items-center justify-center w-8 h-8 -mr-1 dark:text-gray-300">
                {isMinimized ? (
                  <ChevronUp className="h-5 w-5" />
                ) : (
                  <ChevronDown className="h-5 w-5" />
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Corpo do carrinho (botões) que pode ser minimizado em dispositivos móveis */}
      {(!isMinimized || !isMobile) && isMobile && (
        <div className="flex flex-col gap-3 mt-4 px-4">
          {hasItems && (
            <Button
              variant="outline"
              size="lg"
              onClick={onClearCart}
              className="w-full py-5 dark:border-gray-600 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-100"
            >
              Limpar Orçamento
            </Button>
          )}

          <Button
            size="lg"
            className="w-full py-5"
            disabled={!hasItems}
            asChild
          >
            <Link to={hasItems ? '/resumo' : '#'}>Finalizar Orçamento</Link>
          </Button>
        </div>
      )}
    </div>
  )
}

export default QuoteCart
