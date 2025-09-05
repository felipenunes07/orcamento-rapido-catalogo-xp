import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import Layout from '../components/layout/Layout'

const HomePage: React.FC = () => {
  const [showPwaPrompt, setShowPwaPrompt] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [showManualInstructions, setShowManualInstructions] = useState(false)
  const [platform, setPlatform] = useState<'ios' | 'android' | 'desktop'>(
    'desktop'
  )

  useEffect(() => {
    // Detectar plataforma
    const userAgent = navigator.userAgent.toLowerCase()
    if (/iphone|ipad|ipod/.test(userAgent)) {
      setPlatform('ios')
    } else if (/android/.test(userAgent)) {
      setPlatform('android')
    } else {
      setPlatform('desktop')
    }

    // Verificar se o app já está instalado
    const isAppInstalled = () => {
      console.log('[PWA] Verificando se app já está instalado...')
      console.log('[PWA] URL atual:', window.location.href)
      console.log('[PWA] User Agent:', navigator.userAgent)
      console.log('[PWA] Platform:', platform)

      // Verificar se está em modo standalone (app instalado)
      if (window.matchMedia('(display-mode: standalone)').matches) {
        console.log('[PWA] App já está instalado (display-mode: standalone)')
        return true
      }

      // Verificar se está em modo fullscreen (app instalado)
      if (window.matchMedia('(display-mode: fullscreen)').matches) {
        console.log('[PWA] App já está instalado (display-mode: fullscreen)')
        return true
      }

      // Verificar se está em modo minimal-ui (app instalado)
      if (window.matchMedia('(display-mode: minimal-ui)').matches) {
        console.log('[PWA] App já está instalado (display-mode: minimal-ui)')
        return true
      }

      // Verificação específica para iOS (navigator.standalone)
      if (
        'standalone' in window.navigator &&
        (window.navigator as any).standalone
      ) {
        console.log('[PWA] App já está instalado (iOS standalone)')
        return true
      }

      // Verificação específica para desktop - se está sendo executado como app
      if (platform === 'desktop') {
        // Verificar se a janela não tem barra de endereços (modo app)
        if (window.outerHeight === window.innerHeight) {
          console.log(
            '[PWA] App já está instalado (desktop - sem barra de endereços)'
          )
          return true
        }

        // Verificar se está sendo executado como app via protocolo
        if (
          window.location.protocol === 'chrome-extension:' ||
          window.location.protocol === 'moz-extension:' ||
          window.location.protocol === 'ms-browser-extension:'
        ) {
          console.log('[PWA] App já está instalado (desktop - extensão)')
          return true
        }
      }

      // Verificar se há cookie/localStorage indicando instalação
      const installationCookie = localStorage.getItem('pwa-installed')
      if (installationCookie) {
        console.log(
          '[PWA] App já foi instalado anteriormente (localStorage encontrado)'
        )
        return true
      }

      // Verificar se está sendo executado como app (URL não contém http/https)
      if (
        window.location.protocol === 'file:' ||
        window.location.hostname === 'localhost'
      ) {
        console.log('[PWA] Executando localmente, permitindo popup')
      } else if (
        window.location.href.includes('chrome-extension://') ||
        window.location.href.includes('moz-extension://')
      ) {
        console.log('[PWA] Executando como extensão, pulando popup')
        return true
      }

      // Verificar se a URL indica que está sendo executado como PWA
      if (
        window.location.href.includes('?pwa=true') ||
        window.location.href.includes('&pwa=true') ||
        window.location.pathname.includes('/app/')
      ) {
        console.log('[PWA] Detectado modo PWA via URL, pulando popup')
        return true
      }

      // Verificação adicional para desktop - se está sendo executado como app instalado
      if (platform === 'desktop' && window.location.hostname !== 'localhost') {
        // Verificar se não há elementos de navegador visíveis
        const hasAddressBar = window.outerHeight > window.innerHeight
        const hasScrollbars =
          document.documentElement.scrollHeight > window.innerHeight

        if (!hasAddressBar && !hasScrollbars) {
          console.log(
            '[PWA] App já está instalado (desktop - modo app detectado)'
          )
          return true
        }
      }

      console.log('[PWA] App não detectado como instalado, permitindo popup')
      return false
    }

    // Se já está instalado, não mostrar popup
    if (isAppInstalled()) {
      console.log('[PWA] App já instalado, pulando popup de instalação')
      return
    }

    // Verificação adicional: se a URL indica que está sendo executado como app
    const urlParams = new URLSearchParams(window.location.search)
    const isPwaMode =
      urlParams.get('pwa') === 'true' ||
      window.location.pathname.includes('/app') ||
      document.referrer.includes('chrome-extension://')

    if (isPwaMode) {
      console.log('[PWA] Detectado modo PWA via URL, pulando popup')
      return
    }

    // Verificação adicional para desktop - detectar se está sendo executado como app
    if (platform === 'desktop') {
      // Verificar se o referrer indica que veio de um app instalado
      if (
        document.referrer &&
        (document.referrer.includes('chrome-extension://') ||
          document.referrer.includes('moz-extension://') ||
          document.referrer.includes('ms-browser-extension://') ||
          document.referrer.includes('app://'))
      ) {
        console.log(
          '[PWA] Desktop: Detectado referrer de app instalado, pulando popup'
        )
        return
      }

      // Verificar se há indicadores de que está sendo executado como app
      const isRunningAsApp =
        window.location.protocol === 'chrome-extension:' ||
        window.location.protocol === 'moz-extension:' ||
        window.location.protocol === 'ms-browser-extension:' ||
        window.location.protocol === 'app:' ||
        window.location.href.includes('?source=app') ||
        window.location.href.includes('&source=app')

      if (isRunningAsApp) {
        console.log('[PWA] Desktop: Detectado execução como app, pulando popup')
        return
      }
    }

    let promptEvent: any = null
    function beforeInstallHandler(e: any) {
      e.preventDefault()
      promptEvent = e
      setDeferredPrompt(e)
      console.log('[PWA] beforeinstallprompt capturado')
      setTimeout(() => {
        setShowPwaPrompt(true)
        console.log('[PWA] Popup de instalação exibido')
      }, 2000)
    }
    window.addEventListener('beforeinstallprompt', beforeInstallHandler)
    // Forçar exibir o popup mesmo se o evento não disparar (debug)
    setTimeout(() => {
      if (!promptEvent) {
        setShowPwaPrompt(true)
        console.log('[PWA] Forçando popup de instalação (sem evento)')
      }
    }, 2000)
    return () => {
      window.removeEventListener('beforeinstallprompt', beforeInstallHandler)
    }
  }, [])

  const handleInstallClick = async () => {
    console.log('[PWA] Tentando instalação automática...')

    if (deferredPrompt) {
      try {
        console.log('[PWA] Prompt disponível, executando...')
        deferredPrompt.prompt()

        const { outcome } = await deferredPrompt.userChoice
        console.log('[PWA] Resultado do usuário:', outcome)

        if (outcome === 'accepted') {
          console.log('[PWA] Instalação aceita pelo usuário')
          // Salvar no localStorage que o app foi instalado
          localStorage.setItem('pwa-installed', 'true')
          alert(
            '✅ App instalado com sucesso! Procure o ícone na sua tela inicial.'
          )
          setShowPwaPrompt(false)
        } else {
          console.log('[PWA] Instalação rejeitada pelo usuário')
          alert(
            '❌ Instalação cancelada. Você pode instalar manualmente seguindo as instruções.'
          )
          setShowManualInstructions(true)
        }
      } catch (error) {
        console.error('[PWA] Erro na instalação automática:', error)
        alert('⚠️ Instalação automática falhou. Mostrando instruções manuais.')
        setShowManualInstructions(true)
      }
    } else {
      console.log(
        '[PWA] Instalação automática não suportada neste navegador/dispositivo'
      )
      setShowManualInstructions(true)
    }
  }

  const handleClose = () => {
    setShowPwaPrompt(false)
    setShowManualInstructions(false)
    console.log('[PWA] Popup fechado pelo usuário')
  }

  const getManualInstructions = () => {
    switch (platform) {
      case 'ios':
        return {
          title: 'Como instalar no iPhone/iPad',
          steps: [
            'Toque no botão "Compartilhar" (ícone quadrado com seta)',
            'Role para baixo e toque em "Adicionar à Tela Inicial"',
            'Toque em "Adicionar" no canto superior direito',
          ],
          iconHint:
            'Procure o ícone quadrado com seta para cima na barra inferior',
        }
      case 'android':
        return {
          title: 'Como instalar no Android',
          steps: [
            'Toque no menu (três pontos) no canto superior direito',
            'Selecione "Adicionar à tela inicial" ou "Instalar app"',
            'Confirme a instalação',
          ],
          iconHint:
            'Procure os três pontos verticais no canto superior direito',
        }
      default:
        return {
          title: 'Como instalar no Desktop',
          steps: [
            'Clique no ícone de instalação na barra de endereços (ícone +)',
            'Ou clique no menu (três pontos) > "Instalar [Nome do App]"',
            'Confirme a instalação',
          ],
          iconHint:
            'Procure o ícone + na barra de endereços ou três pontos no menu',
        }
    }
  }

  const instructions = getManualInstructions()

  return (
    <>
      <Layout>
        <div className="container-custom py-8">
          <div className="max-w-3xl mx-auto">
            <section className="mb-12 text-center">
              <h1 className="text-3xl sm:text-4xl font-bold mb-4">
                Catálogo Orçamento Fácil
              </h1>
              <p className="text-lg mb-8 text-muted-foreground">
                Crie orçamentos rápidos e simples
              </p>
              <Button asChild size="lg" className="btn-accent">
                <Link to="/catalogo">Ver Catálogo</Link>
              </Button>
            </section>

            <section className="bg-muted p-6 rounded-lg">
              <h2 className="text-xl font-semibold mb-4">Como funciona:</h2>

              <div className="space-y-4">
                <div className="bg-white p-4 rounded-md shadow-sm">
                  <h3 className="font-semibold mb-2 flex items-center">
                    <span className="bg-accent text-white rounded-full w-6 h-6 inline-flex items-center justify-center mr-2">
                      1
                    </span>
                    Navegue pelo catálogo
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    Explore todos os produtos disponíveis com seus preços
                    atualizados.
                  </p>
                </div>

                <div className="bg-white p-4 rounded-md shadow-sm">
                  <h3 className="font-semibold mb-2 flex items-center">
                    <span className="bg-accent text-white rounded-full w-6 h-6 inline-flex items-center justify-center mr-2">
                      2
                    </span>
                    Selecione as quantidades
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    Adicione os produtos desejados e defina a quantidade de cada
                    item.
                  </p>
                </div>

                <div className="bg-white p-4 rounded-md shadow-sm">
                  <h3 className="font-semibold mb-2 flex items-center">
                    <span className="bg-accent text-white rounded-full w-6 h-6 inline-flex items-center justify-center mr-2">
                      3
                    </span>
                    Finalize o orçamento
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    Revise o orçamento, e compartilhe via WhatsApp.
                  </p>
                </div>
              </div>
            </section>

            <div className="mt-8 text-center">
              <Button asChild size="lg" className="btn-accent">
                <Link to="/catalogo">Começar Agora</Link>
              </Button>
            </div>
          </div>
        </div>
      </Layout>

      {/* Botão de debug temporário - REMOVER EM PRODUÇÃO */}
      {process.env.NODE_ENV === 'development' && (
        <button
          onClick={() => {
            localStorage.removeItem('pwa-installed')
            console.log('[PWA] localStorage limpo, recarregando página...')
            window.location.reload()
          }}
          style={{
            position: 'fixed',
            left: 24,
            bottom: 24,
            zIndex: 1000,
            background: '#ff4444',
            color: 'white',
            border: 'none',
            borderRadius: 8,
            padding: '8px 12px',
            fontSize: 12,
            cursor: 'pointer',
          }}
        >
          🔄 Reset PWA
        </button>
      )}

      {/* Popup de instalação do PWA */}
      {showPwaPrompt && !showManualInstructions && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0,0,0,0.6)',
            zIndex: 2000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              background: 'white',
              borderRadius: 16,
              padding: 32,
              boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
              maxWidth: 340,
              textAlign: 'center',
              position: 'relative',
              animation: 'popup-bounce 0.5s',
            }}
          >
            <div style={{ marginBottom: 16 }}>
              <img
                src="/icon-192x192.png"
                alt="App Icon"
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 12,
                  marginBottom: 8,
                }}
              />
              <h2 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>
                Instale o App!
              </h2>
              <p style={{ color: '#444', margin: '12px 0 0 0', fontSize: 16 }}>
                Tenha acesso rápido e fácil ao catálogo direto na sua tela
                inicial.
              </p>
            </div>
            <button
              onClick={handleInstallClick}
              style={{
                background:
                  'linear-gradient(90deg, #f9ce34 0%, #ee2a7b 50%, #6228d7 100%)',
                color: 'white',
                border: 'none',
                borderRadius: 8,
                padding: '12px 28px',
                fontSize: 18,
                fontWeight: 600,
                cursor: 'pointer',
                marginBottom: 12,
                boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
                transition: 'transform 0.1s',
              }}
            >
              Instalar Agora
            </button>
            <button
              onClick={() => {
                // Salvar no localStorage que o usuário fechou o popup
                localStorage.setItem('pwa-installed', 'true')
                handleClose()
              }}
              style={{
                background: 'none',
                color: '#ee2a7b',
                border: 'none',
                fontSize: 16,
                fontWeight: 500,
                cursor: 'pointer',
                marginTop: 4,
                textDecoration: 'underline',
              }}
            >
              Não, obrigado
            </button>
          </div>
          <style>{`
            @keyframes popup-bounce {
              0% { transform: scale(0.7); opacity: 0; }
              80% { transform: scale(1.05); opacity: 1; }
              100% { transform: scale(1); opacity: 1; }
            }
          `}</style>
        </div>
      )}

      {/* Instruções manuais */}
      {showManualInstructions && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0,0,0,0.6)',
            zIndex: 2000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              background: 'white',
              borderRadius: 16,
              padding: 32,
              boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
              maxWidth: 380,
              textAlign: 'center',
              position: 'relative',
              animation: 'popup-bounce 0.5s',
            }}
          >
            <div style={{ marginBottom: 20 }}>
              <img
                src="/icon-192x192.png"
                alt="App Icon"
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 12,
                  marginBottom: 8,
                }}
              />
              <h2 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>
                {instructions.title}
              </h2>
              <p
                style={{
                  color: '#666',
                  margin: '8px 0 0 0',
                  fontSize: 14,
                  fontStyle: 'italic',
                }}
              >
                {instructions.iconHint}
              </p>
            </div>

            <div style={{ textAlign: 'left', marginBottom: 20 }}>
              {instructions.steps.map((step, index) => (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    marginBottom: 12,
                    fontSize: 16,
                    lineHeight: 1.4,
                  }}
                >
                  <span
                    style={{
                      background: '#ee2a7b',
                      color: 'white',
                      borderRadius: '50%',
                      width: 24,
                      height: 24,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 12,
                      fontWeight: 'bold',
                      marginRight: 12,
                      flexShrink: 0,
                      marginTop: 2,
                    }}
                  >
                    {index + 1}
                  </span>
                  <span style={{ color: '#333' }}>{step}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => {
                // Salvar no localStorage que o usuário viu as instruções
                localStorage.setItem('pwa-installed', 'true')
                handleClose()
              }}
              style={{
                background:
                  'linear-gradient(90deg, #f9ce34 0%, #ee2a7b 50%, #6228d7 100%)',
                color: 'white',
                border: 'none',
                borderRadius: 8,
                padding: '12px 28px',
                fontSize: 16,
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
              }}
            >
              Entendi
            </button>
          </div>
          <style>{`
            @keyframes popup-bounce {
              0% { transform: scale(0.7); opacity: 0; }
              80% { transform: scale(1.05); opacity: 1; }
              100% { transform: scale(1); opacity: 1; }
            }
          `}</style>
        </div>
      )}
    </>
  )
}

export default HomePage
