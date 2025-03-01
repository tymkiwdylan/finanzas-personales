'use client';

import React, { useEffect, useState } from 'react';
/* eslint-disable react/no-unescaped-entities */

export default function PwaInstallGuide() {
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInStandaloneMode, setIsInStandaloneMode] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [browser, setBrowser] = useState('');
  
  useEffect(() => {
    // Only show in development or for a short time in production
    const shouldShow = process.env.NODE_ENV === 'development' || Math.random() < 0.3;
    if (!shouldShow) return;
    
    // Check if already running as installed PWA
    const standalone = window.matchMedia('(display-mode: standalone)').matches || 
                      (window.navigator as any).standalone || 
                      document.referrer.includes('android-app://');
    
    setIsInStandaloneMode(standalone);
    
    // Only show guide if not already installed
    if (!standalone) {
      setIsVisible(true);
      
      // Detect browser
      const ua = navigator.userAgent;
      if (/chrome/i.test(ua)) {
        setBrowser('Chrome');
      } else if (/firefox/i.test(ua)) {
        setBrowser('Firefox');
      } else if (/safari/i.test(ua)) {
        setBrowser('Safari');
      } else if (/edge/i.test(ua)) {
        setBrowser('Edge');
      } else {
        setBrowser('su navegador');
      }
      
      // Listen for installability
      window.addEventListener('beforeinstallprompt', () => {
        setIsInstallable(true);
      });
    }
  }, []);
  
  if (!isVisible || isInStandaloneMode) return null;
  
  return (
    <div className="fixed top-2 left-2 right-2 bg-sky-50 border border-sky-200 p-3 rounded-lg shadow-md text-xs text-sky-800 z-50 max-w-sm mx-auto">
      <div className="font-medium mb-1">💡 Instala esta app en tu dispositivo</div>
      {isInstallable ? (
        <p>
          Esta app se puede instalar. Busca el botón &ldquo;Instalar App&rdquo; en la parte inferior derecha de la pantalla.
        </p>
      ) : (
        <p>
          Para instalar esta app en {browser}:
          {browser === 'Chrome' && " Toca el ⋮ (menú) y selecciona 'Instalar aplicación'"}
          {browser === 'Safari' && " Toca el icono de compartir y selecciona 'Agregar a pantalla de inicio'"}
          {browser === 'Firefox' && " Toca el ⋮ (menú) y selecciona 'Instalar'"}
          {browser === 'Edge' && " Toca el ⋯ (menú) y selecciona 'Instalar aplicación'"}
        </p>
      )}
      <button 
        className="text-sky-600 underline mt-1 text-right w-full text-xs"
        onClick={() => setIsVisible(false)}
      >
        Cerrar
      </button>
    </div>
  );
}
