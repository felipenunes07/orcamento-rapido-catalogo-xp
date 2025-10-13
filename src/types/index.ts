export interface Product {
  id: string
  sku: string
  modelo: string
  cor: string
  qualidade: string
  valor: number
  imagem?: string
  promocao?: number // Novo campo para valor promocional
  ativo?: string // Campo para status de exibição do produto
  // Mapa com todos os valores da linha, indexados pelo cabeçalho da coluna
  allColumns?: Record<string, string>
}

export interface CartItem {
  product: Product
  quantity: number
}

export interface QuoteData {
  id: string
  number: number
  items: CartItem[]
  total: number
  date: string
  excelFilename: string
  excelLink?: string
}
