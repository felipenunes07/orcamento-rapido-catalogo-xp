
import { CartItem } from '../../types'
import { formatCurrency } from '../formatters'

// Função para gerar conteúdo HTML para o PDF
export const generatePdfContent = (items: CartItem[]): string => {
  // This is a simple HTML template that browsers can render as PDF
  const subtotal = items.reduce(
    (sum, item) => sum + item.product.valor * item.quantity,
    0
  )
  const currentDate = new Date().toLocaleDateString('pt-BR')

  let content = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Orçamento - Catálogo Orçamento Fácil</title>
      <style>
        body { font-family: sans-serif; margin: 20px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
        .header { margin-bottom: 20px; }
        .footer { margin-top: 30px; }
        .total { font-weight: bold; text-align: right; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Orçamento - Catálogo Orçamento Fácil</h1>
        <p>Data: ${currentDate}</p>
      </div>

      <table>
        <thead>
          <tr>
            <th>Produto</th>
            <th>Cor</th>
            <th>Qualidade</th>
            <th>Valor Unitário</th>
            <th>Quantidade</th>
            <th>Subtotal</th>
          </tr>
        </thead>
        <tbody>
  `

  items.forEach((item) => {
    content += `
      <tr>
        <td>${item.product.modelo}</td>
        <td>${item.product.cor}</td>
        <td>${item.product.qualidade}</td>
        <td>${formatCurrency(item.product.valor)}</td>
        <td>${item.quantity}</td>
        <td>${formatCurrency(item.product.valor * item.quantity)}</td>
      </tr>
    `
  })

  content += `
        </tbody>
      </table>

      <div class="total">
        <p>Total: ${formatCurrency(subtotal)}</p>
      </div>

      <div class="footer">
        <p>Obrigado pela preferência!</p>
      </div>
    </body>
    </html>
  `

  return content
}
