import { toast } from '@/components/ui/sonner'

// Flag para controlar se o reload foi solicitado pelo usuário
let reloadRequested = false

// Armazena o worker waiting para uso posterior
let waitingWorker: ServiceWorker | null = null

export function registerServiceWorkerWithUpdates() {
  if (!('serviceWorker' in navigator)) {
    console.log('[SW] Service Worker não é suportado neste navegador')
    return
  }

  console.log('[SW] Aguardando evento load para registrar SW...')

  window.addEventListener('load', () => {
    console.log('[SW] Página carregada, iniciando registro do SW...')

    navigator.serviceWorker
      .register('/sw.js', { scope: '/' })
      .then((registration) => {
        console.log('[SW] Registrado com sucesso:', registration.scope)

        // Quando um novo SW está instalado e esperando para ativar
        function listenForWaitingServiceWorker(reg: ServiceWorkerRegistration) {
          if (reg.waiting) {
            console.log('[SW] SW em espera detectado')
            waitingWorker = reg.waiting // Armazena referência
            notifyUpdateAvailable(reg)
            return
          }

          reg.addEventListener('updatefound', () => {
            console.log('[SW] Nova versão encontrada!')
            const newWorker = reg.installing
            if (!newWorker) return

            newWorker.addEventListener('statechange', () => {
              console.log('[SW] Estado alterado:', newWorker.state)
              if (newWorker.state === 'installed') {
                console.log('[SW] Nova versão instalada')

                // Aguarda um pouco para garantir que reg.waiting está disponível
                setTimeout(() => {
                  if (reg.waiting || newWorker.state === 'installed') {
                    waitingWorker = reg.waiting || newWorker // Armazena referência
                    console.log(
                      '[SW] SW aguardando ativação, mostrando notificação'
                    )
                    notifyUpdateAvailable(reg)
                  }
                }, 100)
              }
            })
          })
        }

        listenForWaitingServiceWorker(registration)

        // Verifica atualizações a cada 60 segundos
        setInterval(() => {
          console.log('[SW] Verificando atualizações...')
          registration.update().catch((err) => {
            console.warn('[SW] Erro ao verificar atualização:', err)
          })
        }, 60000)
      })
      .catch((error) => {
        console.error('[SW] Falha ao registrar SW:', error)
        // Não mostrar toast de erro para não assustar o usuário
        // A aplicação funciona mesmo sem SW
      })
  })

  // Listener para quando o SW assume controle (após atualização)
  // IMPORTANTE: Só recarrega se o usuário solicitou explicitamente
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    console.log('[SW] Novo SW assumiu controle')

    if (reloadRequested) {
      console.log('[SW] Reload solicitado pelo usuário, recarregando página...')
      window.location.reload()
    } else {
      console.log('[SW] Reload não solicitado, ignorando controllerchange')
    }
  })
}

function notifyUpdateAvailable(registration: ServiceWorkerRegistration) {
  console.log('[SW] Mostrando notificação de atualização ao usuário')

  // IMPORTANTE: duration: 0 = toast persiste até ser fechado manualmente
  // Infinity não funciona corretamente com Sonner
  toast('🎉 Nova versão disponível!', {
    description:
      'Há uma atualização com novas funcionalidades. Clique para atualizar agora.',
    action: {
      label: 'Atualizar Agora',
      onClick: () => {
        console.log('[SW] Usuário clicou em atualizar')

        // Tenta pegar o worker de diferentes formas
        const workerToUpdate =
          waitingWorker || registration.waiting || registration.installing

        if (!workerToUpdate) {
          console.warn('[SW] Nenhum SW disponível para atualizar')
          console.log('[SW] registration.waiting:', registration.waiting)
          console.log('[SW] registration.installing:', registration.installing)
          console.log('[SW] waitingWorker:', waitingWorker)

          toast.error('Erro ao atualizar', {
            description: 'Recarregue a página manualmente (Ctrl+Shift+R).',
            duration: 5000,
          })
          return
        }

        console.log('[SW] Enviando mensagem SKIP_WAITING para o SW')
        console.log('[SW] Worker state:', workerToUpdate.state)

        // IMPORTANTE: Marca que o reload foi solicitado pelo usuário
        reloadRequested = true

        // Solicita que o SW em espera ative imediatamente
        workerToUpdate.postMessage({ type: 'SKIP_WAITING' })

        // Feedback visual enquanto atualiza
        toast.loading('Atualizando...', {
          description: 'A página será recarregada em instantes.',
          duration: 3000,
        })
      },
    },
    duration: 0, // 0 = persiste até ser fechado (Infinity não funciona com Sonner)
    important: true, // Prioriza este toast sobre outros
    closeButton: true, // Permite fechar manualmente
  })
}
