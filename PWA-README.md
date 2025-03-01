# PWA Implementation Guide

This document explains how Progressive Web App (PWA) functionality has been implemented in your Mi Presupuesto Personal application.

## What is a PWA?

A Progressive Web App (PWA) is a web application that provides a native app-like experience to users. PWAs are:

- **Installable** - Can be added to the home screen
- **Reliable** - Work offline or on low-quality networks
- **Engaging** - Feel like a native app on the device

## What's Included

The PWA implementation includes:

1. **Web Manifest** (`/public/manifest.json`)
   - Provides metadata about the application
   - Enables "Add to Home Screen" functionality

2. **Service Worker** (`/public/sw.js`)
   - Caches key assets for offline use
   - Provides a fallback page when offline

3. **Offline Page** (`/src/app/offline`)
   - Shows a helpful message when the user is offline

4. **Install Prompt** (`/src/components/PWAInstaller.tsx`)
   - Displays a button to install the app when possible

## PNG Icons

For the PWA to function properly, you need PNG icons in the following sizes:
- 192x192 pixels
- 512x512 pixels

A helper script has been created to generate these icons from your SVG files:

```bash
# First install sharp if not already installed
npm install --save-dev sharp

# Then run the icon generation script
npm run generate-pwa-icons
```

## Testing PWA Functionality

To test the PWA functionality:

1. Build and start the production server:
   ```bash
   npm run build
   npm start
   ```

2. Open Chrome DevTools > Application tab > Service Workers section to verify the service worker is registered.

3. In the same tab, go to the Manifest section to verify the manifest is properly loaded.

4. Test offline functionality by:
   - Opening the Network tab in DevTools
   - Checking the "Offline" option
   - Refreshing the page - you should see the offline page

5. Test installation by:
   - Looking for the install icon in the address bar, or
   - Using the custom install button that appears in the app

## Debugging

If you encounter issues:

- Check Chrome DevTools > Console for any errors
- Verify the service worker is registered in the Application tab
- Ensure the manifest is correctly loaded
- Make sure the PNG icons exist in the specified locations

## Resources

- [Next.js PWA Documentation](https://nextjs.org/docs/pages/building-your-application/optimizing/pwa)
- [Google Web.dev PWA Guide](https://web.dev/learn/pwa/)
- [MDN Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
