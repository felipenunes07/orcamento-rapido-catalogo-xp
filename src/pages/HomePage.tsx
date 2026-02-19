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
        <div className="container-custom py-8 bg-background">
          <div className="max-w-3xl mx-auto">
            {/* Hero Section */}
            <section className="mb-8 text-center py-4">
              <h1 className="text-3xl sm:text-4xl font-bold mb-3">
                <span className="bg-gradient-to-r from-blue-800 via-blue-600 to-blue-500 bg-clip-text text-transparent dark:from-blue-300 dark:via-blue-400 dark:to-blue-500">
                  Catálogo Orçamento Fácil
                </span>
              </h1>
              <p className="text-base sm:text-lg text-muted-foreground mb-6 dark:text-gray-400">
                Crie orçamentos rápidos e simples
              </p>
              <Button asChild size="lg" className="btn-accent px-8">
                <Link to="/catalogo">Ver Catálogo</Link>
              </Button>
            </section>

            {/* Steps Section */}
            <section className="bg-slate-50 dark:bg-gray-900/50 p-4 sm:p-6 rounded-2xl border border-slate-100 dark:border-gray-800">
              <h2 className="text-xl font-bold mb-6 dark:text-gray-100 flex items-center gap-2">
                Como funciona:
              </h2>

              <div className="space-y-4">
                <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-slate-200 dark:border-gray-700 shadow-sm transition-all hover:shadow-md">
                  <h3 className="font-semibold mb-1 flex items-center">
                    <span className="text-white rounded-full w-7 h-7 inline-flex items-center justify-center mr-3 text-sm font-bold shadow-md" style={{ background: 'linear-gradient(135deg, #1e40af, #2563eb)' }}>
                      1
                    </span>
                    Navegue pelo catálogo
                  </h3>
                  <p className="text-muted-foreground text-sm dark:text-gray-300 ml-10 leading-relaxed">
                    Explore todos os produtos disponíveis com seus preços
                    atualizados.
                  </p>
                </div>

                <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-slate-200 dark:border-gray-700 shadow-sm transition-all hover:shadow-md">
                  <h3 className="font-semibold mb-1 flex items-center">
                    <span className="text-white rounded-full w-7 h-7 inline-flex items-center justify-center mr-3 text-sm font-bold shadow-md" style={{ background: 'linear-gradient(135deg, #1e40af, #2563eb)' }}>
                      2
                    </span>
                    Selecione as quantidades
                  </h3>
                  <p className="text-muted-foreground text-sm dark:text-gray-300 ml-10 leading-relaxed">
                    Adicione os produtos desejados e defina a quantidade de cada
                    item.
                  </p>
                </div>

                <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-slate-200 dark:border-gray-700 shadow-sm transition-all hover:shadow-md">
                  <h3 className="font-semibold mb-1 flex items-center">
                    <span className="text-white rounded-full w-7 h-7 inline-flex items-center justify-center mr-3 text-sm font-bold shadow-md" style={{ background: 'linear-gradient(135deg, #1e40af, #2563eb)' }}>
                      3
                    </span>
                    Finalize o orçamento
                  </h3>
                  <p className="text-muted-foreground text-sm dark:text-gray-300 ml-10 leading-relaxed">
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

            {/* Botão de contato WhatsApp */}
            <div className="mt-8 p-6 rounded-2xl text-center border border-blue-100 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-white dark:from-gray-800 dark:to-gray-800">
              <h3 className="font-semibold mb-2 dark:text-gray-100">Precisa de ajuda?</h3>
              <p className="text-sm text-muted-foreground mb-4 dark:text-gray-300">
                Fale com nosso time pelo WhatsApp
              </p>
              <a
                href="https://wa.me/5511911279702"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-5 py-2.5 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5 font-medium"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                (11) 91127-9702
              </a>
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
                src="/XP_Factory-New.png"
                alt="App Icon"
                style={{
                  height: 48,
                  width: 'auto',
                  maxWidth: 160,
                  objectFit: 'contain',
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
                  'linear-gradient(135deg, #1e40af 0%, #2563eb 50%, #3b82f6 100%)',
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
                color: '#2563eb',
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
                src="/XP_Factory-New.png"
                alt="App Icon"
                style={{
                  height: 48,
                  width: 'auto',
                  maxWidth: 160,
                  objectFit: 'contain',
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
                      background: '#2563eb',
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
                  'linear-gradient(135deg, #1e40af 0%, #2563eb 50%, #3b82f6 100%)',
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
