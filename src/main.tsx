import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

createRoot(document.getElementById("root")!).render(<App />);

// Registro do service worker para PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then(
      registration => {
        console.log('Service Worker registrado com sucesso:', registration);
      },
      err => {
        console.log('Falha ao registrar o Service Worker:', err);
      }
    );
  });
}
