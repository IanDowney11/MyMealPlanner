# My Meal Planner

A comprehensive meal planning application built with React, Vite, and NOSTR. Plan your weekly meals, manage recipes, create shopping lists, and stay organized in the kitchen with this offline-first PWA.

## Features

### Core Functionality
- **Meal Management**: Add, edit, rate, and organize your favorite recipes with images, descriptions, tags, and multiple versions
- **Weekly Planning**: Drag-and-drop interface for planning meals across the week with calendar view
- **Shopping Lists**: Create and manage shopping lists with completion tracking and copy-to-clipboard export
- **Snack Management**: Dedicated section for managing and discovering snacks with random selection
- **External Recipe Integration**: Search and import recipes from Spoonacular API (10,000+ recipes)

### Advanced Features
- **Meal Versioning**: Store multiple versions of recipes (e.g., "with brown rice", "vegetarian option")
- **Meal Tracking**: Track when meals were last cooked and how often they've been prepared
- **Event Planning**: Create and manage meal events with date/time scheduling
- **NOSTR Sync**: Encrypted backup and sync across devices via NOSTR relays (NIP-78)
- **Offline First**: All data stored locally in IndexedDB, works without internet

### Technical Features
- **Progressive Web App (PWA)**: Install on any device, works offline
- **NIP-44 Encryption**: All data encrypted before syncing to relays
- **NOSTR Identity**: Login with NIP-07 browser extension or nsec key
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **Material-UI Design**: Modern, accessible interface with dark theme support

## Technology Stack

- **Frontend**: React 19, Vite, Material-UI (MUI), React Router
- **Local Database**: Dexie.js (IndexedDB)
- **Identity & Sync**: NOSTR protocol (nostr-tools)
- **Image Hosting**: nostr.build
- **External APIs**: Spoonacular Recipe API
- **Deployment**: PWA-ready with service worker support
- **State Management**: React Context API
- **Drag & Drop**: React DnD with multi-backend support

## Prerequisites

- Node.js 16+ and npm
- A NOSTR key pair (can be generated in-app) or NIP-07 browser extension
- Spoonacular API key (optional, for external recipe search)

## Quick Start

### 1. Clone and Install
```bash
git clone <repository-url>
cd MyMealPlanner
npm install
```

### 2. Environment Setup
Create a `.env` file (copy from `.env.example`):
```bash
# Spoonacular API (Optional)
VITE_SPOONACULAR_API_KEY=your_api_key_here
```

### 3. Start Development
```bash
npm run dev
```

## Application Structure

### Pages
- **Home**: Dashboard showing today's planned meal and random snack selection
- **Meals**: Manage your recipe collection with search, filter, and rating
- **Meal Planner**: Weekly calendar view with drag-and-drop meal planning
- **Shopping List**: Create and manage shopping lists with copy-to-clipboard export
- **Snacks**: Dedicated snack management with random discovery
- **Admin**: Relay management, data export/import, and settings

## Authentication

MyMealPlanner uses NOSTR key pairs for identity:

- **NIP-07 Extension**: Use a browser extension like nos2x or Alby for key management
- **Paste nsec**: Directly paste your NOSTR secret key
- **Generate New Keys**: Create a new key pair in-app (make sure to save your nsec!)

## Data & Sync

All data is stored locally in IndexedDB via Dexie.js. Optionally, data syncs to NOSTR relays:

- Data is encrypted with NIP-44 before publishing (only you can read it)
- Uses kind 30078 (NIP-78) addressable events
- Sync happens automatically; offline changes queue and flush when online
- Manage relays in the Admin page

## Deployment

### Development
```bash
npm run dev
```

### Production
```bash
npm run build
npm run preview
```

Deploy the `dist/` folder to any static hosting (Vercel, Netlify, etc.).

### PWA Installation
The app can be installed on any device through the browser's "Add to Home Screen" option.

## Security & Privacy

- **End-to-End Encryption**: All synced data is NIP-44 encrypted -- relays never see your plaintext data
- **Local First**: Your data lives on your device; relay sync is optional
- **No Accounts**: No email, no passwords -- just NOSTR keys you control
- **Open Source**: Fully transparent codebase

## Contributing

This is an open-source project. Contributions, issues, and feature requests are welcome!

- Fork the repository
- Create a feature branch
- Make your changes
- Submit a pull request

**Forking is a compliment!** Feel free to fork, modify, or contribute.

## License

This project is provided as-is for personal use. No rights reserved - use, modify, and distribute freely.

## Documentation

- **PWA Testing**: `docs/pwa-test-instructions.md` - Progressive Web App testing guide
- **Mobile Improvements**: `docs/IMPROVEMENTS-APPLIED.md` - Recent mobile UX enhancements
- **Test Scripts**: `docs/test-scripts/` - Comprehensive mobile testing procedures

## Support

- Review the documentation in the `docs/` folder
- Open an issue for bugs or feature requests

---

*Built for meal planning enthusiasts*
