import React from 'react'
import { CartItem } from '../../types'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { formatCurrency } from '../../utils/formatters'

interface QuoteSummaryProps {
  items: CartItem[]
}

const QuoteSummary: React.FC<QuoteSummaryProps> = ({ items }) => {
  const stripQualityFromModel = (modelo: string, qualidade?: string) => {
    if (!modelo) return ''
    let name = modelo.trim()

    // Conjuntos de termos de qualidade que costumam vir no final do modelo
    const qualityTokens = [
      'PREMIER/SELECT MAX',
      'PREMIER MAX',
      'SELECT MAX',
      'PREMIER',
      'SELECT',
      'ORI',
      'ORIGINAL',
      'LCD',
      'MAX',
    ]

    // Remove tokens de qualidade apenas quando aparecem no final do modelo
    for (const token of qualityTokens) {
      const escaped = token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      const re = new RegExp(`(?:\n|\s|\s-)?${escaped}$`, 'i')
      if (re.test(name)) {
        name = name.replace(re, '').trim()
      }
    }

    return name
  }
  const subtotal = items.reduce((sum, item) => {
    const unitPrice = item.product.promocao && item.product.promocao > 0
      ? Math.min(item.product.valor, item.product.promocao)
      : item.product.valor
    return sum + unitPrice * item.quantity
  }, 0)

  return (
    <div className="bg-background rounded-lg p-4 shadow-sm">
      <h2 className="text-xl font-bold mb-4">Resumo do Orçamento</h2>

      {/* Mobile: tabela compacta, sem scroll horizontal */}
      <div className="md:hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[55%] px-2 py-2 text-xs">
                Produto
              </TableHead>
              <TableHead className="text-right px-2 py-2 text-xs">
                Qtd
              </TableHead>
              <TableHead className="text-right px-2 py-2 text-xs">
                Valor
              </TableHead>
              <TableHead className="text-right px-2 py-2 text-xs">
                Subtotal
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.product.id}>
                <TableCell className="px-2 py-2 align-top">
                  <div className="text-sm font-medium leading-snug break-words">
                    {stripQualityFromModel(
                      item.product.modelo,
                      item.product.qualidade
                    )}
                  </div>
                  <div className="text-[11px] text-muted-foreground mt-1 leading-tight">
                    <span>Cor: {item.product.cor || '-'}</span>
                    {' · '}
                    <span>{item.product.qualidade || '-'}</span>
                  </div>
                </TableCell>
                <TableCell className="text-right px-2 py-2 text-sm">
                  {item.quantity}
                </TableCell>
                <TableCell className="text-right px-2 py-2 text-sm">
                  {formatCurrency(
                    item.product.promocao && item.product.promocao > 0
                      ? Math.min(item.product.valor, item.product.promocao)
                      : item.product.valor
                  )}
                </TableCell>
                <TableCell className="text-right px-2 py-2 text-sm font-semibold">
                  {formatCurrency(
                    ((item.product.promocao && item.product.promocao > 0
                      ? Math.min(item.product.valor, item.product.promocao)
                      : item.product.valor) * item.quantity)
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Desktop: tabela completa */}
      <div className="overflow-x-auto hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[220px]">Produto</TableHead>
              <TableHead className="w-[150px]">Cor</TableHead>
              <TableHead>Qualidade</TableHead>
              <TableHead className="text-right">Qtd</TableHead>
              <TableHead className="text-right">Valor</TableHead>
              <TableHead className="text-right">Subtotal</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.product.id}>
                <TableCell className="font-medium break-words">
                  {stripQualityFromModel(
                    item.product.modelo,
                    item.product.qualidade
                  )}
                </TableCell>
                <TableCell>{item.product.cor}</TableCell>
                <TableCell>{item.product.qualidade}</TableCell>
                <TableCell className="text-right">{item.quantity}</TableCell>
                <TableCell className="text-right">
                  {formatCurrency(
                    item.product.promocao && item.product.promocao > 0
                      ? Math.min(item.product.valor, item.product.promocao)
                      : item.product.valor
                  )}
                </TableCell>
                <TableCell className="text-right font-semibold">
                  {formatCurrency(
                    ((item.product.promocao && item.product.promocao > 0
                      ? Math.min(item.product.valor, item.product.promocao)
                      : item.product.valor) * item.quantity)
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="mt-4 text-right">
        <div className="text-lg font-bold">
          Total: {formatCurrency(subtotal)}
        </div>
      </div>
    </div>
  )
}

export default QuoteSummary
