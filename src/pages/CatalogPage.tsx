import React, { useState, useEffect } from 'react'
import Layout from '../components/layout/Layout'
import ProductGrid from '../components/catalog/ProductGrid'
import QuoteCart from '../components/quote/QuoteCart'
import { useCart } from '../context/CartContext'
import { fetchProducts, fetchCodePriceMapping } from '../services/sheetService'
import { Product } from '../types'
import { useToast } from '@/hooks/use-toast'
import {
  AlertTriangle,
  Download,
  FileSpreadsheet,
  Info,
  Loader2,
  RefreshCw,
  KeyRound,
  X,
  CheckCircle,
  Filter,
} from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import ScrollToTop from '@/components/ui/ScrollToTop'
import { downloadCatalogExcel } from '@/utils/pdf/exportFunctions'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import deburr from 'lodash/deburr'

const CatalogPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState<number>(0)
  const [selectedBrands, setSelectedBrands] = useState<string[]>([])
  const [availableBrands, setAvailableBrands] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState<string>('')
  const { cartItems, updateQuantity, clearCart, updateProductPrices } =
    useCart()
  const { toast } = useToast()
  const [selectedQualities, setSelectedQualities] = useState<string[]>([])
  const [availableQualities, setAvailableQualities] = useState<string[]>([])
  const [showPromocaoOnly, setShowPromocaoOnly] = useState<boolean>(false)
  const [showDestaqueOnly, setShowDestaqueOnly] = useState<boolean>(false)
  const [showOutletOnly, setShowOutletOnly] = useState<boolean>(false)
  const [codigo, setCodigo] = useState<string>('')
  const [codePriceMapping, setCodePriceMapping] = useState<
    Record<string, string>
  >({})
  const [lastNotifiedCode, setLastNotifiedCode] = useState<string>('')
  const [compactView, setCompactView] = useState<boolean>(false)
  const [showSelectedOnly, setShowSelectedOnly] = useState<boolean>(false)
  const [aroFilter, setAroFilter] = useState<string>('')
  // Desabilita visualização compacta em telas mobile (mantém "Selecionados")
  useEffect(() => {
    if (typeof window === 'undefined') return
    const handleResize = () => {
      const isMobile = window.matchMedia('(max-width: 767px)').matches
      if (isMobile) {
        if (compactView) setCompactView(false)
      }
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [compactView])

  // Detecta se é um dispositivo touch (mobile/tablet)
  const isTouchDevice = () => {
    if (typeof window === 'undefined') return false
    return (
      'ontouchstart' in window ||
      (navigator as any).maxTouchPoints > 0 ||
      (window.matchMedia && window.matchMedia('(pointer: coarse)').matches)
    )
  }

  const loadProducts = async () => {
    setLoading(true)
    setError(null)

    try {
      console.log(`Tentando carregar produtos (tentativa ${retryCount + 1})...`)
      const data = await fetchProducts()

      // Log dos dados recebidos para depuração
      console.log('Dados recebidos:', data)

      setProducts(data)
      setFilteredProducts(data)

      // Extrair marcas únicas apenas dos produtos ativos
      if (data.length > 0) {
        // Primeiro, filtrar apenas produtos ativos
        const activeProducts = data.filter((product) => {
          const ativo = product.ativo
            ? deburr(product.ativo).trim().toUpperCase()
            : ''
          return (
            ativo === 'S' || ativo === 'ULTIMAS UNIDADES' || !product.ativo // fallback para produtos antigos sem campo
          )
        })

        // Mapeamento de prefixos para nomes de marcas
        const brandMapping: Record<string, string> = {
          ip: 'iPhone',
          IP: 'iPhone',
          LG: 'LG',
          SM: 'Samsung',
          MT: 'Motorola',
          Infinix: 'Infinix',
          INFINIX: 'Infinix',
          Nokia: 'Nokia',
          NOKIA: 'Nokia',
          MI: 'Xiaomi',
          REALME: 'Realme',
          OPPO: 'OPPO',
          Oppo: 'OPPO',
          oppo: 'OPPO',
          ZF: 'Asus',
          ZF: 'Asus',
          HONOR: 'Honor',
          Honor: 'Honor',
          HUAWEI: 'Huawei',
          Huawei: 'Huawei',
          'DOC DE CARGA': 'DOC DE CARGA',
          'Doc de Carga': 'DOC DE CARGA',
          'doc de carga': 'DOC DE CARGA',
          DOC: 'DOC DE CARGA',
          Doc: 'DOC DE CARGA',
          doc: 'DOC DE CARGA',
        }

        // Extrair a marca do modelo com base nos prefixos conhecidos (apenas produtos ativos)
        const brands = activeProducts.map((product) => {
          const modelo = product.modelo

          // Verificar se o modelo existe e não está vazio
          if (!modelo || modelo.trim() === '') {
            return null
          }

          // Verificar prefixos conhecidos
          for (const [prefix, brandName] of Object.entries(brandMapping)) {
            if (modelo.startsWith(prefix)) {
              return brandName
            }
          }

          // Verificação específica para modelos Xiaomi (começam com MI)
          if (modelo.startsWith('MI')) {
            return 'Xiaomi'
          }

          // Verificação específica para modelos Realme
          if (modelo.startsWith('REALME')) {
            return 'Realme'
          }

          // Verificação específica para modelos OPPO (qualquer variação)
          if (modelo.toUpperCase().startsWith('OPPO')) {
            return 'OPPO'
          }

          // Verificação específica para modelos Asus (começam com ZF)
          if (modelo.startsWith('ZF')) {
            return 'Asus'
          }

          // Verificação específica para DOC DE CARGA (qualquer variação)
          if (
            modelo.toUpperCase().includes('DOC DE CARGA') ||
            modelo.toUpperCase().startsWith('DOC')
          ) {
            return 'DOC DE CARGA'
          }

          // Verificação específica para HONOR
          if (modelo.toUpperCase().startsWith('HONOR')) {
            return 'Honor'
          }

          // Verificação específica para HUAWEI
          if (modelo.toUpperCase().startsWith('HUAWEI')) {
            return 'Huawei'
          }

          // Se não encontrar um prefixo conhecido, usar a primeira palavra como fallback
          const modelParts = modelo.split(' ')
          const firstPart = modelParts[0]

          // Verificar se a primeira parte não está vazia
          if (firstPart && firstPart.trim() !== '') {
            return firstPart
          }

          return null
        })

        // Filtrar marcas únicas, remover marcas vazias e ordenar alfabeticamente
        const uniqueBrands = [...new Set(brands)].filter(
          (brand) => brand && brand !== null && brand.trim() !== ''
        )
        setAvailableBrands(uniqueBrands)

        // Após carregar produtos, extrair qualidades únicas apenas dos produtos ativos
        setAvailableQualities([
          ...new Set(
            activeProducts
              .map((p) => (p.qualidade === '-' ? 'LCD' : p.qualidade))
              .filter(Boolean)
          ),
        ])

        toast({
          title: 'Catálogo carregado',
          description: `${activeProducts.length} produtos encontrados.`,
        })
      } else {
        setAvailableBrands([])
        toast({
          title: 'Catálogo vazio',
          description: 'Nenhum produto foi encontrado no catálogo.',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Erro ao carregar produtos:', error)
      setError(
        'Não foi possível carregar os produtos do catálogo. Por favor, tente novamente.'
      )
      toast({
        title: 'Erro ao carregar produtos',
        description: 'Não foi possível carregar o catálogo de produtos.',
        variant: 'destructive',
      })

      // Incrementar contador de tentativas
      setRetryCount((prev) => prev + 1)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProducts()
    // Carregar mapeamento de códigos ao iniciar
    fetchCodePriceMapping()
      .then((mapping) => setCodePriceMapping(mapping))
      .catch((e) => {
        console.warn(
          'Falha ao carregar CODIGOPREÇO (continuando com preço base):',
          e
        )
      })

    // Carregar código aplicado do localStorage se existir
    const savedCode = localStorage.getItem('appliedCode')
    if (savedCode) {
      setCodigo(savedCode)
    }
  }, [])

  // Efeito para filtrar produtos quando as seleções mudarem
  useEffect(() => {
    let filtered = products
    // Regra de visibilidade: só exibe produtos ativos ou últimas unidades
    filtered = filtered.filter((product) => {
      // Normaliza o valor do campo ativo para evitar problemas de espaços, acentos e maiúsculas/minúsculas
      const ativo = product.ativo
        ? deburr(product.ativo).trim().toUpperCase()
        : ''
      return (
        ativo === 'S' || ativo === 'ULTIMAS UNIDADES' || !product.ativo // fallback para produtos antigos sem campo
      )
    })

    // Filtrar por marcas selecionadas
    if (selectedBrands.length > 0) {
      filtered = filtered.filter((product) => {
        // Mapeamento de marcas para prefixos
        const brandPrefixMap: Record<string, string[]> = {
          iPhone: ['ip', 'IP'],
          LG: ['LG'],
          Samsung: ['SM'],
          Motorola: ['MT'],
          Infinix: ['Infinix', 'INFINIX'],
          Nokia: ['Nokia', 'NOKIA'],
          Xiaomi: ['MI'],
          Realme: ['REALME'],
          OPPO: ['OPPO', 'Oppo', 'oppo'],
          Asus: ['ZF'],
          Honor: ['HONOR', 'Honor'],
          Huawei: ['HUAWEI', 'Huawei'],
          'DOC DE CARGA': [
            'DOC DE CARGA',
            'Doc de Carga',
            'doc de carga',
            'DOC',
            'Doc',
            'doc',
          ],
        }

        return selectedBrands
          .filter((brand) => brand && brand.trim() !== '') // Filtrar marcas vazias
          .some((selectedBrand) => {
            // Verificação especial para modelos Xiaomi, Realme, OPPO e DOC DE CARGA
            if (selectedBrand === 'Xiaomi' && product.modelo.startsWith('MI')) {
              return true
            }
            if (
              selectedBrand === 'Realme' &&
              product.modelo.startsWith('REALME')
            ) {
              return true
            }
            if (
              selectedBrand === 'OPPO' &&
              product.modelo.toUpperCase().startsWith('OPPO')
            ) {
              return true
            }
            if (
              selectedBrand === 'DOC DE CARGA' &&
              (product.modelo.toUpperCase().includes('DOC DE CARGA') ||
                product.modelo.toUpperCase().startsWith('DOC'))
            ) {
              return true
            }

            // Verificação específica para HONOR
            if (
              selectedBrand === 'Honor' &&
              product.modelo.toUpperCase().startsWith('HONOR')
            ) {
              return true
            }

            // Verificação específica para HUAWEI
            if (
              selectedBrand === 'Huawei' &&
              product.modelo.toUpperCase().startsWith('HUAWEI')
            ) {
              return true
            }

            // Verificação específica para modelos Asus
            if (selectedBrand === 'Asus' && product.modelo.startsWith('ZF')) {
              return true
            }

            // Obter os prefixos para a marca selecionada
            const prefixes = brandPrefixMap[selectedBrand] || []

            // Verificar se o modelo começa com algum dos prefixos da marca selecionada
            return prefixes.some((prefix) => product.modelo.startsWith(prefix))
          })
      })
    }

    // Filtrar por qualidades selecionadas
    if (selectedQualities.length > 0) {
      filtered = filtered.filter((product) => {
        const qual = product.qualidade === '-' ? 'LCD' : product.qualidade
        return selectedQualities.includes(qual)
      })
    }

    // Filtrar por Aro
    if (aroFilter) {
      const wantsComAro = aroFilter === 'Com Aro'
      filtered = filtered.filter((product) => {
        const hasComAro = product.modelo?.toUpperCase().includes('COM ARO')
        return wantsComAro ? hasComAro : !hasComAro
      })
    }

    if (showPromocaoOnly) {
      filtered = filtered.filter(
        (product) => product.promocao && product.promocao > 0
      )
    }

    if (showDestaqueOnly) {
      filtered = filtered.filter(
        (product) =>
          product.modelo.toUpperCase().includes('[DESTAQUE]') ||
          (product.qualidade && product.qualidade.toUpperCase().includes('DESTAQUE'))
      )
    }

    if (showOutletOnly) {
      filtered = filtered.filter(
        (product) =>
          product.modelo.toUpperCase().includes('[OUTLET]') ||
          (product.qualidade && product.qualidade.toUpperCase().includes('OUTLET'))
      )
    }

    // Filtrar por itens selecionados (>1) se ativo
    if (showSelectedOnly) {
      const selectedIds = new Set(
        cartItems.filter((ci) => ci.quantity > 0).map((ci) => ci.product.id)
      )
      filtered = filtered.filter((p) => selectedIds.has(p.id))
    }

    // Filtrar por termo de busca
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase().trim()
      filtered = filtered.filter((product) =>
        product.modelo.toLowerCase().includes(searchLower)
      )
    }

    // Aplicar código de preço, se existir
    const normalizedCode = normalizeKey(codigo)
    const ref = normalizedCode ? codePriceMapping[normalizedCode] : undefined
    if (ref && filtered.length > 0) {
      const headers = Object.keys(filtered[0].allColumns || {})

      // 1) Referência percentual (ex.: "5%")
      const percentMatch = ref.match(/^\s*(-?\d+(?:[\.,]\d+)?)\s*%\s*$/)
      if (percentMatch) {
        const percent = parseFloat(percentMatch[1].replace(',', '.'))

        // Tentar uma coluna que contenha o percentual no nome (ex.: "Valor 5%")
        const byHeader = findHeaderForRef(headers, ref)
        if (byHeader) {
          filtered = filtered.map((p) => {
            const cell = (p.allColumns || {})[byHeader] || ''
            const parsed = normalizeCurrencyToNumber(cell)
            // Ajusta o valor via código, mas preserva o menor entre código e promoção
            const codeValue = parsed !== null ? parsed : p.valor
            const finalValue =
              p.promocao && p.promocao > 0
                ? Math.min(codeValue, p.promocao)
                : codeValue
            return { ...p, valor: finalValue }
          })
        } else {
          // Fallback: aplica percentual sobre a coluna base de Valor
          const priceHeaders = getPriceHeaders(headers)
          const baseHeader =
            priceHeaders[0] || findHeaderForRef(headers, 'valor')
          if (baseHeader) {
            const factor = 1 - percent / 100 // positivo = desconto
            filtered = filtered.map((p) => {
              const baseCell = (p.allColumns || {})[baseHeader] || ''
              const baseParsed = normalizeCurrencyToNumber(baseCell)
              if (baseParsed === null) return p
              const codeValue = Math.max(0, baseParsed * factor)
              const finalValue =
                p.promocao && p.promocao > 0
                  ? Math.min(codeValue, p.promocao)
                  : codeValue
              return { ...p, valor: finalValue }
            })
          }
        }
      } else {
        // 2) Índice numérico relativo às colunas de preço (0, 1, 2, -1, -2)
        const idx = parseInt(ref, 10)
        const priceHeaders = getPriceHeaders(headers)
        if (!Number.isNaN(idx) && priceHeaders.length > 0) {
          const resolvedIndex = idx >= 0 ? idx : priceHeaders.length + idx
          const headerToUse = priceHeaders[resolvedIndex] || priceHeaders[0]
          filtered = filtered.map((p) => {
            const cell = (p.allColumns || {})[headerToUse] || ''
            const parsed = normalizeCurrencyToNumber(cell)
            return { ...p, valor: parsed !== null ? parsed : p.valor }
          })
        } else {
          // 3) Resolver por nome do cabeçalho (compatibilidade)
          const headerToUse = findHeaderForRef(headers, ref)
          if (headerToUse) {
            filtered = filtered.map((p) => {
              const cell = (p.allColumns || {})[headerToUse] || ''
              const parsed = normalizeCurrencyToNumber(cell)
              const codeValue = parsed !== null ? parsed : p.valor
              const finalValue =
                p.promocao && p.promocao > 0
                  ? Math.min(codeValue, p.promocao)
                  : codeValue
              return { ...p, valor: finalValue }
            })
            filtered = filtered.map((p) => {
              const cell = (p.allColumns || {})[headerToUse] || ''
              const parsed = normalizeCurrencyToNumber(cell)
              const codeValue = parsed !== null ? parsed : p.valor
              const finalValue =
                p.promocao && p.promocao > 0
                  ? Math.min(codeValue, p.promocao)
                  : codeValue
              return { ...p, valor: finalValue }
            })
          }
        }
      }
    }

    setFilteredProducts(filtered)

    // Atualizar preços dos produtos no carrinho quando código for aplicado
    if (cartItems.length > 0) {
      updateProductPrices(filtered)
    }
  }, [
    selectedBrands,
    selectedQualities,
    products,
    searchTerm,
    showPromocaoOnly,
    showDestaqueOnly,
    showOutletOnly,
    showSelectedOnly,
    cartItems,
    codigo,
    codePriceMapping,
    aroFilter,
  ])

  // Aviso quando um código válido for inserido e aplicado
  useEffect(() => {
    const normalized = normalizeKey(codigo)
    if (!normalized) {
      setLastNotifiedCode('')
      // Limpar código do localStorage quando código for removido
      localStorage.removeItem('appliedCode')
      return
    }
    const ref = codePriceMapping[normalized]
    if (ref && lastNotifiedCode !== normalized) {
      toast({
        title: 'Código válido✅',
        description: 'Desconto ativado com sucesso!',
      })
      setLastNotifiedCode(normalized)
      // Salvar código aplicado no localStorage
      localStorage.setItem('appliedCode', codigo)
    }
  }, [codigo, codePriceMapping])

  // Função para tentar novamente com delay se houver muitas tentativas
  const handleRetry = () => {
    // Limpar todos os cookies para garantir que as atualizações sejam aplicadas
    document.cookie.split(';').forEach((cookie) => {
      const [name] = cookie.trim().split('=')
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
    })

    // Limpar cache do localStorage
    localStorage.clear()

    // Mostrar mensagem de sucesso
    toast({
      title: 'Atualização em andamento',
      description: 'Carregando atualizações.',
    })

    if (retryCount > 3) {
      // Se já tentou várias vezes, adicionar um delay para evitar bloqueio
      setTimeout(loadProducts, 2000)
    } else {
      loadProducts()
    }

    // Recarregar mapeamento de códigos junto com a atualização da tabela
    fetchCodePriceMapping()
      .then((mapping) => setCodePriceMapping(mapping))
      .catch(() => { })
  }

  // Função para selecionar marca com suporte a múltipla seleção
  const handleSelectBrand = (brand: string, event: React.MouseEvent) => {
    // Verificar se a marca não está vazia antes de processar
    if (!brand || brand.trim() === '') {
      return
    }

    // Sempre alterna (multi-seleção) tanto em mobile quanto desktop
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    )
  }

  // Função para limpar filtro de marca
  const handleClearFilter = () => {
    setSelectedBrands([])
  }

  // Função para selecionar qualidade com suporte a múltipla seleção
  const handleSelectQuality = (quality: string, event: React.MouseEvent) => {
    // Sempre alterna (multi-seleção) tanto em mobile quanto desktop
    setSelectedQualities((prev) =>
      prev.includes(quality)
        ? prev.filter((q) => q !== quality)
        : [...prev, quality]
    )
  }

  // Função para limpar filtro de qualidade
  const handleClearQualityFilter = () => {
    setSelectedQualities([])
  }

  // Função para alternar filtro Aro (permite deselecionar ao clicar novamente)
  const handleChangeAro = (next: string) => {
    setAroFilter((prev) => (prev === next ? '' : next))
  }

  // Nova função para selecionar 1 de cada modelo
  const handleSelectOneOfEachModel = () => {
    // Usar os produtos filtrados em vez de todos os produtos
    const produtosFiltrados = filteredProducts

    const modelosSelecionados = new Set<string>()
    const produtosAdicionados = new Set<string>()

    produtosFiltrados.forEach((product) => {
      // Normaliza o modelo para evitar duplicidade por espaços ou maiúsculas/minúsculas
      const modeloNormalizado = product.modelo.trim().toLowerCase()
      if (!modelosSelecionados.has(modeloNormalizado)) {
        modelosSelecionados.add(modeloNormalizado)
      }
    })

    produtosFiltrados.forEach((product) => {
      const modeloNormalizado = product.modelo.trim().toLowerCase()
      if (modelosSelecionados.has(modeloNormalizado)) {
        // Busca a quantidade atual no carrinho
        const cartItem = cartItems.find(
          (item) => item.product.id === product.id
        )
        const currentQuantity = cartItem ? cartItem.quantity : 0
        updateQuantity(product, currentQuantity + 1)
        produtosAdicionados.add(product.id)
      }
    })

    // Mostrar feedback simplificado ao usuário
    const totalProdutos = produtosAdicionados.size
    const buscaInfo = searchTerm ? ` que contêm "${searchTerm}"` : ''

    toast({
      title: 'Produtos adicionados!',
      description: `${totalProdutos} produto${totalProdutos > 1 ? 's' : ''
        } adicionado${totalProdutos > 1 ? 's' : ''}${buscaInfo}`,
    })
  }

  // Function to sort brands in the required order
  const sortBrandsByCustomOrder = (brands: string[]) => {
    // Filtrar marcas vazias antes de ordenar
    const validBrands = brands.filter((brand) => brand && brand.trim() !== '')

    // Define the custom order
    const customOrder: Record<string, number> = {
      iPhone: 1,
      Samsung: 2,
      Motorola: 3,
      Xiaomi: 4,
      LG: 5,
      Realme: 6,
      Nokia: 7,
      Infinix: 8,
      Asus: 9,
      Honor: 10,
      Huawei: 11,
    }

    // Sort brands by the custom order
    return validBrands.sort((a, b) => {
      // If both brands are in the custom order, sort by the custom order
      if (customOrder[a] && customOrder[b]) {
        return customOrder[a] - customOrder[b]
      }

      // If only a is in the custom order, it comes first
      if (customOrder[a]) return -1

      // If only b is in the custom order, it comes first
      if (customOrder[b]) return 1

      // If neither brand is in the custom order, sort alphabetically
      return a.localeCompare(b)
    })
  }

  const handleTogglePromocao = () => {
    setShowPromocaoOnly(!showPromocaoOnly)
  }

  const handleToggleDestaque = () => {
    setShowDestaqueOnly(!showDestaqueOnly)
  }

  const handleToggleOutlet = () => {
    setShowOutletOnly(!showOutletOnly)
  }

  // Helpers (mantidos aqui para evitar dependência externa)
  const normalizeKey = (value: string) => deburr(value).toLowerCase().trim()
  const normalizeHeader = (value: string) => deburr(value).toLowerCase().trim()
  const normalizeCurrencyToNumber = (
    input: string | undefined | null
  ): number | null => {
    if (!input || typeof input !== 'string') return null
    const cleaned = input
      .replace(/R\$/gi, '')
      .replace(/[\s\u00A0]/g, '')
      .replace(/[A-Za-z]/g, '')
      .replace(/\./g, '')
      .replace(',', '.')
    const value = parseFloat(cleaned)
    return Number.isFinite(value) ? value : null
  }

  const findHeaderForRef = (headers: string[], ref: string): string | null => {
    if (!headers || headers.length === 0) return null
    const nRef = normalizeKey(ref)

    // 1) Correspondência exata pelo cabeçalho
    const exact = headers.find((h) => normalizeHeader(h) === nRef)
    if (exact) return exact

    // 2) Cabeçalho que contenha 'valor' e o token da referência
    const containsOnValor = headers.find((h) => {
      const nh = normalizeHeader(h)
      return nh.includes('valor') && nh.includes(nRef)
    })
    if (containsOnValor) return containsOnValor

    // 3) Qualquer cabeçalho que contenha a referência
    const anyContains = headers.find((h) => normalizeHeader(h).includes(nRef))
    if (anyContains) return anyContains

    return null
  }

  // Retorna a lista de cabeçalhos de preço, na ordem em que aparecem na planilha
  const getPriceHeaders = (headers: string[]): string[] => {
    const normalized = headers.map((h) => ({ h, n: normalizeHeader(h) }))
    // Considera colunas que contenham a palavra "valor" (ou preço) como colunas de preço
    const price = normalized
      .filter(
        (x) =>
          x.n.includes('valor') ||
          x.n.includes('preco') ||
          x.n.includes('preço')
      )
      .map((x) => x.h)
    return price
  }

  // Itens selecionados com quantidade > 0
  const selectedMoreThanOne = cartItems.filter((ci) => ci.quantity > 0)
  const selectedMoreThanOneUnits = selectedMoreThanOne.reduce(
    (sum, ci) => sum + ci.quantity,
    0
  )

  return (
    <Layout>
      <div className="container-custom py-8 bg-background">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <h1 className="text-2xl font-bold">Tabela de Produtos</h1>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => downloadCatalogExcel(codigo)}
              className="flex items-center gap-1 bg-green-50 hover:bg-green-100 text-green-700 border-green-200 hover:border-green-300"
            >
              <FileSpreadsheet className="h-4 w-4" />
              Baixar Catálogo em Excel
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRetry}
              disabled={loading}
              className="flex items-center gap-1"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              Atualizar Tabela
            </Button>
          </div>
        </div>

        {/* Campo de busca por modelo */}
        {!loading && !error && (
          <div className="mb-4">
            <div className="flex items-center gap-2">
              <Input
                type="text"
                placeholder="Pesquisar por modelo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm md:max-w-md md:h-12 md:text-base"
              />
              {searchTerm && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSearchTerm('')}
                  className="h-10 w-10 md:h-12 md:w-12"
                >
                  <X className="h-4 w-4 md:h-5 md:w-5" />
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Container principal dos filtros com visual melhorado */}
        {!loading &&
          !error &&
          (availableBrands.length > 0 || availableQualities.length > 0) && (
            <div className="bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 rounded-2xl p-4 md:p-6 shadow-sm border border-gray-100 dark:border-gray-700 mb-6">
              <div className="flex flex-col gap-5">
                {/* Filtro de marcas */}
                {availableBrands.length > 0 && (
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <h2 className="text-sm md:text-base font-semibold text-gray-900 dark:text-gray-100">
                          Marcas
                        </h2>
                        {selectedBrands.length > 0 && (
                          <span className="text-[10px] md:text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-blue-500 px-2 py-0.5 rounded-full shadow-sm">
                            {selectedBrands.length}
                          </span>
                        )}
                      </div>
                      {selectedBrands.length > 0 && (
                        <button
                          onClick={handleClearFilter}
                          className="text-[10px] md:text-xs text-blue-600 hover:text-blue-800 transition-colors duration-200 font-medium dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          Limpar
                        </button>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1.5 md:gap-2">
                      {sortBrandsByCustomOrder(availableBrands)
                        .filter((brand) => brand && brand.trim() !== '')
                        .map((brand) => (
                          <Badge
                            key={brand}
                            variant="outline"
                            className={`
                            cursor-pointer 
                            text-[11px] md:text-xs
                            py-1.5 md:py-2
                            px-3 md:px-4
                            rounded-lg md:rounded-xl
                            border-2
                            transition-all
                            duration-200
                            font-medium
                            ${selectedBrands.includes(brand)
                                ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white border-transparent shadow-md hover:shadow-lg scale-105'
                                : 'bg-white text-gray-700 border-gray-200 hover:border-blue-400 hover:text-blue-700 hover:shadow-sm hover:bg-blue-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:border-blue-400 dark:hover:text-blue-400 dark:hover:bg-gray-700'
                              }
                          `}
                            onClick={(e) => handleSelectBrand(brand, e)}
                          >
                            {brand}
                          </Badge>
                        ))}
                    </div>
                    <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent dark:via-gray-700 mt-1"></div>
                  </div>
                )}

                {/* Filtro de qualidades */}
                {availableQualities.length > 0 && (
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1.5">
                          <h2 className="text-sm md:text-base font-semibold text-gray-900 dark:text-gray-100">
                            Qualidade
                          </h2>
                          <Popover>
                            <PopoverTrigger>
                              <Info className="h-3.5 w-3.5 md:h-4 md:w-4 text-gray-400 hover:text-blue-500 transition-colors cursor-help dark:text-gray-500 dark:hover:text-blue-400" />
                            </PopoverTrigger>
                            <PopoverContent className="w-80 p-4 text-sm dark:bg-gray-800 dark:border-gray-700">
                              <div className="space-y-2">
                                <p className="font-medium dark:text-gray-200">
                                  SELECT
                                </p>
                                <p className="text-gray-600 dark:text-gray-400">
                                  Com componentes de alta qualidade, brilho 300
                                  a 500 lumens, alta resolução HD+/FHD
                                </p>

                                <p className="font-medium dark:text-gray-200">
                                  PREMIER
                                </p>
                                <p className="text-gray-600 dark:text-gray-400">
                                  Brilho 300 a 500 lumens, alta resolução
                                  HD+/FHD, flex e CI igual ao peça genuína
                                </p>

                                <p className="font-medium dark:text-gray-200">
                                  PREMIER/SELECT MAX
                                </p>
                                <p className="text-gray-600 dark:text-gray-400">
                                  Brilho chegando 500 lumens, alta resolução
                                  HD++/FHD, flex e CI igual ao peça genuína. O
                                  MAX tem maior saturação de cores e brilho mais
                                  alto.
                                </p>

                                <p className="font-medium dark:text-gray-200">
                                  ORI
                                </p>
                                <p className="text-gray-600 dark:text-gray-400">
                                  Original China
                                </p>

                                <p className="font-medium dark:text-gray-200">
                                  LCD
                                </p>
                                <p className="text-gray-600 dark:text-gray-400">
                                  Incell
                                </p>
                              </div>
                            </PopoverContent>
                          </Popover>
                        </div>
                        {selectedQualities.length > 0 && (
                          <span className="text-[10px] md:text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-blue-500 px-2 py-0.5 rounded-full shadow-sm">
                            {selectedQualities.length}
                          </span>
                        )}
                      </div>
                      {selectedQualities.length > 0 && (
                        <button
                          onClick={handleClearQualityFilter}
                          className="text-[10px] md:text-xs text-blue-600 hover:text-blue-800 transition-colors duration-200 font-medium dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          Limpar
                        </button>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1.5 md:gap-2">
                      {availableQualities.map((quality) => (
                        <Badge
                          key={quality}
                          variant="outline"
                          className={`
                          cursor-pointer 
                          text-[11px] md:text-xs
                          py-1.5 md:py-2
                          px-3 md:px-4
                          rounded-lg md:rounded-xl
                          border-2
                          transition-all
                          duration-200
                          font-medium
                          ${selectedQualities.includes(quality)
                              ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white border-transparent shadow-md hover:shadow-lg scale-105'
                              : 'bg-white text-gray-700 border-gray-200 hover:border-blue-400 hover:text-blue-700 hover:shadow-sm hover:bg-blue-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:border-blue-400 dark:hover:text-blue-400 dark:hover:bg-gray-700'
                            }
                        `}
                          onClick={(e) => handleSelectQuality(quality, e)}
                        >
                          {quality}
                        </Badge>
                      ))}
                    </div>
                    <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent dark:via-gray-700 mt-1"></div>
                  </div>
                )}

                {/* Filtro de Aro */}
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <h2 className="text-sm md:text-base font-semibold text-gray-900 dark:text-gray-100">Aro</h2>
                      <Popover>
                        <PopoverTrigger>
                          <Info className="h-3.5 w-3.5 md:h-4 md:w-4 text-gray-400 hover:text-blue-500 transition-colors cursor-help dark:text-gray-500 dark:hover:text-blue-400" />
                        </PopoverTrigger>
                        <PopoverContent className="w-80 p-4 text-sm dark:bg-gray-800 dark:border-gray-700">
                          <div className="space-y-2">
                            <p className="text-gray-600 dark:text-gray-400">
                              Selecione se deseja ver peças com ou sem aro.
                              "Todos" mostra ambos.
                            </p>
                          </div>
                        </PopoverContent>
                      </Popover>
                    </div>
                    {aroFilter && (
                      <button
                        onClick={() => setAroFilter('')}
                        className="text-[10px] md:text-xs text-blue-600 hover:text-blue-800 transition-colors duration-200 font-medium dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        Limpar
                      </button>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1.5 md:gap-2">
                    <Badge
                      variant="outline"
                      className={`
                      cursor-pointer 
                      text-[11px] md:text-xs
                      py-1.5 md:py-2
                      px-3 md:px-4
                      rounded-lg md:rounded-xl
                      border-2
                      transition-all
                      duration-200
                      font-medium
                      ${aroFilter === ''
                          ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white border-transparent shadow-md hover:shadow-lg scale-105'
                          : 'bg-white text-gray-700 border-gray-200 hover:border-blue-400 hover:text-blue-700 hover:shadow-sm hover:bg-blue-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:border-blue-400 dark:hover:text-blue-400 dark:hover:bg-gray-700'
                        }
                    `}
                      onClick={() => handleChangeAro('')}
                    >
                      Todos
                    </Badge>
                    <Badge
                      variant="outline"
                      className={`
                      cursor-pointer 
                      text-[11px] md:text-xs
                      py-1.5 md:py-2
                      px-3 md:px-4
                      rounded-lg md:rounded-xl
                      border-2
                      transition-all
                      duration-200
                      font-medium
                      ${aroFilter === 'Com Aro'
                          ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white border-transparent shadow-md hover:shadow-lg scale-105'
                          : 'bg-white text-gray-700 border-gray-200 hover:border-blue-400 hover:text-blue-700 hover:shadow-sm hover:bg-blue-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:border-blue-400 dark:hover:text-blue-400 dark:hover:bg-gray-700'
                        }
                    `}
                      onClick={() => handleChangeAro('Com Aro')}
                    >
                      Com Aro
                    </Badge>
                    <Badge
                      variant="outline"
                      className={`
                      cursor-pointer 
                      text-[11px] md:text-xs
                      py-1.5 md:py-2
                      px-3 md:px-4
                      rounded-lg md:rounded-xl
                      border-2
                      transition-all
                      duration-200
                      font-medium
                      ${aroFilter === 'Sem Aro'
                          ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white border-transparent shadow-md hover:shadow-lg scale-105'
                          : 'bg-white text-gray-700 border-gray-200 hover:border-blue-400 hover:text-blue-700 hover:shadow-sm hover:bg-blue-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:border-blue-400 dark:hover:text-blue-400 dark:hover:bg-gray-700'
                        }
                    `}
                      onClick={() => handleChangeAro('Sem Aro')}
                    >
                      Sem Aro
                    </Badge>
                  </div>
                  <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent dark:via-gray-700 mt-1"></div>
                </div>

                {/* Novo filtro de promoção */}
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <h2 className="text-sm md:text-base font-semibold text-gray-900 dark:text-gray-100">
                        Preço
                      </h2>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-5 w-5 p-0 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                          >
                            <Info className="h-3 w-3" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-80 p-4">
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <h4 className="font-medium text-sm">
                                Produtos com Preço de Parceiro
                              </h4>
                              <p className="text-xs text-gray-600 dark:text-gray-400">
                                Mostra apenas produtos com preço de parceiro ou em promoção.
                              </p>
                            </div>

                            <div className="space-y-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                              <h4 className="font-medium text-sm text-purple-700 dark:text-purple-400">
                                O que é Outlet?
                              </h4>
                              <div className="text-[11px] text-gray-600 dark:text-gray-400 space-y-2 leading-relaxed">
                                <p>
                                  <strong>Recondicionado</strong> significa que o produto não é novo de fábrica, mas também não é usado.
                                </p>
                                <p>
                                  São telas que retornaram por algum motivo (logística, troca, embalagem), passaram por uma nova triagem técnica, foram testadas novamente pela nossa equipe especializada e aprovadas para revenda.
                                </p>
                                <p>
                                  A XP não recoloca esses produtos como "novos" no estoque, porque acreditamos que transparência é respeito ao cliente.
                                </p>
                                <p>
                                  Por isso usamos a classificação RECONDICIONADO, para que o consumidor saiba exatamente o que está comprando.
                                </p>
                              </div>
                            </div>
                          </div>
                        </PopoverContent>
                      </Popover>
                    </div>
                    {/* Badge de Desconto Ativo */}
                    {codigo.trim() &&
                      codePriceMapping[normalizeKey(codigo)] && (
                        <Badge
                          variant="outline"
                          className="flex items-center gap-1 bg-green-50 text-green-700 border-green-200 hover:bg-green-100 px-2 py-1 text-xs font-medium"
                        >
                          <CheckCircle className="h-3 w-3" />
                          Desconto Ativo
                        </Badge>
                      )}
                  </div>
                  <div className="flex flex-wrap gap-1.5 md:gap-2">
                    <Badge
                      variant="outline"
                      className={`
                      cursor-pointer 
                      text-[11px] md:text-xs
                      py-1.5 md:py-2
                      px-3 md:px-4
                      rounded-lg md:rounded-xl
                      border-2
                      transition-all
                      duration-200
                      font-semibold
                      whitespace-nowrap
                      ${showPromocaoOnly
                          ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white border-transparent shadow-md hover:shadow-lg scale-105'
                          : 'bg-white text-blue-700 border-blue-300 hover:bg-blue-50 hover:text-blue-800 hover:border-blue-400 hover:shadow-sm dark:bg-gray-800 dark:text-blue-300 dark:border-blue-700 dark:hover:bg-gray-700 dark:hover:text-blue-200'
                        }
                    `}
                      onClick={handleTogglePromocao}
                    >
                      🔥 Preço de Parceiro
                    </Badge>
                    <Badge
                      variant="outline"
                      className={`
                      cursor-pointer 
                      text-[11px] md:text-xs
                      py-1.5 md:py-2
                      px-3 md:px-4
                      rounded-lg md:rounded-xl
                      border-2
                      transition-all
                      duration-200
                      font-semibold
                      whitespace-nowrap
                      ${showDestaqueOnly
                          ? 'bg-gradient-to-r from-amber-500 to-amber-400 text-white border-transparent shadow-md hover:shadow-lg scale-105'
                          : 'bg-white text-amber-600 border-amber-300 hover:bg-amber-50 hover:text-amber-700 hover:border-amber-400 hover:shadow-sm dark:bg-gray-800 dark:text-amber-400 dark:border-amber-700 dark:hover:bg-gray-700 dark:hover:text-amber-300'
                        }
                    `}
                      onClick={handleToggleDestaque}
                    >
                      ⭐ Destaques
                    </Badge>
                    <Badge
                      variant="outline"
                      className={`
                      cursor-pointer 
                      text-[11px] md:text-xs
                      py-1.5 md:py-2
                      px-3 md:px-4
                      rounded-lg md:rounded-xl
                      border-2
                      transition-all
                      duration-200
                      font-semibold
                      whitespace-nowrap
                      ${showOutletOnly
                          ? 'bg-gradient-to-r from-purple-600 to-purple-500 text-white border-transparent shadow-md hover:shadow-lg scale-105'
                          : 'bg-white text-purple-700 border-purple-300 hover:bg-purple-50 hover:text-purple-800 hover:border-purple-400 hover:shadow-sm dark:bg-gray-800 dark:text-purple-400 dark:border-purple-700 dark:hover:bg-gray-700 dark:hover:text-purple-300'
                        }
                    `}
                      onClick={handleToggleOutlet}
                    >
                      🏷️ Outlet
                    </Badge>
                    {/* Novo filtro: Código (estilo similar ao badge) */}
                    <div
                      className={`
                        flex items-center gap-1.5 ml-2 min-w-0
                        text-[10px] md:text-xs
                        py-0.5 md:py-1
                        px-2 md:px-2
                        rounded-lg md:rounded-xl
                        border-2
                        transition-all
                        duration-200
                        font-medium
                        ${codigo.trim()
                          ? 'bg-white text-gray-900 border-blue-500 ring-1 ring-blue-200 dark:bg-gray-800 dark:text-gray-100 dark:border-blue-400 dark:ring-0'
                          : 'bg-white text-gray-700 border-blue-300 hover:border-blue-400 dark:bg-gray-800 dark:text-gray-300 dark:border-blue-700'
                        }
                      `}
                    >
                      <KeyRound className="h-3 w-3 md:h-3.5 md:w-3.5 shrink-0 text-blue-500" />
                      <input
                        type="text"
                        placeholder="Código"
                        value={codigo}
                        onChange={(e) => {
                          setCodigo(e.target.value)
                          if (e.target.value === '') {
                            localStorage.removeItem('appliedCode')
                          }
                        }}
                        className="
                          h-5 md:h-6 w-20 md:w-28
                          bg-transparent border-0 p-0 m-0
                          outline-none ring-0 ring-offset-0 shadow-none
                          focus:outline-none focus:ring-0 focus:ring-offset-0
                          placeholder:text-gray-400 placeholder:font-normal
                          text-current
                        "
                      />
                      {codigo && (
                        <button
                          onClick={() => {
                            setCodigo('')
                            localStorage.removeItem('appliedCode')
                          }}
                          className="opacity-90 hover:opacity-100 transition-colors"
                          title="Limpar código"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

        {/* Botão para selecionar 1 de cada modelo + Visualização Compacta (à direita) */}
        <div className="mt-8 mb-6">
          <div className="flex items-center justify-between gap-3 md:gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSelectOneOfEachModel}
              className="flex items-center gap-2 h-10 px-4 text-xs md:h-12 md:px-6 md:text-sm font-medium text-gray-700 bg-background border-2 border-gray-200 hover:bg-gray-50 hover:text-gray-900 hover:border-blue-300 hover:shadow-md transition-all duration-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-100 dark:hover:border-blue-400"
            >
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
              </span>
              Selecionar 1 de cada modelo
            </Button>
            <div className="flex items-center gap-2 ml-auto">
              {/* Visualização Compacta - apenas desktop */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCompactView(!compactView)}
                className={`hidden md:flex items-center gap-1 ${compactView
                  ? 'bg-blue-600 hover:bg-blue-700 text-white border-blue-600 hover:border-blue-700'
                  : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50 hover:text-gray-900 hover:border-gray-400 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-100 dark:hover:border-gray-500'
                  }`}
              >
                <div
                  className={`h-4 w-4 ${compactView ? 'bg-blue-400' : 'bg-gray-400'
                    } rounded-sm`}
                ></div>
                Visualização Compacta
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSelectedOnly((v) => !v)}
                className={`flex items-center justify-center gap-1.5 h-10 px-3 text-xs md:h-10 md:px-4 md:text-sm font-medium ${showSelectedOnly
                  ? 'bg-blue-600 hover:bg-blue-700 text-white border-blue-600 hover:border-blue-700 shadow-md'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:text-gray-900 hover:border-gray-400 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-100 dark:hover:border-gray-500'
                  }`}
              >
                <Filter className={`h-3.5 w-3.5 md:h-4 md:w-4 ${showSelectedOnly ? 'text-white' : 'text-blue-600 dark:text-blue-400'}`} />
                <span className="md:inline hidden">Selecionados</span>
                <span className="md:hidden inline whitespace-nowrap">Filtrar</span>
                <span
                  className={`px-1.5 py-0.5 text-[10px] md:text-xs font-semibold rounded-full min-w-[20px] text-center ${selectedMoreThanOneUnits > 0
                    ? showSelectedOnly
                      ? 'bg-white text-blue-700'
                      : 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                    }`}
                >
                  {selectedMoreThanOneUnits}
                </span>
              </Button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="space-y-4">
            <div className="w-full h-10 bg-muted rounded animate-pulse" />
            {[...Array(6)].map((_, index) => (
              <div
                key={index}
                className="w-full h-12 bg-muted rounded-md animate-pulse"
              />
            ))}
          </div>
        ) : error ? (
          <div className="py-6">
            <Alert variant="destructive" className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Erro</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            <div className="text-center">
              <Button onClick={handleRetry} className="mt-4">
                Tentar novamente
              </Button>
            </div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <p>
              Nenhum produto encontrado
              {selectedBrands.length > 0
                ? ` para as marcas ${selectedBrands.join(', ')}`
                : ''}
              .
            </p>
            {selectedBrands.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearFilter}
                className="mt-4"
              >
                Mostrar todos os produtos
              </Button>
            )}
          </div>
        ) : (
          <div className="bg-background p-4 rounded-lg shadow-sm dark:border-gray-700">
            <ProductGrid
              products={filteredProducts}
              cartItems={cartItems}
              onUpdateQuantity={updateQuantity}
              compactView={compactView}
            />
          </div>
        )}

        <QuoteCart cartItems={cartItems} onClearCart={clearCart} />
        <ScrollToTop />
      </div>
    </Layout>
  )
}

export default CatalogPage
