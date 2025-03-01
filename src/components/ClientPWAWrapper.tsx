'use client';

import React, { useEffect } from 'react';
import { registerServiceWorker } from '@/utils/registerSW';
import PWAInstaller from './PWAInstaller';

export default function ClientPWAWrapper() {
  useEffect(() => {
    // Register service worker on client side
    registerServiceWorker();
  }, []);

  return <PWAInstaller />;
}
