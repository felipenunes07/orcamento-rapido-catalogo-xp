import { Product } from '../types'

// Spreadsheet ID from the provided URL
const SPREADSHEET_ID = '1qAuw2ebWPJmcy_gl4Qf48GfmnSGLZumDfs62fpG2BGA'
const SHEET_NAME = 'produtos'

// Using a public access approach instead of API key
export async function fetchProducts(): Promise<Product[]> {
  try {
    // Using the public export CSV approach which doesn't require API key
    const requestUrl = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:csv&sheet=${SHEET_NAME}`
    console.log('Buscando dados de:', requestUrl)

    const response = await fetch(requestUrl)

    if (!response.ok) {
      throw new Error(
        `Falha ao buscar dados da planilha: ${response.status} ${response.statusText}`
      )
    }

    const csvText = await response.text()
    console.log('CSV texto recebido:', csvText.substring(0, 200)) // Log primeiros 200 caracteres

    const products = parseCSV(csvText)

    console.log('Produtos carregados:', products.length)
    return products
  } catch (error) {
    console.error('Erro ao buscar produtos:', error)
    throw error
  }
}

// Parse CSV data into Product objects
function parseCSV(csvText: string): Product[] {
  const rows = csvText.split('\n').filter((row) => row.trim() !== '')

  if (rows.length <= 1) {
    console.warn('Nenhuma linha de dados encontrada na planilha')
    return []
  }

  // Parse header row (first row)
  const headers = parseCSVRow(rows[0])
  console.log('Cabeçalhos encontrados:', headers)

  const skuIndex = headers.findIndex((h) => h.toLowerCase().includes('sku'))
  const modeloIndex = headers.findIndex((h) =>
    h.toLowerCase().includes('modelo')
  )
  const corIndex = headers.findIndex((h) => h.toLowerCase().includes('cor'))
  const qualidadeIndex = headers.findIndex((h) =>
    h.toLowerCase().includes('qualidade')
  )
  const valorIndex = headers.findIndex((h) => h.toLowerCase().includes('valor'))
  const imagemIndex = headers.findIndex((h) =>
    h.toLowerCase().includes('imagem')
  )

  console.log('Índices das colunas:', {
    sku: skuIndex,
    modelo: modeloIndex,
    cor: corIndex,
    qualidade: qualidadeIndex,
    valor: valorIndex,
    imagem: imagemIndex,
  })

  const products: Product[] = []

  // Parse data rows (skip header)
  for (let i = 1; i < rows.length; i++) {
    const row = parseCSVRow(rows[i])
    if (!row || row.length === 0) continue

    console.log(`Linha ${i}:`, row)

    // Create product object
    const product: Product = {
      id: `product-${i}`,
      sku: skuIndex >= 0 ? row[skuIndex] || '' : '',
      modelo: modeloIndex >= 0 ? row[modeloIndex] || '' : '',
      cor: corIndex >= 0 ? row[corIndex] || '' : '',
      qualidade: qualidadeIndex >= 0 ? row[qualidadeIndex] || '' : '',
      valor:
        valorIndex >= 0
          ? (() => {
              const rawValue = row[valorIndex].trim()
              console.log(`Processando valor bruto: "${rawValue}"`)

              // Tratamento específico para valores no formato "R$ X,XX"
              let processedValue = rawValue
                .replace(/[^\d,.]/g, '') // Remove caracteres não numéricos exceto vírgula e ponto
                .replace(/\./g, '') // Remove pontos (separadores de milhar)
                .replace(',', '.') // Substitui vírgula por ponto para o parseFloat

              const parsedValue = parseFloat(processedValue)
              console.log(
                `Valor processado: "${processedValue}" => ${parsedValue}`
              )
              return parsedValue || 0
            })()
          : 0,
      imagem: imagemIndex >= 0 ? row[imagemIndex] || undefined : undefined,
    }

    products.push(product)
  }

  return products
}

// Helper function to parse CSV row with proper handling of quoted values
function parseCSVRow(row: string): string[] {
  const result = []
  let inQuotes = false
  let currentValue = ''

  for (let i = 0; i < row.length; i++) {
    const char = row[i]

    if (char === '"') {
      inQuotes = !inQuotes
    } else if (char === ',' && !inQuotes) {
      result.push(removeQuotes(currentValue))
      currentValue = ''
    } else {
      currentValue += char
    }
  }

  // Add the last value
  result.push(removeQuotes(currentValue))

  return result
}

// Helper to remove quotes from CSV values
function removeQuotes(value: string): string {
  return value.replace(/^"(.*)"$/, '$1').trim()
}
