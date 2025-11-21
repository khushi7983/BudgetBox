# 📄 BudgetBox - Local-First Personal Budgeting App

A real, working **Offline-First Personal Budgeting App** built with the MERN stack that follows Local-First principles. Works completely offline with auto-save functionality and smart sync capabilities.

## 🎯 Features

### ✅ Core Functionality
- **Monthly Budget Management** - Add/edit income and expenses across 6 categories
- **Auto-Save** - Every keystroke is saved locally using IndexedDB
- **Offline-First** - Works completely without internet connection
- **Smart Sync** - Syncs data when network returns with clear status indicators
- **Real-time Dashboard** - Analytics with charts and insights

### 📊 Analytics Dashboard
- 🔥 **Burn Rate** - Total expenses vs income ratio
- 💸 **Savings Potential** - Available savings or budget deficit
- 📅 **Month-End Prediction** - Projected savings based on current trend
- 🍰 **Category Pie Chart** - Visual expense breakdown using Chart.js
- ⚠️ **Smart Recommendations** - Rule-based budget suggestions

### 🌐 Local-First Architecture
- **IndexedDB Storage** - All data persists locally via LocalForage
- **Zustand State Management** - Reactive state with persistence
- **Sync Status Indicators** - Local Only | Sync Pending | Synced
- **Offline Indicators** - Clear online/offline status
- **PWA Support** - Install as native app with service worker caching

## 🛠️ Tech Stack

### Frontend
- **React 18** with JavaScript (ES6+)
- **Vite** - Fast build tool and dev server
- **TailwindCSS** - Utility-first styling
- **Zustand** - Lightweight state management
- **LocalForage** - IndexedDB wrapper for offline storage
- **Chart.js + react-chartjs-2** - Beautiful charts and analytics
- **Lucide React** - Modern icon library
- **Axios** - HTTP client with interceptors

### Backend
- **Node.js + Express** - RESTful API server
- **MongoDB + Mongoose** - Document database with schemas
- **JWT Authentication** - Secure token-based auth
- **bcryptjs** - Password hashing
- **CORS** - Cross-origin resource sharing
- **dotenv** - Environment configuration

### DevOps & Deployment
- **Frontend**: Vercel/Netlify ready
- **Backend**: Railway/Render/Fly.io ready
- **Database**: MongoDB Atlas compatible
- **PWA**: Service Worker + Web Manifest

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- MongoDB (local or Atlas)

### 1. Clone Repository
```bash
git clone https://github.com/yourusername/budgetbox.git
cd budgetbox
```

### 2. Backend Setup
```bash
cd backend
npm install
cp .env.example .env  # Configure MongoDB URI and JWT secret
npm run dev          # Starts on http://localhost:5000
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev          # Starts on http://localhost:5173
```

### 4. Environment Configuration

**Backend (.env)**:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/budgetbox
JWT_SECRET=your_jwt_secret_key_here_make_it_long_and_secure
NODE_ENV=development
```

**Frontend (.env)**:
```env
VITE_API_URL=http://localhost:5000/api
```

## 🔐 Demo Login Credentials

**Email**: `hire-me@anshumat.org`  
**Password**: `HireMe@2025!`

*These credentials are hard-coded in the seed data and work in both development and production.*

## 📱 Testing Offline Mode

1. **Open the app** in your browser
2. **Add some budget data** in the form
3. **Open DevTools** → Network tab
4. **Go offline** (Disable network or use "Offline" checkbox)
5. **Continue editing** - notice data still saves locally
6. **Check sync status** - should show "Local Only" or "Sync Pending"
7. **Go back online** - click Sync button to sync with server

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   React App     │    │   Express API    │    │    MongoDB      │
│                 │    │                  │    │                 │
│ ┌─────────────┐ │    │ ┌──────────────┐ │    │ ┌─────────────┐ │
│ │  Zustand    │ │◄──►│ │ REST Routes  │ │◄──►│ │ Collections │ │
│ │   Store     │ │    │ └──────────────┘ │    │ │   - users   │ │
│ └─────────────┘ │    │                  │    │ │   - budgets │ │
│                 │    │ ┌──────────────┐ │    │ └─────────────┘ │
│ ┌─────────────┐ │    │ │     JWT      │ │    │                 │
│ │ LocalForage │ │    │ │     Auth     │ │    │                 │
│ │  IndexedDB  │ │    │ └──────────────┘ │    │                 │
│ └─────────────┘ │    │                  │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

### Data Flow
1. **User Input** → Auto-saved to IndexedDB immediately
2. **Zustand Store** → Manages state and triggers saves
3. **Online Detection** → Enables sync when network available
4. **Sync Process** → POST to `/api/budget/sync` with conflict resolution
5. **Dashboard** → Real-time calculations from local/synced data

## 🔄 API Endpoints

### Authentication
- `POST /api/auth/login` - User login with JWT token

### Budget Management
- `GET /api/budget/latest` - Get current month's budget
- `POST /api/budget/sync` - Sync local changes to server

### Health Check
- `GET /api/health` - Server health status

## 🎨 UI/UX Highlights

- **Responsive Design** - Works on mobile, tablet, desktop
- **Auto-save Indicators** - Visual feedback for every save
- **Sync Status** - Clear badges showing data sync state
- **Offline Indicators** - Prominent online/offline status
- **Loading States** - Smooth transitions and loading spinners
- **Error Handling** - User-friendly error messages
- **PWA Features** - Install prompt and native app experience

## 🔧 Development Scripts

### Frontend
```bash
npm run dev        # Development server
npm run build      # Production build
npm run preview    # Preview production build
```

### Backend
```bash
npm run dev        # Development with nodemon
npm start          # Production server
```

## 🚀 Deployment Guide

### Frontend (Vercel)
1. Connect GitHub repository to Vercel
2. Set environment variables: `VITE_API_URL`
3. Deploy automatically on git push

### Backend (Railway)
1. Connect GitHub repository to Railway
2. Set environment variables: `MONGODB_URI`, `JWT_SECRET`, `PORT`
3. Deploy automatically on git push

### Database (MongoDB Atlas)
1. Create cluster on MongoDB Atlas
2. Get connection string
3. Update `MONGODB_URI` in environment variables

## 🧪 Testing Checklist

- [ ] ✅ Login with demo credentials works
- [ ] ✅ Budget form auto-saves on each field change
- [ ] ✅ Dashboard shows correct analytics and charts
- [ ] ✅ Offline mode works (data saves locally)
- [ ] ✅ Online sync works (data syncs to server)
- [ ] ✅ Sync status indicators update correctly
- [ ] ✅ PWA installs and works as native app
- [ ] ✅ Responsive design works on mobile
- [ ] ✅ Service worker caches assets for offline use

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For issues and questions:
- Create an issue on GitHub
- Email: khushipanwargzb@gmail.com

---


**Built with ❤️ by Khushi Panwar**
