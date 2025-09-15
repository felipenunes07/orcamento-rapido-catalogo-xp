import { ThemeProvider as NextThemesProvider } from "next-themes"
import { type ThemeProviderProps } from "next-themes/dist/types"
import { useEffect } from "react"

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  // Adicionar log para verificar se o tema está sendo aplicado
  useEffect(() => {
    const observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          console.log('Classe do html mudou (ThemeProvider):', document.documentElement.className);
        }
      });
    });
    
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });
    
    return () => {
      observer.disconnect();
    };
  }, []);
  
  return (
    <NextThemesProvider 
      {...props} 
      defaultTheme="system"
      enableSystem={true}
      attribute="class"
    >
      {children}
    </NextThemesProvider>
  )
}