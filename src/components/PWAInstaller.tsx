'use client';

import React, { useEffect, useState } from 'react';

export default function PWAInstaller() {
  // Component disabled
  return null;
  
  /*
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallButton, setShowInstallButton] = useState(false);

  useEffect(() => {
    console.log('PWAInstaller component mounted');

    // Force show install button for testing if needed
    // For debugging purposes, we'll show the button anyway
    // setShowInstallButton(true);

    // Handle PWA installation prompt
    window.addEventListener('beforeinstallprompt', (e) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault();
      // Stash the event so it can be triggered later
      setDeferredPrompt(e);
      // Update UI to show the installation button
      // setShowInstallButton(true);
      console.log('Install prompt captured but button is disabled.');
    });

    // Handle installed PWA
    window.addEventListener('appinstalled', () => {
      // Log to analytics
      console.log('PWA app was installed');
      // Hide the installation button
      setShowInstallButton(false);
      // Clear the deferred prompt
      setDeferredPrompt(null);
    });

    // Debug PWA criteria
    // Check if running on HTTPS (required for PWA)
    if (typeof window !== 'undefined') {
      const isSecure = window.location.protocol === 'https:' || window.location.hostname === 'localhost';
      console.log(`Running on ${isSecure ? 'secure context (good for PWA)' : 'non-secure context (PWA may not work)'}`);
      
      if (!('serviceWorker' in navigator)) {
        console.error('Service Workers not supported in this browser - PWA features will not work');
      }
    }

    // Cleanup
    return () => {
      window.removeEventListener('beforeinstallprompt', () => {});
      window.removeEventListener('appinstalled', () => {});
    };
  }, []);

  const handleInstallClick = () => {
    console.log('Install button clicked, deferred prompt:', deferredPrompt ? 'available' : 'not available');
    
    if (!deferredPrompt) {
      console.log('No installation prompt available - this might happen if the app is already installed or does not meet installation criteria');
      
      // Provide instructions for manual installation
      alert('Para instalar esta aplicación:\n\n' + 
            '1. En Chrome: Haz clic en los tres puntos (⋮) en la esquina superior derecha\n' +
            '2. Selecciona "Instalar BudgetCash"\n\n' +
            'Si no ves esta opción, la aplicación podría no cumplir con todos los criterios de instalación.');
      return;
    }

    // Show the install prompt
    deferredPrompt.prompt();
    console.log('Installation prompt displayed to user');

    // Wait for the user to respond to the prompt
    deferredPrompt.userChoice.then((choiceResult: { outcome: string }) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the install prompt');
      } else {
        console.log('User dismissed the install prompt');
      }
      // Clear the deferred prompt variable
      setDeferredPrompt(null);
      // Hide the installation button
      setShowInstallButton(false);
    });
  };

  // For debugging, let's also log PWA criteria when rendering
  useEffect(() => {
    console.log('PWA install button visible:', showInstallButton);
  }, [showInstallButton]);

  // Component disabled - returns null
  */
}
