# PWA Install Prompt Testing Guide

## Why you're not seeing the install prompt

The main issue is that **PWA install prompts require HTTPS** and don't work on `localhost` when accessed from mobile devices.

## 🔧 Solutions to test PWA install prompt:

### Option 1: Use ngrok (Recommended)
1. Install ngrok: `npm install -g ngrok`
2. Run your dev server: `npm run dev` (running on port 5177)
3. In another terminal: `ngrok http 5177`
4. Use the HTTPS URL provided by ngrok on your mobile device

### Option 2: Use Vite's --host flag
1. Update package.json dev script to: `"dev": "vite --host"`
2. Access via your local IP with HTTPS (may require certificate setup)

### Option 3: Deploy to production
1. Deploy to Netlify, Vercel, or GitHub Pages
2. Test on the production HTTPS URL

## 📱 PWA Install Criteria (All must be met):
✅ Web app manifest with required fields
✅ Service worker registered
✅ HTTPS (or localhost on desktop only)
✅ App must be visited multiple times or user must interact
✅ Not already installed
✅ Display mode: standalone

## 🧪 Testing Steps:
1. Use one of the HTTPS solutions above
2. Visit the site on mobile browser (Chrome/Safari)
3. Interact with the site (navigate, click buttons)
4. Wait 30 seconds or refresh the page
5. Look for "Add to Home Screen" prompt or banner

## 🔍 Debug in Chrome DevTools:
1. Open DevTools → Application tab
2. Click "Manifest" to check manifest
3. Click "Service Workers" to verify registration
4. Look for any errors in red

## 💡 Force Install Prompt (Desktop Chrome only):
1. DevTools → Application → Manifest
2. Click "Add to homescreen" button
3. This works for desktop testing but not mobile