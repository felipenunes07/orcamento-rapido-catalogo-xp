
import { Product } from '../../src/types'
import { useIsMobile } from '../../src/hooks/use-mobile'

type Modelo = Pick<Product, 'id' | 'modelo' | 'cor'>

interface TabelaDeModelosProps {
  modelos: Modelo[]
  onRowClick?: (modelo: Modelo) => void
}

export function TabelaDeModelos({ modelos, onRowClick }: TabelaDeModelosProps) {
  const isMobile = useIsMobile()
  
  // Versão para dispositivos móveis
  if (isMobile) {
    return (
      <div className="space-y-3 w-full">
        {modelos.map((modelo) => (
          <div 
            key={modelo.id}
            onClick={() => onRowClick?.(modelo)}
            className="bg-white p-3 rounded-lg shadow-sm border cursor-pointer hover:bg-gray-50 transition-colors"
            role="button"
            tabIndex={0}
            onKeyPress={(e) => e.key === 'Enter' && onRowClick?.(modelo)}
          >
            <div className="grid grid-cols-2 gap-2">
              <div className="font-medium text-gray-500">Modelo:</div>
              <div className="text-gray-900">{modelo.modelo}</div>
              
              <div className="font-medium text-gray-500">Cor:</div>
              <div className="text-gray-900">{modelo.cor}</div>
            </div>
          </div>
        ))}
      </div>
    )
  }
  
  // Versão para desktop
  return (
    <div className="overflow-x-auto w-full">
      <table className="min-w-full table-auto border-collapse bg-white shadow-sm rounded-lg">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Modelo
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Cor
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {modelos.map((modelo) => (
            <tr
              key={modelo.id}
              onClick={() => onRowClick?.(modelo)}
              className="hover:bg-gray-50 cursor-pointer transition-colors duration-150 ease-in-out"
              role="button"
              tabIndex={0}
              onKeyPress={(e) => e.key === 'Enter' && onRowClick?.(modelo)}
            >
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {modelo.modelo}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {modelo.cor}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
