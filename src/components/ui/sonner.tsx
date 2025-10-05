import { useEffect, useMemo, useState } from 'react'
import { useTheme } from 'next-themes'
import { Toaster as Sonner, toast } from 'sonner'

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = 'system' } = useTheme()

  const [position, setPosition] =
    useState<ToasterProps['position']>('bottom-left')
  const [styleOffsets, setStyleOffsets] = useState<React.CSSProperties>({})

  useEffect(() => {
    const computeLayout = () => {
      const isMobile = window.matchMedia('(max-width: 768px)').matches
      const chatBtn = document.getElementById('gg-help-button')
      const chatBox = document.getElementById(
        'gg-help-chat'
      ) as HTMLDivElement | null
      const chatVisible = !!chatBox && chatBox.style.display !== 'none'

      if (isMobile) {
        // Mobile: sempre embaixo
        const btnHeight = chatBtn?.offsetHeight ?? 56
        const btnBottom = 20
        const bottomOffset = chatVisible
          ? 16 // chat aberto: margem padrão
          : btnBottom + btnHeight + 12 // chat fechado: acima do botão
        setPosition('bottom-right')
        setStyleOffsets({ marginBottom: bottomOffset, marginRight: 16 })
      } else {
        // Desktop: sempre embaixo à direita, acima do chat (sem cobrir)
        const btnHeight = chatBtn?.offsetHeight ?? 56
        const btnBottom = 20
        const bottomOffset = chatVisible
          ? ((document.getElementById('gg-help-chat') as HTMLDivElement | null)
              ?.offsetHeight ?? 520) + 24
          : btnBottom + btnHeight + 16
        setPosition('bottom-right')
        setStyleOffsets({ marginBottom: bottomOffset, marginRight: 20 })
      }
    }

    computeLayout()
    const onResize = () => computeLayout()
    window.addEventListener('resize', onResize)

    // Observa mudanças de visibilidade do chat para reposicionar os toasts
    const chatBox = document.getElementById('gg-help-chat')
    let observer: MutationObserver | null = null
    if (chatBox) {
      observer = new MutationObserver(computeLayout)
      observer.observe(chatBox, {
        attributes: true,
        attributeFilter: ['style', 'class'],
      })
    }

    return () => {
      window.removeEventListener('resize', onResize)
      if (observer) observer.disconnect()
    }
  }, [])

  return (
    <Sonner
      theme={theme as ToasterProps['theme']}
      className="toaster group"
      position={position}
      closeButton
      expand
      duration={12000}
      toastOptions={{
        style: {
          ...styleOffsets,
          fontSize: 16,
          padding: '14px 18px',
          maxWidth: 420,
        },
        classNames: {
          toast:
            'group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg',
          description: 'group-[.toast]:text-muted-foreground',
          actionButton:
            'group-[.toast]:bg-primary group-[.toast]:text-primary-foreground',
          cancelButton:
            'group-[.toast]:bg-muted group-[.toast]:text-muted-foreground',
        },
      }}
      {...props}
    />
  )
}

export { Toaster, toast }
