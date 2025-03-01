'use client';

import React, { useEffect } from 'react';
import Head from 'next/head';

export default function PwaHead() {
  useEffect(() => {
    // Ensure manifest link is present
    if (!document.querySelector('link[rel="manifest"]')) {
      const link = document.createElement('link');
      link.rel = 'manifest';
      link.href = '/manifest.json';
      document.head.appendChild(link);
      console.log('Added manifest link programmatically');
    }
    
    // Add theme-color meta tag if not present
    if (!document.querySelector('meta[name="theme-color"]')) {
      const meta = document.createElement('meta');
      meta.name = 'theme-color';
      meta.content = '#0284c7';
      document.head.appendChild(meta);
      console.log('Added theme-color meta tag programmatically');
    }
  }, []);

  return null;
}
