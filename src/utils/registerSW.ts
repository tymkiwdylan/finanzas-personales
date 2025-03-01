export function registerServiceWorker() {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    console.log('Service Worker is supported');
    
    // Check if service worker is already active
    if (navigator.serviceWorker.controller) {
      console.log('Service Worker is already controlling this page:', navigator.serviceWorker.controller);
    } else {
      console.log('No active Service Worker found, will attempt to register one');
    }
    
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('Service Worker registered successfully: ', registration);
        })
        .catch((registrationError) => {
          console.error('Service Worker registration failed: ', registrationError);
        });
        
      // Log if manifest exists
      const manifestLink = document.querySelector('link[rel="manifest"]');
      if (manifestLink) {
        console.log('Manifest found:', manifestLink.getAttribute('href'));
        
        // Attempt to fetch the manifest to verify it's accessible
        fetch(manifestLink.getAttribute('href') || '')
          .then(response => {
            if (response.ok) {
              console.log('Manifest successfully fetched');
              return response.json();
            }
            throw new Error('Failed to fetch manifest');
          })
          .then(data => {
            console.log('Manifest content verified:', data ? 'valid JSON' : 'empty or invalid');
            // Log important manifest properties
            if (data) {
              console.log('Manifest properties:', {
                name: data.name,
                short_name: data.short_name,
                display: data.display,
                start_url: data.start_url,
                scope: data.scope,
                icons: data.icons?.length || 0,
              });
            }
          })
          .catch(error => console.error('Error fetching manifest:', error));
      } else {
        console.error('Manifest not found in the document head');
      }
      
      // PWA installation criteria check
      if ('BeforeInstallPromptEvent' in window) {
        console.log('BeforeInstallPromptEvent is supported - app can be installed');
      } else {
        console.log('BeforeInstallPromptEvent not supported - installation may not be available');
      }
    });
  } else {
    console.error('Service Workers are not supported in this browser');
  }
}
