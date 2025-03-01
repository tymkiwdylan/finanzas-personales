'use client';

import React, { useEffect } from 'react';
import { registerServiceWorker } from '@/utils/registerSW';
import PWAInstaller from './PWAInstaller';
import PwaHead from './PwaHead';
import PwaInstallGuide from './PwaInstallGuide';

export default function ClientPWAWrapper() {
  useEffect(() => {
    // Register service worker on client side
    registerServiceWorker();
    
    // Log if running in standalone mode (already installed PWA)
    if (window.matchMedia('(display-mode: standalone)').matches) {
      console.log('App is running in standalone mode (installed as PWA)');
    } else {
      console.log('App is running in browser mode (not installed as PWA)');
    }
  }, []);

  return (
    <>
      <PwaHead />
      <PwaInstallGuide />
      <PWAInstaller />
    </>
  );
}
