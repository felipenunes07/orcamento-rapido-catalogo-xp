
import React from 'react'
import { Document, Page, Text, View } from '@react-pdf/renderer'
import { CartItem } from '../../types'
import { formatCurrency } from '../formatters'
import { styles } from './styles'

// Componente para renderizar o documento PDF do orçamento
const PdfOrcamento = ({ items, quoteNumber }: { items: CartItem[], quoteNumber: number }) => {
  const subtotal = items.reduce((sum, item) => {
    const unitPrice = item.product.promocao && item.product.promocao > 0
      ? Math.min(item.product.valor, item.product.promocao)
      : item.product.valor
    return sum + unitPrice * item.quantity
  }, 0)
  const currentDate = new Date().toLocaleDateString('pt-BR')
  
  return (
    <Document>
      <Page size="A4" style={styles.body}>
        <Text style={styles.header}>Orçamento #{quoteNumber} - Catálogo Orçamento Fácil</Text>
        <Text style={styles.date}>Data: {currentDate}</Text>
        <View style={styles.tableContainer}>
          <View style={styles.tableRow}>
            <Text style={styles.tableHeader}>Produto</Text>
            <Text style={styles.tableHeader}>Cor</Text>
            <Text style={styles.tableHeader}>Qualidade</Text>
            <Text style={styles.tableHeader}>Valor Unitário</Text>
            <Text style={styles.tableHeader}>Quantidade</Text>
            <Text style={styles.tableHeader}>Subtotal</Text>
          </View>
          {items.map((item, idx) => (
            <View style={styles.tableRow} key={idx}>
              <Text style={styles.tableCell}>{item.product.modelo}</Text>
              <Text style={styles.tableCell}>{item.product.cor}</Text>
              <Text style={styles.tableCell}>{item.product.qualidade}</Text>
              <Text style={styles.tableCell}>
                {formatCurrency(
                  item.product.promocao && item.product.promocao > 0
                    ? Math.min(item.product.valor, item.product.promocao)
                    : item.product.valor
                )}
              </Text>
              <Text style={styles.tableCell}>{item.quantity}</Text>
              <Text style={styles.tableCell}>
                {formatCurrency(
                  ((item.product.promocao && item.product.promocao > 0
                    ? Math.min(item.product.valor, item.product.promocao)
                    : item.product.valor) * item.quantity)
                )}
              </Text>
            </View>
          ))}
        </View>
        <Text style={styles.total}>Total: {formatCurrency(subtotal)}</Text>
        <Text style={styles.footer}>Obrigado pela preferência!</Text>
      </Page>
    </Document>
  )
}

export default PdfOrcamento
