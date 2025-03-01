export function registerServiceWorker() {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    console.log('Service Worker is supported');
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
