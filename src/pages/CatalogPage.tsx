import React, { useState, useEffect } from 'react'
import Layout from '../components/layout/Layout'
import ProductGrid from '../components/catalog/ProductGrid'
import QuoteCart from '../components/quote/QuoteCart'
import { useCart } from '../context/CartContext'
import { fetchProducts } from '../services/sheetService'
import { Product } from '../types'
import { useToast } from '@/hooks/use-toast'
import {
  AlertTriangle,
  Download,
  FileSpreadsheet,
  Info,
  Loader2,
  RefreshCw,
  X,
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

const CatalogPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState<number>(0)
  const [selectedBrands, setSelectedBrands] = useState<string[]>([])
  const [availableBrands, setAvailableBrands] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState<string>('')
  const { cartItems, updateQuantity, clearCart } = useCart()
  const { toast } = useToast()
  const [selectedQualities, setSelectedQualities] = useState<string[]>([])
  const [availableQualities, setAvailableQualities] = useState<string[]>([])
  const [showPromocaoOnly, setShowPromocaoOnly] = useState<boolean>(false)

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

      // Extrair marcas únicas dos produtos
      if (data.length > 0) {
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
          'DOC DE CARGA': 'DOC DE CARGA',
          'Doc de Carga': 'DOC DE CARGA',
          'doc de carga': 'DOC DE CARGA',
          DOC: 'DOC DE CARGA',
          Doc: 'DOC DE CARGA',
          doc: 'DOC DE CARGA',
        }

        // Extrair a marca do modelo com base nos prefixos conhecidos
        const brands = data.map((product) => {
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

        // Após carregar produtos, extrair qualidades únicas
        setAvailableQualities([
          ...new Set(
            data
              .map((p) => (p.qualidade === '-' ? 'LCD' : p.qualidade))
              .filter(Boolean)
          ),
        ])

        toast({
          title: 'Catálogo carregado',
          description: `${data.length} produtos encontrados.`,
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
  }, [])

  // Efeito para filtrar produtos quando as seleções mudarem
  useEffect(() => {
    let filtered = products

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

    if (showPromocaoOnly) {
      filtered = filtered.filter(
        (product) => product.promocao && product.promocao > 0
      )
    }

    // Filtrar por termo de busca
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase().trim()
      filtered = filtered.filter((product) =>
        product.modelo.toLowerCase().includes(searchLower)
      )
    }

    setFilteredProducts(filtered)
  }, [
    selectedBrands,
    selectedQualities,
    products,
    searchTerm,
    showPromocaoOnly,
  ])

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
  }

  // Função para selecionar marca com suporte a múltipla seleção
  const handleSelectBrand = (brand: string, event: React.MouseEvent) => {
    // Verificar se a marca não está vazia antes de processar
    if (!brand || brand.trim() === '') {
      return
    }

    if (event.ctrlKey) {
      // Se Ctrl está pressionado, adiciona/remove da seleção múltipla
      setSelectedBrands((prev) =>
        prev.includes(brand)
          ? prev.filter((b) => b !== brand)
          : [...prev, brand]
      )
    } else {
      // Se Ctrl não está pressionado, comportamento normal (toggle único)
      setSelectedBrands((prev) =>
        prev.length === 1 && prev[0] === brand ? [] : [brand]
      )
    }
  }

  // Função para limpar filtro de marca
  const handleClearFilter = () => {
    setSelectedBrands([])
  }

  // Função para selecionar qualidade com suporte a múltipla seleção
  const handleSelectQuality = (quality: string, event: React.MouseEvent) => {
    if (event.ctrlKey) {
      // Se Ctrl está pressionado, adiciona/remove da seleção múltipla
      setSelectedQualities((prev) =>
        prev.includes(quality)
          ? prev.filter((q) => q !== quality)
          : [...prev, quality]
      )
    } else {
      // Se Ctrl não está pressionado, comportamento normal (toggle único)
      setSelectedQualities((prev) =>
        prev.length === 1 && prev[0] === quality ? [] : [quality]
      )
    }
  }

  // Função para limpar filtro de qualidade
  const handleClearQualityFilter = () => {
    setSelectedQualities([])
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
      description: `${totalProdutos} produto${
        totalProdutos > 1 ? 's' : ''
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

  return (
    <Layout>
      <div className="container-custom py-8 bg-background">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <h1 className="text-2xl font-bold">Tabela de Produtos</h1>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => downloadCatalogExcel()}
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
            <div className="flex flex-col gap-6">
              {/* Filtro de marcas */}
              {availableBrands.length > 0 && (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h2 className="text-sm font-medium text-gray-800 dark:text-gray-200">
                        Marcas
                      </h2>
                      {selectedBrands.length > 0 && (
                        <span className="text-xs font-medium text-white bg-blue-500 px-2 py-1 rounded-full">
                          {selectedBrands.length}
                        </span>
                      )}
                    </div>
                    {selectedBrands.length > 0 && (
                      <button
                        onClick={handleClearFilter}
                        className="text-xs text-gray-500 hover:text-gray-800 transition-colors duration-200 underline decoration-dotted dark:text-gray-400 dark:hover:text-gray-200"
                      >
                        Limpar seleção
                      </button>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {sortBrandsByCustomOrder(availableBrands)
                      .filter((brand) => brand && brand.trim() !== '')
                      .map((brand) => (
                        <Badge
                          key={brand}
                          variant="outline"
                          className={`
                          cursor-pointer 
                          text-xs
                          py-2
                          px-4
                          rounded-xl
                          border-2
                          transition-all
                          duration-200
                          font-medium
                          ${
                            selectedBrands.includes(brand)
                              ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white border-transparent shadow-md hover:shadow-lg'
                              : 'bg-background text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-600 hover:shadow-sm hover:bg-blue-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:border-blue-400 dark:hover:text-blue-400 dark:hover:bg-gray-700'
                          }
                        `}
                          onClick={(e) => handleSelectBrand(brand, e)}
                        >
                          {brand}
                        </Badge>
                      ))}
                  </div>
                </div>
              )}

              {/* Filtro de qualidades */}
              {availableQualities.length > 0 && (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-2">
                        <h2 className="text-sm font-medium text-gray-800 dark:text-gray-200">
                          Qualidade
                        </h2>
                        <Popover>
                          <PopoverTrigger>
                            <Info className="h-4 w-4 text-gray-400 hover:text-blue-500 transition-colors cursor-help dark:text-gray-500 dark:hover:text-blue-400" />
                          </PopoverTrigger>
                          <PopoverContent className="w-80 p-4 text-sm dark:bg-gray-800 dark:border-gray-700">
                            <div className="space-y-2">
                              <p className="font-medium dark:text-gray-200">
                                SELECT
                              </p>
                              <p className="text-gray-600 dark:text-gray-400">
                                Com componentes de alta qualidade, brilho 300 a
                                500 lumens, alta resolução HD+/FHD
                              </p>

                              <p className="font-medium dark:text-gray-200">
                                PREMIER
                              </p>
                              <p className="text-gray-600 dark:text-gray-400">
                                Brilho 300 a 500 lumens, alta resolução HD+/FHD,
                                flex e CI igual ao peça genuína
                              </p>

                              <p className="font-medium dark:text-gray-200">
                                PREMIER/SELECT MAX
                              </p>
                              <p className="text-gray-600 dark:text-gray-400">
                                Brilho chegando 500 lumens, alta resolução
                                HD++/FHD, flex e CI igual ao peça genuína. O MAX
                                tem maior saturação de cores e brilho mais alto.
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
                        <span className="text-xs font-medium text-white bg-blue-500 px-2 py-1 rounded-full">
                          {selectedQualities.length}
                        </span>
                      )}
                    </div>
                    {selectedQualities.length > 0 && (
                      <button
                        onClick={handleClearQualityFilter}
                        className="text-xs text-gray-500 hover:text-gray-800 transition-colors duration-200 underline decoration-dotted dark:text-gray-400 dark:hover:text-gray-200"
                      >
                        Limpar seleção
                      </button>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {availableQualities.map((quality) => (
                      <Badge
                        key={quality}
                        variant="outline"
                        className={`
                          cursor-pointer 
                          text-xs
                          py-2
                          px-4
                          rounded-xl
                          border-2
                          transition-all
                          duration-200
                          font-medium
                          ${
                            selectedQualities.includes(quality)
                              ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white border-transparent shadow-md hover:shadow-lg'
                              : 'bg-background text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-600 hover:shadow-sm hover:bg-blue-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:border-blue-400 dark:hover:text-blue-400 dark:hover:bg-gray-700'
                          }
                        `}
                        onClick={(e) => handleSelectQuality(quality, e)}
                      >
                        {quality}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Novo filtro de promoção */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-medium text-gray-800 dark:text-gray-200">
                      Promoção
                    </h2>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                        >
                          <Info className="h-3 w-3" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-80 p-4">
                        <div className="space-y-2">
                          <h4 className="font-medium text-sm">
                            Produtos em Promoção
                          </h4>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            Mostra apenas produtos em promoção.
                          </p>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge
                    variant="outline"
                    className={`
                      cursor-pointer 
                      text-xs
                      py-2
                      px-4
                      rounded-xl
                      border-2
                      transition-all
                      duration-200
                      font-semibold
                      shadow-sm
                      ${
                        showPromocaoOnly
                          ? 'bg-blue-600 text-white border-blue-700 shadow-md'
                          : 'bg-white text-blue-700 border-blue-300 hover:bg-blue-50 hover:text-blue-800 hover:border-blue-400 dark:bg-gray-900 dark:text-blue-300 dark:border-blue-700 dark:hover:bg-gray-800 dark:hover:text-blue-200'
                      }
                    `}
                    onClick={handleTogglePromocao}
                  >
                    🔥 Promoção
                  </Badge>
                </div>
              </div>
            </div>
          )}

        {/* Botão para selecionar 1 de cada modelo */}
        <div className="mt-8 mb-6">
          <Button
            variant="outline"
            size="default"
            onClick={handleSelectOneOfEachModel}
            className="flex items-center gap-3 h-12 px-6 text-sm font-medium text-gray-700 bg-background border-2 border-gray-200 hover:bg-gray-50 hover:text-gray-900 hover:border-blue-300 hover:shadow-md transition-all duration-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-100 dark:hover:border-blue-400"
          >
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
            </span>
            Selecionar 1 de cada modelo
          </Button>
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
