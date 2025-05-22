import React from 'react'

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-muted py-6 mt-auto">
      <div className="container-custom">
        <div className="text-center text-sm text-muted-foreground">
          <p>
            &copy; {currentYear} Catálogo Orçamento Fácil Expor Telas. Todos os
            direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
