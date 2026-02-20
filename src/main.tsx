import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { registerServiceWorkerWithUpdates } from './utils/swUpdates'
import { initDataFast } from 'datafast'

initDataFast({
  websiteId: 'dfid_uJsawYlsQKY0ZSDuamt2e',
}).catch(console.error);

// Error boundary para capturar erros de renderização
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Erro capturado pelo Error Boundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
            padding: '20px',
            textAlign: 'center',
            fontFamily: 'system-ui, -apple-system, sans-serif',
          }}
        >
          <h1 style={{ fontSize: '24px', marginBottom: '16px' }}>
            Ops! Algo deu errado 😕
          </h1>
          <p style={{ marginBottom: '24px', color: '#666' }}>
            Tente recarregar a página
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '12px 24px',
              backgroundColor: '#000',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
            }}
          >
            Recarregar Página
          </button>
          {this.state.error && (
            <details
              style={{
                marginTop: '24px',
                textAlign: 'left',
                maxWidth: '600px',
              }}
            >
              <summary style={{ cursor: 'pointer', marginBottom: '8px' }}>
                Detalhes técnicos
              </summary>
              <pre
                style={{
                  padding: '12px',
                  backgroundColor: '#f5f5f5',
                  borderRadius: '4px',
                  overflow: 'auto',
                  fontSize: '12px',
                }}
              >
                {this.state.error.toString()}
              </pre>
            </details>
          )}
        </div>
      )
    }

    return this.props.children
  }
}

const rootElement = document.getElementById('root')

if (!rootElement) {
  document.body.innerHTML = `
    <div style="display: flex; align-items: center; justify-content: center; height: 100vh; font-family: system-ui;">
      <div style="text-align: center;">
        <h1>Erro ao carregar a aplicação</h1>
        <p>Elemento 'root' não encontrado</p>
        <button onclick="window.location.reload()" style="padding: 12px 24px; background: #000; color: #fff; border: none; border-radius: 8px; cursor: pointer; margin-top: 16px;">
          Recarregar
        </button>
      </div>
    </div>
  `
  throw new Error('Elemento root não encontrado no DOM')
}

console.log('[App] Iniciando renderização do React...')

createRoot(rootElement).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
)

console.log('[App] React renderizado com sucesso')

// Registrar SW e exibir toast quando houver nova versão
registerServiceWorkerWithUpdates()
