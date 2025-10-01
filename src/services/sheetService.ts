import { Product } from '../types'

// Spreadsheet ID from the provided URL
const SPREADSHEET_ID = '1qAuw2ebWPJmcy_gl4Qf48GfmnSGLZumDfs62fpG2BGA'
const SHEET_NAME = 'CATÁLOGO'

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
  const promocaoIndex = headers.findIndex(
    (h) =>
      h.toLowerCase().includes('promoção') ||
      h.toLowerCase().includes('promocao')
  )

  console.log('Índices das colunas:', {
    sku: skuIndex,
    modelo: modeloIndex,
    cor: corIndex,
    qualidade: qualidadeIndex,
    valor: valorIndex,
    imagem: imagemIndex,
  })

  console.log(
    '🔎 CABEÇALHO DA COLUNA VALOR:',
    valorIndex >= 0 ? headers[valorIndex] : 'Não encontrado'
  )
  console.log('🔎 TODOS OS CABEÇALHOS:', headers)

  const products: Product[] = []

  // Parse data rows (skip header)
  for (let i = 1; i < rows.length; i++) {
    const row = parseCSVRow(rows[i])
    if (!row || row.length === 0) continue

    console.log(`Linha ${i}:`, row)

    // Extrair valores dos campos
    const sku = skuIndex >= 0 ? row[skuIndex] || '' : ''
    const modelo = modeloIndex >= 0 ? row[modeloIndex] || '' : ''
    const cor = corIndex >= 0 ? row[corIndex] || '' : ''
    const qualidade = qualidadeIndex >= 0 ? row[qualidadeIndex] || '' : ''

    // Log específico para conectores e docs de carga (expandido)
    if (
      modelo.toLowerCase().includes('conector') ||
      modelo.toLowerCase().includes('doc') ||
      modelo.toLowerCase().includes('carga') ||
      modelo.toLowerCase().includes('cabo') ||
      modelo.toLowerCase().includes('carregador') ||
      sku.toLowerCase().includes('doc') ||
      sku.toLowerCase().includes('carga')
    ) {
      console.log(`🔍 CONECTOR/DOC/CABO DETECTADO - Linha ${i}:`)
      console.log(`  - SKU: "${sku}"`)
      console.log(`  - Modelo: "${modelo}"`)
      console.log(`  - Row completa:`, row)
      console.log(`  - valorIndex: ${valorIndex}`)
      console.log(
        `  - Valor bruto da coluna: "${
          valorIndex >= 0 ? row[valorIndex] : 'N/A'
        }"`
      )
    }

    // Log para identificar produtos que deveriam ter valores válidos
    if (valorIndex >= 0 && row[valorIndex] && row[valorIndex].trim() !== '') {
      const rawValue = row[valorIndex].trim()
      const testProcessed = rawValue
        .replace(/[^\d,.]/g, '')
        .replace(/\./g, '')
        .replace(',', '.')
      const testValue = parseFloat(testProcessed)

      if (!isNaN(testValue) && testValue > 0) {
        console.log(`💰 PRODUTO COM VALOR VÁLIDO DETECTADO - Linha ${i}:`)
        console.log(`  - Modelo: "${modelo}"`)
        console.log(`  - Valor bruto: "${rawValue}"`)
        console.log(`  - Valor após processamento: "${testProcessed}"`)
        console.log(`  - Valor numérico: ${testValue}`)
      }
    }

    // Validar se os campos essenciais não estão vazios
    if (!modelo || modelo.trim() === '' || !sku || sku.trim() === '') {
      console.log(
        `Linha ${i} ignorada: modelo ou SKU vazio - modelo: "${modelo}", SKU: "${sku}"`
      )
      continue
    }

    // Processar valor
    let valor = 0
    if (valorIndex >= 0) {
      const rawValue = row[valorIndex]
      console.log(
        `DEBUG - Linha ${i}, valorIndex: ${valorIndex}, rawValue: "${rawValue}"`
      )

      if (rawValue && rawValue.trim() !== '') {
        try {
          console.log(`DEBUG - Processando valor: "${rawValue}"`)

          const parsedValue = normalizeCurrencyToNumber(rawValue)
          console.log(
            `DEBUG - Valor parseado via helper: ${parsedValue}, isNaN: ${
              parsedValue === null
            }`
          )

          if (parsedValue !== null && parsedValue >= 0) {
            valor = parsedValue
            console.log(`DEBUG - Valor definido como: ${valor}`)
          } else {
            console.log(
              `ERRO - Valor inválido, usando 0 - "${rawValue}" => ${parsedValue}`
            )
            valor = 0
          }
        } catch (error) {
          console.log(
            `ERRO - Exceção ao processar valor - "${rawValue}":`,
            error
          )
          valor = 0
        }
      } else {
        console.log(`DEBUG - Linha ${i}: valor vazio ou undefined, usando 0`)
        valor = 0
      }
    } else {
      console.log(
        `DEBUG - Linha ${i}: valorIndex inválido (${valorIndex}), usando 0`
      )
    }

    // Fallback: se valor ainda for 0 ou NaN e existir outro campo com R$ na linha
    if (valor === 0) {
      const fallbackCell = row.find(
        (cell) => typeof cell === 'string' && /R\$[\s\u00A0]*\d/.test(cell)
      )
      if (fallbackCell) {
        console.log(
          `⚠️  FALLBACK - Encontrado valor em outra coluna: "${fallbackCell}" (Linha ${i})`
        )
        const parsedFallback = normalizeCurrencyToNumber(fallbackCell)
        if (parsedFallback !== null) {
          valor = parsedFallback
          console.log(`⚠️  FALLBACK - Valor definido como: ${valor}`)
        }
      }
    }

    // Fallback 2: regex no texto bruto da linha, caso ainda valor 0
    if (valor === 0) {
      const rawLine = rows[i]
      const regexMatch = rawLine.match(/R\$[\s\u00A0]*([0-9][0-9\.,]*)/)
      if (regexMatch) {
        const matchedValue = regexMatch[0]
        console.log(
          `⚠️  FALLBACK2 - Valor encontrado via regex na linha: ${matchedValue}`
        )
        const parsed = normalizeCurrencyToNumber(matchedValue)
        if (parsed !== null) {
          valor = parsed
          console.log(`⚠️  FALLBACK2 - Valor definido como: ${valor}`)
        }
      }
    }

    // Processar valor de promoção
    let promocao: number | undefined = undefined
    if (
      promocaoIndex >= 0 &&
      row[promocaoIndex] &&
      row[promocaoIndex].trim() !== ''
    ) {
      const promocaoValue = normalizeCurrencyToNumber(row[promocaoIndex])
      if (promocaoValue !== null && promocaoValue > 0) {
        promocao = promocaoValue
      }
    }

    // Create product object
    const product: Product = {
      id: `product-${i}`,
      sku: sku.trim(),
      modelo: modelo.trim(),
      cor: cor.trim() || '-',
      qualidade: qualidade.trim() || '-',
      valor: valor,
      imagem: imagemIndex >= 0 ? row[imagemIndex] || undefined : undefined,
      promocao: promocao, // Adicionar campo de promoção
    }

    // Log específico do produto final para conectores
    if (
      modelo.toLowerCase().includes('conector') ||
      modelo.toLowerCase().includes('doc') ||
      modelo.toLowerCase().includes('carga')
    ) {
      console.log(`🔍 PRODUTO CONECTOR/DOC FINAL - Linha ${i}:`)
      console.log(`  - Produto criado:`, product)
      console.log(`  - Valor final: ${product.valor}`)
    }

    // Validação final: garantir que o produto tem pelo menos modelo e SKU válidos
    if (
      product.modelo &&
      product.modelo.trim() !== '' &&
      product.sku &&
      product.sku.trim() !== ''
    ) {
      products.push(product)
      console.log(`Produto ${i} adicionado:`, product)
    } else {
      console.log(`Linha ${i} ignorada: produto inválido após validação`)
    }
  }

  console.log(`Total de produtos válidos: ${products.length}`)
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

// Helper: normaliza texto monetário (ex.: "R$\u00A015,00") para número (15.00)
function normalizeCurrencyToNumber(
  input: string | undefined | null
): number | null {
  if (!input || typeof input !== 'string') return null
  const cleaned = input
    .replace(/R\$/gi, '') // remove R$
    .replace(/[\s\u00A0]/g, '') // remove espaços normais e NBSP
    .replace(/[A-Za-z]/g, '') // remove letras restantes
    .replace(/\./g, '') // remove pontos de milhar
    .replace(',', '.') // vírgula -> ponto
  const value = parseFloat(cleaned)
  return Number.isFinite(value) ? value : null
}
