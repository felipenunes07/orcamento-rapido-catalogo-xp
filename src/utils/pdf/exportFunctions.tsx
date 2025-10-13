
import React from 'react'
import { pdf } from '@react-pdf/renderer'
import { CartItem, Product } from '../../types'
import PdfOrcamento from './PdfOrcamento'
import { formatCurrency } from '../formatters'
import * as XLSX from 'xlsx'
import { saveQuote, getShareableQuoteLink } from '../../services/quoteService'
import { toast } from '@/components/ui/sonner'
import { fetchProducts, fetchCodePriceMapping } from '../../services/sheetService'

// Função para baixar o PDF
export const downloadPdf = async (items: CartItem[]): Promise<void> => {
  const quote = await saveQuote(items);
  const filename = `orcamento-${quote.number}-${new Date().toISOString().split('T')[0]}.pdf`;
  
  const blob = await pdf(<PdfOrcamento items={items} quoteNumber={quote.number} />).toBlob()
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
  
  toast.success(`Orçamento #${quote.number} salvo e baixado`);
}

// Função para compartilhar via WhatsApp
export const shareCompleteQuote = async (items: CartItem[]): Promise<void> => {
  const quote = await saveQuote(items);
  
  let message = `📋 *Orçamento #${quote.number} - Catálogo Orçamento Fácil* 📋\n\n`;

  // Add items to the message
  items.forEach((item) => {
    const unitPrice = item.product.promocao && item.product.promocao > 0
      ? Math.min(item.product.valor, item.product.promocao)
      : item.product.valor
    message += `*${item.product.modelo} ${item.product.cor}* (${item.product.qualidade})\n`;
    message += `${item.quantity}x ${formatCurrency(
      unitPrice
    )} = ${formatCurrency(unitPrice * item.quantity)}\n\n`;
  });

  // Add total
  const total = items.reduce((sum, item) => {
    const unitPrice = item.product.promocao && item.product.promocao > 0
      ? Math.min(item.product.valor, item.product.promocao)
      : item.product.valor
    return sum + unitPrice * item.quantity
  }, 0);
  message += `*Total: ${formatCurrency(total)}*\n\n`;

  // Adicionar link do Excel se disponível
  if (quote.excelLink) {
    message += `\nAcesse o orçamento em Excel através do link:\n${quote.excelLink}\n`;
  }

  // URL encode the message
  const encodedMessage = encodeURIComponent(message);
  
  // Detectar o navegador e dispositivo
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
  const isAndroid = /Android/.test(navigator.userAgent);
  const isMobile = isIOS || isAndroid || /webOS|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  
  // Criar URL do WhatsApp com base no dispositivo e navegador
  let whatsappUrl;
  
  if (isIOS) {
    // Usando link universal wa.me para melhor compatibilidade com Safari/iOS
    whatsappUrl = `https://wa.me/?text=${encodedMessage}`;
  } else if (isAndroid) {
    // Android pode usar ambos os formatos, mas este é mais confiável
    whatsappUrl = `whatsapp://send?text=${encodedMessage}`;
  } else if (isMobile) { // Catches other mobile OS if any, or if isIOS/isAndroid checks are too specific
    whatsappUrl = `whatsapp://send?text=${encodedMessage}`;
  } else {
    // Desktop (Web WhatsApp)
    whatsappUrl = `https://web.whatsapp.com/send?text=${encodedMessage}`;
  }

  // Tentar abrir o WhatsApp - Versão melhorada para PWA
  try {
    // Verificar se o navegador suporta Web Share API (melhor para PWA)
    if (navigator.share && isMobile) {
      try {
        await navigator.share({
          title: `Orçamento #${quote.number} - Catálogo Orçamento Fácil`,
          text: message
        });
        toast.success(`Orçamento #${quote.number} salvo e compartilhado`);
        return;
      } catch (shareError) {
        console.log('Share API falhou, usando método alternativo', shareError);
        // Continua para os métodos alternativos abaixo
      }
    }
    
    // Método específico para PWA em Android
    if (isAndroid && window.matchMedia('(display-mode: standalone)').matches) {
      // Intent URL para Android quando em modo PWA
      const intentUrl = `intent://send?text=${encodedMessage}#Intent;package=com.whatsapp;scheme=whatsapp;end`;
      window.location.href = intentUrl;
      toast.success(`Orçamento #${quote.number} salvo e compartilhado`);
    }
    // iOS em PWA ou navegador normal
    else if (isIOS) {
      // Forçar abertura em nova janela para iOS
      const newWindow = window.open(whatsappUrl, '_system');
      if (!newWindow) {
        window.location.href = whatsappUrl;
      }
      toast.success(`Orçamento #${quote.number} salvo e compartilhado`);
    } 
    // Outros dispositivos e desktop
    else {
      // Tentar abrir em nova janela com foco
      const newWindow = window.open(whatsappUrl, '_blank');
      
      // Verificar se a janela foi bloqueada ou não abriu
      if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
        // Fallback para URL universal
        toast.error('Não foi possível abrir o WhatsApp automaticamente. Tentando método alternativo...', { duration: 3000 });
        
        // Tentar método alternativo após pequeno atraso
        setTimeout(() => {
          // Criar um link temporário e simular clique
          const a = document.createElement('a');
          a.href = whatsappUrl;
          a.setAttribute('target', '_blank');
          a.setAttribute('rel', 'noopener noreferrer');
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        }, 1000);
      } else {
        toast.success(`Orçamento #${quote.number} salvo e compartilhado`);
      }
    }
  } catch (error) {
    console.error('Erro ao abrir WhatsApp:', error);
    toast.error('Erro ao abrir WhatsApp. Tente novamente ou use o aplicativo diretamente.');
    
    // Último recurso - mostrar link clicável
    toast.message(
      <div>
        <p>Clique no link abaixo para compartilhar:</p>
        <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" 
           style={{color: 'blue', textDecoration: 'underline'}}>
          Abrir WhatsApp
        </a>
      </div>,
      { duration: 10000 }
    );
  }
}

