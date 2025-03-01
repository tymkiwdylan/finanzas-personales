'use client';

import React, { useEffect, useState } from 'react';

export default function PWAInstaller() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallButton, setShowInstallButton] = useState(false);

  useEffect(() => {
    // Handle PWA installation prompt
    window.addEventListener('beforeinstallprompt', (e) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault();
      // Stash the event so it can be triggered later
      setDeferredPrompt(e);
      // Update UI to show the installation button
      setShowInstallButton(true);
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
  }, []);

  const handleInstallClick = () => {
    if (!deferredPrompt) return;

    // Show the install prompt
    deferredPrompt.prompt();

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

  if (!showInstallButton) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={handleInstallClick}
        className="flex items-center space-x-2 bg-sky-600 hover:bg-sky-700 text-white font-medium py-2 px-4 rounded-lg shadow-lg transition-colors"
      >
        <span className="text-sm">Instalar App</span>
      </button>
    </div>
  );
}
