export const formatCurrency = (value: number): string => {
  // Garantindo que o valor seja tratado corretamente como número
  const numericValue = Number(value)
  
  // Log para depuração
  console.log('Formatando valor monetário:', value, typeof value)
  
  // Verificando se o valor é válido
  if (isNaN(numericValue)) {
    console.warn('Valor inválido para formatação de moeda:', value)
    return 'R$ 0,00'
  }

  try {
    // Usando o Intl.NumberFormat com configurações específicas para o formato brasileiro
    const formatted = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numericValue)
    
    console.log('Valor formatado:', formatted)
    return formatted
  } catch (error) {
    console.error('Erro ao formatar valor monetário:', error)
    // Fallback manual para formatação
    return `R$ ${numericValue.toFixed(2).replace('.', ',')}`
  }
}

export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('pt-BR').format(date)
}