// Função para baixar como Excel
export const downloadExcel = async (items: CartItem[]): Promise<void> => {
  const quote = await saveQuote(items);
  const filename = quote.excelFilename;
  
  const wsData = [
    ['Orçamento #', quote.number.toString()],
    ['Data', new Date().toLocaleDateString('pt-BR')],
    [''],
    ['Produto', 'Cor', 'Qualidade', 'Valor Unitário', 'Quantidade', 'Subtotal'],
    ...items.map((item) => {
      const unitPrice = item.product.promocao && item.product.promocao > 0
        ? Math.min(item.product.valor, item.product.promocao)
        : item.product.valor
      return [
        item.product.modelo,
        item.product.cor,
        item.product.qualidade,
        unitPrice,
        item.quantity,
        unitPrice * item.quantity,
      ]
    }),
  ];
  const ws = XLSX.utils.aoa_to_sheet(wsData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Orçamento');
  XLSX.writeFile(wb, filename);
  
  toast.success(`Orçamento #${quote.number} salvo e baixado em Excel`);
}

// Função para baixar o catálogo completo em Excel
export const downloadCatalogExcel = async (code?: string): Promise<void> => {
  try {
    // Buscar todos os produtos do catálogo
    let products = await fetchProducts();
    
    // Filtrar apenas produtos ativos/estoque
    const isActive = (ativo?: string) => {
      const val = (ativo || '').normalize('NFD').replace(/\p{Diacritic}/gu, '').trim().toUpperCase()
      return val === 'S' || val === 'ULTIMAS UNIDADES' || !ativo
    }
    products = products.filter((p) => isActive(p.ativo))

    // Se houver código, aplicar a coluna de preço correspondente
    const normalizedCode = normalizeKey(code || '')
    if (normalizedCode) {
      try {
        const mapping = await fetchCodePriceMapping()
        const ref = mapping[normalizedCode]
        if (ref) {
          const headers = Object.keys(products[0]?.allColumns || {})
          const percentMatch = ref.match(/^\s*(-?\d+(?:[\.,]\d+)?)\s*%\s*$/)
          if (percentMatch) {
            const percent = parseFloat(percentMatch[1].replace(',', '.'))
            const byHeader = findHeaderForRef(headers, ref)
            if (byHeader) {
              products = products.map((p) => {
                const cell = (p.allColumns || {})[byHeader] || ''
                const parsed = normalizeCurrencyToNumber(cell)
                return { ...p, valor: parsed !== null ? parsed : p.valor }
              })
            } else {
              const priceHeaders = getPriceHeaders(headers)
              const baseHeader = priceHeaders[0] || findHeaderForRef(headers, 'valor')
              if (baseHeader) {
                const factor = 1 - percent / 100
                products = products.map((p) => {
                  const baseCell = (p.allColumns || {})[baseHeader] || ''
                  const baseParsed = normalizeCurrencyToNumber(baseCell)
                  if (baseParsed === null) return p
                  const adjusted = Math.max(0, baseParsed * factor)
                  return { ...p, valor: adjusted }
                })
              }
            }
          } else {
            const idx = parseInt(ref, 10)
            const headersForIdx = getPriceHeaders(headers)
            if (!Number.isNaN(idx) && headersForIdx.length > 0) {
              const resolvedIndex = idx >= 0 ? idx : headersForIdx.length + idx
              const headerToUse = headersForIdx[resolvedIndex] || headersForIdx[0]
              products = products.map((p) => {
                const cell = (p.allColumns || {})[headerToUse] || ''
                const parsed = normalizeCurrencyToNumber(cell)
                return { ...p, valor: parsed !== null ? parsed : p.valor }
              })
            } else {
              const headerToUse = findHeaderForRef(headers, ref)
              if (headerToUse) {
                products = products.map((p) => {
                  const cell = (p.allColumns || {})[headerToUse] || ''
                  const parsed = normalizeCurrencyToNumber(cell)
                  return { ...p, valor: parsed !== null ? parsed : p.valor }
                })
              }
            }
          }
        }
      } catch (e) {
        console.warn('Falha ao aplicar código no Excel, usando preço base:', e)
      }
    }
    
    // Nome do arquivo
    const filename = `catalogo-orcamento-facil-${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}.xlsx`;
    
    // Preparar dados para o Excel
    const wsData = [
      ['CATÁLOGO - APP ORÇAMENTO FÁCIL'],
      ['Data de exportação', new Date().toLocaleDateString('pt-BR')],
      [''],
      ['SKU', 'Modelo', 'Cor', 'Qualidade', 'Valor'],
      ...products.map((product) => {
        const unitPrice = product.promocao && product.promocao > 0
          ? Math.min(product.valor, product.promocao)
          : product.valor
        return [
          product.sku,
          product.modelo,
          product.cor,
          product.qualidade,
          unitPrice,
        ]
      }),
    ];
    
    // Criar planilha
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'CATÁLOGO');
    
    // Aplicar estilos (cabeçalhos em negrito)
    const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const cell = ws[XLSX.utils.encode_cell({ r: 3, c: C })];
      if (!cell) continue;
      cell.s = { font: { bold: true } };
    }
    
    // Título em negrito e maior
    const titleCell = ws[XLSX.utils.encode_cell({ r: 0, c: 0 })];
    if (titleCell) {
      titleCell.s = { font: { bold: true, sz: 14 } };
    }
    
    // Baixar arquivo
    XLSX.writeFile(wb, filename);
    
    toast.success('Catálogo exportado com sucesso para Excel');
  } catch (error) {
    console.error('Erro ao exportar catálogo:', error);
    toast.error('Erro ao exportar catálogo. Tente novamente.');
  }
}

