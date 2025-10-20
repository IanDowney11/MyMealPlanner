# My Meal Planner

A comprehensive meal planning application built with React, Vite, and Supabase. Plan your weekly meals, manage recipes, create shopping lists, and stay organized in the kitchen with this feature-rich PWA.

## 🚀 Features

### Core Functionality
- **Meal Management**: Add, edit, rate, and organize your favorite recipes with images, descriptions, tags, and multiple versions
- **Weekly Planning**: Drag-and-drop interface for planning meals across the week with calendar view
- **Shopping Lists**: Create and manage shopping lists with completion tracking
- **Snack Management**: Dedicated section for managing and discovering snacks with random selection
- **External Recipe Integration**: Search and import recipes from Spoonacular API (10,000+ recipes)

### Advanced Features
- **Meal Versioning**: Store multiple versions of recipes (e.g., "with brown rice", "vegetarian option")
- **Meal Tracking**: Track when meals were last cooked and how often they've been prepared
- **Event Planning**: Create and manage meal events with date/time scheduling
- **Shopping List Sharing**: Share shopping lists between users with permission-based system
- **REST API**: Built-in API server for integration with Home Assistant and other automation systems

### Technical Features
- **Progressive Web App (PWA)**: Install on any device, works offline
- **Real-time Sync**: Cloud-based storage with Supabase PostgreSQL database
- **Secure Authentication**: User accounts with Row Level Security (RLS)
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **Material-UI Design**: Modern, accessible interface with dark theme support

## 🛠️ Technology Stack

- **Frontend**: React 19, Vite, Material-UI (MUI), React Router
- **Backend**: Supabase (PostgreSQL + Auth + Real-time)
- **API Server**: Express.js with CORS support
- **External APIs**: Spoonacular Recipe API
- **Deployment**: PWA-ready with service worker support
- **State Management**: React Context API
- **Drag & Drop**: React DnD with multi-backend support

## 📋 Prerequisites

- Node.js 16+ and npm
- Supabase account (free tier available)
- Spoonacular API key (optional, for external recipe search)

## 🚀 Quick Start

### 1. Clone and Install
```bash
git clone <repository-url>
cd MyMealPlanner
npm install
```

### 2. Environment Setup
Create a `.env` file (copy from `.env.example`):
```bash
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Spoonacular API (Optional)
VITE_SPOONACULAR_API_KEY=your_api_key_here

# Server Configuration (Required for API)
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
PORT=3002
NODE_ENV=development
```

### 3. Database Setup
Run the database schema in your Supabase SQL editor:
```bash
# The complete schema is in database-schema.sql
```

### 4. Start Development
```bash
# Frontend only
npm run dev

# API server only
npm run server:dev

# Both frontend and API server
npm run dev:all
```

## 📱 Application Structure

### Pages
- **Home**: Dashboard showing today's planned meal and random snack selection
- **Meals**: Manage your recipe collection with search, filter, and rating
- **Meal Planner**: Weekly calendar view with drag-and-drop meal planning
- **Shopping List**: Create and manage shopping lists with sharing capabilities
- **Snacks**: Dedicated snack management with random discovery
- **Admin**: User profile and application settings

### Key Components
- **Meal Form**: Rich recipe creation with image upload, tags, and versions
- **Version Selection**: Choose between different recipe variations when planning
- **Event Modal**: Schedule meals for specific dates and times
- **Sharing System**: Permission-based shopping list sharing between users
- **External Recipe Search**: Integration with Spoonacular API

## 🔌 API Integration

### REST API Endpoints
The application includes a built-in REST API server for external integrations:

- `GET /api/health` - Health check
- `GET /api/meals/tonight?userId=USER_ID` - Tonight's planned meal
- `GET /api/meals/tomorrow?userId=USER_ID` - Tomorrow's planned meal
- `GET /api/debug/mealplans?userId=USER_ID` - Debug meal plans

### Home Assistant Integration
Perfect for smart home integration. See `docs/API_DOCUMENTATION.md` for complete setup instructions.

## 📦 Deployment

### Development
```bash
npm run dev:all  # Start both frontend and API server
```

### Production
```bash
npm run build    # Build frontend
npm run start    # Start API server
```

### PWA Installation
The app can be installed on any device through the browser's "Add to Home Screen" option.

## 🔒 Security & Privacy

- **Row Level Security**: Database-level security ensuring users only access their data
- **Encrypted Storage**: All data encrypted in transit and at rest
- **No Data Collection**: We don't collect, sell, or share your personal data
- **Open Source**: Fully transparent codebase

## 🤝 Contributing

This is an open-source project. Contributions, issues, and feature requests are welcome!

- Fork the repository
- Create a feature branch
- Make your changes
- Submit a pull request

**Forking is a compliment!** Feel free to fork, modify, or contribute.

## 📄 License

This project is provided as-is for personal use. No rights reserved - use, modify, and distribute freely.

## 📚 Documentation

- **API Documentation**: `docs/API_DOCUMENTATION.md` - Complete API reference and Home Assistant integration
- **Database Schema**: `database-schema.sql` - Database structure and setup
- **Supabase Setup**: `docs/supabase-setup-guide.md` - Step-by-step Supabase configuration
- **Shopping List Sharing**: `docs/SHOPPING_LIST_SHARING.md` - Sharing system documentation
- **PWA Testing**: `docs/pwa-test-instructions.md` - Progressive Web App testing guide
- **Mobile Improvements**: `docs/IMPROVEMENTS-APPLIED.md` - Recent mobile UX enhancements
- **Test Scripts**: `docs/test-scripts/` - Comprehensive mobile testing procedures

## 🆘 Support

- Review the documentation in the `docs/` folder
- Check the `database-schema.sql` for database structure
- Open an issue for bugs or feature requests

---

*Built with ❤️ for meal planning enthusiasts*
