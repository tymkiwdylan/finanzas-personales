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
    
    // Add Apple touch icons for iOS
    const appleTouchIconSizes = [152, 167, 180];
    
    appleTouchIconSizes.forEach(size => {
      const iconId = `apple-touch-icon-${size}`;
      if (!document.getElementById(iconId)) {
        const appleTouchIcon = document.createElement('link');
        appleTouchIcon.id = iconId;
        appleTouchIcon.rel = 'apple-touch-icon';
        appleTouchIcon.setAttribute('sizes', `${size}x${size}`);
        appleTouchIcon.href = `/icons-png/icon-${size}x${size}.png`;
        document.head.appendChild(appleTouchIcon);
        console.log(`Added apple-touch-icon ${size}x${size} tag programmatically`);
      }
    });
    
    // Add apple-mobile-web-app-capable meta tag
    if (!document.querySelector('meta[name="apple-mobile-web-app-capable"]')) {
      const meta = document.createElement('meta');
      meta.name = 'apple-mobile-web-app-capable';
      meta.content = 'yes';
      document.head.appendChild(meta);
      console.log('Added apple-mobile-web-app-capable meta tag programmatically');
    }
    
    // Add apple-mobile-web-app-status-bar-style meta tag
    if (!document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]')) {
      const meta = document.createElement('meta');
      meta.name = 'apple-mobile-web-app-status-bar-style';
      meta.content = 'default';
      document.head.appendChild(meta);
      console.log('Added apple-mobile-web-app-status-bar-style meta tag programmatically');
    }
  }, []);

  return null;
}