// Helpers replicados para processar colunas de preço
function normalizeKey(value: string): string {
  return value.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().trim()
}

function normalizeHeader(value: string): string {
  return normalizeKey(value)
}

function findHeaderForRef(headers: string[], ref: string): string | null {
  if (!headers || headers.length === 0) return null
  const nRef = normalizeKey(ref)
  const exact = headers.find((h) => normalizeHeader(h) === nRef)
  if (exact) return exact
  const containsOnValor = headers.find((h) => {
    const nh = normalizeHeader(h)
    return nh.includes('valor') && nh.includes(nRef)
  })
  if (containsOnValor) return containsOnValor
  const anyContains = headers.find((h) => normalizeHeader(h).includes(nRef))
  if (anyContains) return anyContains
  return null
}

function getPriceHeaders(headers: string[]): string[] {
  const normalized = headers.map((h) => ({ h, n: normalizeHeader(h) }))
  return normalized
    .filter((x) => x.n.includes('valor') || x.n.includes('preco') || x.n.includes('preço'))
    .map((x) => x.h)
}

function normalizeCurrencyToNumber(input: string | undefined | null): number | null {
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

// Função para compartilhar Excel via WhatsApp
export const shareExcelViaWhatsApp = async (items: CartItem[]): Promise<void> => {
  const quote = await saveQuote(items);

  // Detectar o navegador e dispositivo (movido para o topo da função para uso em ambos os blocos)
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
  const isAndroid = /Android/.test(navigator.userAgent);
  const isMobile = isIOS || isAndroid || /webOS|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  
  if (quote.excelLink) {
    // Criamos uma mensagem com o link direto para o arquivo Excel
    let message = `📋 *Orçamento #${quote.number} - Catálogo Orçamento Fácil* 📋\n\n`;
    message += `Segue o link do orçamento em formato Excel:\n\n`;
    message += quote.excelLink;
    message += `\n\n*Total: ${formatCurrency(quote.total)}*`;

    // URL encode the message
    const encodedMessage = encodeURIComponent(message);
    
    // Criar URL do WhatsApp com base no dispositivo e navegador
    let whatsappUrl;
    if (isIOS) {
      whatsappUrl = `https://wa.me/?text=${encodedMessage}`;
    } else if (isAndroid) {
      whatsappUrl = `whatsapp://send?text=${encodedMessage}`;
    } else if (isMobile) {
      whatsappUrl = `whatsapp://send?text=${encodedMessage}`;
    } else { // Desktop (Web WhatsApp)
      whatsappUrl = `https://web.whatsapp.com/send?text=${encodedMessage}`;
    }

    // Tentar abrir o WhatsApp - Versão melhorada para PWA
  try {
    // Verificar se o navegador suporta Web Share API (melhor para PWA)
    if (navigator.share && isMobile) {
      try {
        await navigator.share({
          title: `Orçamento #${quote.number} - Catálogo Orçamento Fácil`,
          text: message
        });
        toast.success(`Orçamento #${quote.number} salvo e link do Excel gerado.`);
        return;
      } catch (shareError) {
        console.log('Share API falhou, usando método alternativo', shareError);
        // Continua para os métodos alternativos abaixo
      }
    }
    
    // Método específico para PWA em Android
    if (isAndroid && window.matchMedia('(display-mode: standalone)').matches) {
      // Intent URL para Android quando em modo PWA
      const intentUrl = `intent://send?text=${encodedMessage}#Intent;package=com.whatsapp;scheme=whatsapp;end`;
      window.location.href = intentUrl;
      toast.success(`Orçamento #${quote.number} salvo e link do Excel gerado.`);
    }
    // iOS em PWA ou navegador normal
    else if (isIOS) {
      // Forçar abertura em nova janela para iOS
      const newWindow = window.open(whatsappUrl, '_system');
      if (!newWindow) {
        window.location.href = whatsappUrl;
      }
      toast.success(`Orçamento #${quote.number} salvo e link do Excel gerado.`);
    } 
    // Outros dispositivos e desktop
    else {
      // Tentar abrir em nova janela com foco
      const newWindow = window.open(whatsappUrl, '_blank');
      
      // Verificar se a janela foi bloqueada ou não abriu
      if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
        // Fallback para URL universal
        toast.error('Não foi possível abrir o WhatsApp automaticamente. Tentando método alternativo...', { duration: 3000 });
        
        // Tentar método alternativo após pequeno atraso
        setTimeout(() => {
          // Criar um link temporário e simular clique
          const a = document.createElement('a');
          a.href = whatsappUrl;
          a.setAttribute('target', '_blank');
          a.setAttribute('rel', 'noopener noreferrer');
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        }, 1000);
      } else {
        toast.success(`Orçamento #${quote.number} salvo e link do Excel gerado.`);
      }
    }
  } catch (error) {
    console.error('Erro ao abrir WhatsApp:', error);
    toast.error('Erro ao abrir WhatsApp. Tente novamente ou use o aplicativo diretamente.');
    
    // Último recurso - mostrar link clicável
    toast.message(
      <div>
        <p>Clique no link abaixo para compartilhar:</p>
        <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" 
           style={{color: 'blue', textDecoration: 'underline'}}>
          Abrir WhatsApp
        </a>
      </div>,
      { duration: 10000 }
    );
  }
  } else {
    // Fallback para o método antigo se não houver link do Excel
    const filename = quote.excelFilename;
    
    const wsData = [
      ['Orçamento #', quote.number.toString()],
      ['Data', new Date().toLocaleDateString('pt-BR')],
      [''],
      ['Produto', 'Cor', 'Qualidade', 'Valor Unitário', 'Quantidade', 'Subtotal'],
      ...items.map((item) => [
        item.product.modelo,
        item.product.cor,
        item.product.qualidade,
        item.product.valor,
        item.quantity,
        item.product.valor * item.quantity,
      ]),
    ];
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Orçamento');
    XLSX.writeFile(wb, filename);

    let whatsappMessageInstruction = '';
    let toastMessageInstruction = '';

    if (isMobile) {
      whatsappMessageInstruction = `O arquivo Excel "${filename}" foi baixado em seu dispositivo. Por favor, localize-o na pasta de downloads e anexe-o a esta conversa.\n\n`;
      toastMessageInstruction = `Orçamento #${quote.number} salvo e baixado. No WhatsApp, anexe o arquivo "${filename}" da sua pasta de downloads.`;
    } else { // Desktop
      whatsappMessageInstruction = `O arquivo Excel "${filename}" foi baixado em seu computador. Por favor, anexe-o a esta conversa no WhatsApp Web (você pode arrastar e soltar o arquivo ou usar o botão de anexo).\n\n`;
      toastMessageInstruction = `Orçamento #${quote.number} salvo e baixado. No WhatsApp Web, anexe o arquivo "${filename}" (geralmente na pasta Downloads).`;
    }

    let message = `📋 *Orçamento #${quote.number} - Catálogo Orçamento Fácil* 📋\n\n`;
    message += whatsappMessageInstruction; // Usar a instrução personalizada
    message += `*Total: ${formatCurrency(quote.total)}*`;

    const encodedMessage = encodeURIComponent(message);
    
    let whatsappUrl;
    if (isIOS) {
      whatsappUrl = `https://wa.me/?text=${encodedMessage}`;
    } else if (isAndroid) {
      whatsappUrl = `whatsapp://send?text=${encodedMessage}`;
    } else if (isMobile) {
      whatsappUrl = `whatsapp://send?text=${encodedMessage}`;
    } else { // Desktop
      whatsappUrl = `https://web.whatsapp.com/send?text=${encodedMessage}`;
    }

    try {
      if (isIOS) {
        window.location.href = whatsappUrl;
        toast.success(toastMessageInstruction, { duration: 5000 }); // Usar a instrução de toast personalizada
      } else { 
        const newWindow = window.open(whatsappUrl, '_blank');
        if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
          toast.error('Não foi possível abrir o WhatsApp automaticamente. Tente o link alternativo.', { duration: 5000 });
          setTimeout(() => {
            window.open('https://web.whatsapp.com/', '_blank');
          }, 1500);
        } else {
          toast.success(toastMessageInstruction, { duration: 5000 }); // Usar a instrução de toast personalizada
        }
      }
    } catch (error) {
      console.error('Erro ao abrir WhatsApp:', error);
      toast.error('Erro ao abrir WhatsApp. Tente novamente ou use o aplicativo diretamente.');
    }
  }
}
