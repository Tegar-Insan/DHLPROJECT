# DHL APSSC Incident Management System

A modern web-based incident management system for DHL APSSC (Asia Pacific, Sub-Saharan Africa & Central Asia) with AI-powered classification, real-time analytics, and comprehensive reporting.

## 🚀 Quick Start

### Prerequisites
- **Node.js** v16+ (with npm)
- **Linux/Mac/Windows** with bash support

### Step 1: Install Backend Dependencies
```bash
cd backend
npm install
```

### Step 2: Install Frontend Dependencies
```bash
cd frontend
npm install
```

### Step 3: Start Backend (Terminal 1)
```bash
cd backend
npm start
# → Running on http://localhost:3001
```

### Step 4: Start Frontend (Terminal 2)
```bash
cd frontend
npm start
# → Opens http://localhost:3000
```

### Step 5: Login
Use one of the demo credentials:

| Role  | Username | Password  |
|-------|----------|-----------|
| Admin | admin    | admin123  |
| Agent | agent01  | agent123  |

---

## 📁 Project Structure

```
dhl-incident-system/
├── backend/                    # Node.js + Express backend
│   ├── server.js              # Main server entry point
│   ├── package.json           # Dependencies
│   ├── .env                   # Configuration (JWT_SECRET, etc.)
│   ├── middleware/
│   │   └── auth.js            # JWT authentication & RBAC
│   ├── routes/
│   │   ├── auth.js            # Login & token verification
│   │   ├── incidents.js       # CRUD + filtering + stats
│   │   ├── process.js         # LLM classification endpoint
│   │   └── reports.js         # Dashboard & management reports
│   ├── utils/
│   │   ├── jwt.js             # JWT token generation/verification
│   │   └── filedb.js          # File-based data persistence
│   └── data/
│       ├── users.json         # Admin + Agent users
│       └── incidents.json     # All incidents (3 samples)
│
└── frontend/                   # React + Vite frontend
    ├── index.html             # HTML entry point
    ├── package.json           # Dependencies (React, Axios, React Router)
    ├── vite.config.js         # Vite build configuration
    ├── .env                   # Frontend config (API_BASE_URL)
    ├── src/
    │   ├── main.jsx           # React entry point
    │   ├── App.jsx            # Router setup & auth protection
    │   ├── index.css          # Global styles + DHL colors
    │   ├── api.js             # Axios API client with interceptors
    │   ├── context/
    │   │   └── AuthContext.jsx # Auth state & hooks
    │   ├── components/
    │   │   ├── Navbar.jsx     # Top navigation
    │   │   └── Sidebar.jsx    # Left sidebar menu
    │   └── pages/
    │       ├── Login.jsx      # Login form
    │       ├── Dashboard.jsx  # Stats & analytics
    │       ├── IncidentList.jsx  # Filterable incident table
    │       ├── IncidentDetail.jsx # Single incident + notes
    │       ├── NewIncident.jsx    # Create + AI classification
    │       └── Reports.jsx        # Management reports
```

---

## 🔌 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Login (returns JWT token) |
| GET | `/api/auth/verify` | Verify token |

### Incidents
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/incidents` | List all (with filters: `?status=open&priority=HIGH&category=Damage`) |
| GET | `/api/incidents/:id` | Get single incident |
| POST | `/api/incidents` | Create incident |
| PUT | `/api/incidents/:id` | Update incident |
| PATCH | `/api/incidents/:id/status` | Update status only |
| DELETE | `/api/incidents/:id` | Delete incident |
| GET | `/api/incidents/stats` | Dashboard stats (counts, trends, etc.) |

### AI Processing
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/process/classify` | LLM classification (`{ text: "..." }`) |

