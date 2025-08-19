import React from 'react'
import { Product, CartItem } from '../../types'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { formatCurrency } from '../../utils/formatters'
import { Plus, Minus } from 'lucide-react'

interface ProductGridProps {
  products: Product[]
  cartItems: CartItem[]
  onUpdateQuantity: (product: Product, quantity: number) => void
}

const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  cartItems,
  onUpdateQuantity,
}) => {
  const getCartItem = (productId: string): CartItem | undefined => {
    return cartItems.find((item) => item.product.id === productId)
  }

  const handleIncrement = (product: Product) => {
    const currentQuantity = getCartItem(product.id)?.quantity || 0
    onUpdateQuantity(product, currentQuantity + 1)
  }

  const handleDecrement = (product: Product) => {
    const currentQuantity = getCartItem(product.id)?.quantity || 0
    if (currentQuantity > 0) {
      onUpdateQuantity(product, currentQuantity - 1)
    }
  }

  return (
    <div>
      {/* Versão para Desktop */}
      <div className="hidden md:block overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">Modelo</TableHead>
              <TableHead className="w-[150px]">Cor</TableHead>
              <TableHead>Qualidade</TableHead>
              <TableHead className="text-right">Valor</TableHead>
              <TableHead className="text-center">Quantidade</TableHead>
              <TableHead className="text-right">Subtotal</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => {
              const cartItem = getCartItem(product.id)
              const quantity = cartItem?.quantity || 0
              const subtotal = product.valor * quantity

              return (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">
                    {product.modelo}
                  </TableCell>
                  <TableCell>{product.cor}</TableCell>
                  <TableCell>{product.qualidade}</TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(product.valor)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleDecrement(product)}
                        disabled={quantity <= 0}
                        className="h-8 w-8"
                      >
                        <Minus size={16} />
                      </Button>

                      <Input
                        type="number"
                        min="0"
                        value={quantity.toString()}
                        onChange={(e) => {
                          const newQuantity = parseInt(e.target.value) || 0
                          onUpdateQuantity(product, newQuantity)
                        }}
                        className="h-8 mx-2 text-center w-16"
                      />

                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleIncrement(product)}
                        className="h-8 w-8"
                      >
                        <Plus size={16} />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    {quantity > 0 ? formatCurrency(subtotal) : '-'}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      {/* Versão para Mobile - Layout em formato de linha */}
      <div className="md:hidden">
        {products.map((product) => {
          const cartItem = getCartItem(product.id)
          const quantity = cartItem?.quantity || 0
          const subtotal = product.valor * quantity
          const isDocDeCarga = product.modelo
            .toUpperCase()
            .includes('DOC DE CARGA')

          // Extrair o modelo sem o prefixo DOC DE CARGA e sem a cor para produtos DOC DE CARGA
          let displayModel = product.modelo
          if (isDocDeCarga) {
            // Remove o prefixo DOC DE CARGA
            displayModel = product.modelo.replace(
              /DOC DE CARGA\s*[\|\-]?\s*/i,
              ''
            )

            // Remove cores específicas do nome (PRETO, BRANCO, etc.)
            displayModel = displayModel
              .replace(
                /\s*(PRETO|BRANCO|AZUL|VERMELHO|VERDE|AMARELO|ROXO|ROSA|CINZA|DOURADO|PRATA)\b/i,
                ''
              )
              .replace(/\s*\([^)]*\)\s*$/i, '') // Remove qualquer texto entre parênteses no final
          }

          return (
            <div
              key={product.id}
              className="bg-white p-2.5 rounded-lg shadow-sm border mb-2.5 flex flex-row items-center"
            >
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-x-2">
                  <span className="font-semibold text-sm break-words">
                    {displayModel}
                  </span>
                </div>

                <div className="flex items-center gap-1 mt-1">
                  <span className="text-xs text-muted-foreground">
                    {product.cor} • {product.qualidade}
                  </span>
                  <span className="text-xs font-medium">
                    • {formatCurrency(product.valor)}
                  </span>
                </div>
              </div>

              <div className="flex items-center shrink-0 pl-2">
                {quantity > 0 && (
                  <div className="text-xs font-medium text-accent mr-2">
                    {formatCurrency(subtotal)}
                  </div>
                )}

                <div className="flex flex-col items-end">
                  {isDocDeCarga && (
                    <div className="mb-1">
                      <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                        DOC
                      </span>
                    </div>
                  )}
                  <div className="flex items-center">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleDecrement(product)}
                      disabled={quantity <= 0}
                      className="h-7 w-7"
                    >
                      <Minus size={14} />
                    </Button>

                    <Input
                      type="number"
                      min="0"
                      value={quantity.toString()}
                      onChange={(e) => {
                        const newQuantity = parseInt(e.target.value) || 0
                        onUpdateQuantity(product, newQuantity)
                      }}
                      className="h-7 mx-1 text-center w-10 px-1"
                    />

                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleIncrement(product)}
                      className="h-7 w-7"
                    >
                      <Plus size={14} />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default ProductGrid
