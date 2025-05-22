
export interface Product {
  id: string
  sku: string
  modelo: string
  cor: string
  qualidade: string
  valor: number
  imagem?: string
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