### Reports
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/reports/summary` | Management summary report |

### Health
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |

---

## 🎨 Features

### Dashboard
- **Real-time stats**: Total, open, in-progress, resolved incidents
- **Priority breakdown**: HIGH, MEDIUM, LOW, ZERO
- **Category analysis**: Incidents by category
- **Recent incidents**: Last 5 incidents with quick links

### Incident Management
- **Create**: Submit raw incident description
- **AI Classification** (Claude API): Auto-classify priority & category
- **List**: Filterable table (status, priority, category)
- **Detail**: Full view with notes and status updates
- **Delete**: Archive or remove incidents

### Reporting
- **Incident trends**: This week vs last week
- **Status distribution**: Open, in-progress, resolved
- **Priority breakdown**: Risk assessment
- **Category analysis**: Operational insights
- **Resolution metrics**: Avg resolution time

### Security
- **JWT Authentication**: Bearer token in Authorization header
- **RBAC**: Admin vs Agent roles
- **Protected Routes**: Login required for all pages except `/login`

---

## 🛠️ Technology Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Frontend | React 18 | Latest |
| Frontend Build | Vite | Latest |
| Frontend Router | React Router v6 | Latest |
| Frontend HTTP | Axios | Latest |
| Backend | Node.js | v16+ |
| Backend Framework | Express | Latest |
| Backend Auth | JWT (jsonwebtoken) | Latest |
| Data Storage | JSON Files | (Demo only) |
| CORS | cors | Latest |

---

## 🔐 Authentication Flow

1. **Login**: POST `/api/auth/login` → Returns JWT token
2. **Store**: Save token to `localStorage` (AuthContext)
3. **Request**: Axios interceptor adds `Authorization: Bearer {token}`
4. **Verify**: Backend validates JWT in `authMiddleware`
5. **Access**: Only authenticated users can access protected routes

---

## 📊 Sample Data

The system comes with 3 pre-loaded incidents:

- **INC-001** (MY987623400): Damaged coffee machine during transit → HIGH priority
- **INC-002** (MY44567789): Address change not actioned, parcel missing → MEDIUM priority
- **INC-003** (MY556677890): COD overcharge (RM450 vs RM250) → MEDIUM priority

---

## 🔄 UiPath Integration (Next Phase)

The system is designed to integrate with **UiPath RPA workflows**:

1. **FetchEmails.cs** → Gmail monitoring → Extract incident text
2. **ProcessWithLLM.cs** → Call Claude API → Classify incident
3. **PostToWebApp.cs** → HTTP POST to `/api/incidents` → Create incident

Simply POST JSON:
```json
{
  "trackingNumber": "MY123456789",
  "title": "Classified Title",
  "description": "Full incident description",
  "priority": "HIGH",
  "category": "Damage"
}
```

---

## 🎓 Learning Path

### For Backend Developers
1. Start with `backend/server.js` → Understand Express setup
2. Review `backend/routes/auth.js` → JWT flow
3. Explore `backend/routes/incidents.js` → CRUD patterns
4. Check `backend/middleware/auth.js` → Authorization logic
5. Study `backend/utils/filedb.js` → File-based persistence

### For Frontend Developers
1. Start with `frontend/src/App.jsx` → Router setup
2. Review `frontend/src/context/AuthContext.jsx` → State management
3. Explore `frontend/src/api.js` → API client patterns
4. Check `frontend/src/pages/Dashboard.jsx` → Data fetching
5. Study `frontend/src/components/` → Reusable components

---

## 🚨 Troubleshooting

### Backend won't start
```bash
# Check if port 3001 is free
lsof -i :3001

# Kill process if needed
kill -9 <PID>

# Check Node version
node -v  # Should be v16+
```

### Frontend won't start
```bash
# Clear node_modules and reinstall
rm -rf frontend/node_modules frontend/package-lock.json
cd frontend && npm install
npm start
```

### Login fails
- Verify backend is running: `curl http://localhost:3001/api/health`
- Check `.env` files are correctly configured
- Verify `VITE_API_BASE_URL` in `frontend/.env` points to backend

### AI classification not working
- Add your Claude API key to `backend/.env`: `CLAUDE_API_KEY=sk-...`
- Currently returns mock classification (ready for Claude API integration)

---

## 📝 Environment Variables

### Backend (`backend/.env`)
```env
PORT=3001
JWT_SECRET=dhl_incident_secret_key_change_in_production
CLAUDE_API_KEY=your_claude_api_key_here
NODE_ENV=development
```

### Frontend (`frontend/.env`)
```env
VITE_API_BASE_URL=http://localhost:3001
```

---

## 🤝 Contributing

1. Create a feature branch: `git checkout -b feature/my-feature`
2. Make changes and test locally
3. Submit pull request with detailed description

---

## 📄 License

Internal DHL Project - Do Not Share

---

## 📞 Support

For issues or questions, reach out to the development team.

---

## ✅ Deployment Checklist (For Production)

- [ ] Change `JWT_SECRET` in `backend/.env`
- [ ] Set `NODE_ENV=production` in `backend/.env`
- [ ] Replace JSON file storage with real database (PostgreSQL recommended)
- [ ] Set up HTTPS/SSL certificates
- [ ] Configure CORS for production domain
- [ ] Add rate limiting on API endpoints
- [ ] Implement proper error logging & monitoring
- [ ] Add email notifications for incidents
- [ ] Set up automated backups
- [ ] Configure UiPath webhook authentication
