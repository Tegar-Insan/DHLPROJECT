# 🚀 DHL Incident Management System - Setup & Deployment Guide

## Installation & Running

### 📋 Prerequisites
- Node.js v16+ (check: `node -v`)
- npm v8+ (check: `npm -v`)
- Git
- 2 Terminal windows

---

## ⚡ Quick Start (5 minutes)

### Terminal 1: Backend Setup & Start
```bash
cd backend

# Install dependencies (first time only)
npm install

# Start server
npm start
# Expected output: ✓ DHL Incident Management Backend running on http://localhost:3001
```

### Terminal 2: Frontend Setup & Start
```bash
cd frontend

# Install dependencies (first time only)
npm install

# Start development server
npm start
# Expected output: ✓ VITE ready in XXXms → Local: http://localhost:3000/
```

### Browser
Open **http://localhost:3000** and login with:
- **Username:** `admin` / **Password:** `admin123` (Admin role)
- **Username:** `agent01` / **Password:** `agent123` (Agent role)

---

## ✅ What You Get

### Backend Features ✨
✅ JWT Authentication (24h expiry)
✅ CRUD operations on incidents
✅ Advanced filtering (status, priority, category)
✅ Dashboard statistics endpoint
✅ AI classification endpoint (Claude API ready)
✅ Management reports with analytics
✅ File-based data persistence
✅ CORS enabled for frontend
✅ Health check endpoint

### Frontend Features 🎨
✅ Responsive dashboard with real-time stats
✅ Filterable incident table
✅ Create new incidents with AI classification
✅ View incident details & add notes
✅ Update incident status
✅ Management reports with charts
✅ Protected routes (requires login)
✅ DHL brand colors & modern UI
✅ Mobile-friendly design

---

## 📊 Test Workflow

### 1. Login
```
→ http://localhost:3000/login
→ Username: admin, Password: admin123
→ Click "Login"
```

### 2. View Dashboard
```
→ See stats: Total, Open, In Progress, Resolved incidents
→ View priority breakdown
→ See recent incidents list
```

### 3. View Incidents
```
→ Click "Incidents" in sidebar
→ See list of all 3 sample incidents
→ Try filters (Status, Priority, Category)
→ Click "View" to see incident details
```

### 4. Create New Incident
```
→ Click "New Incident"
→ Fill in:
  - Tracking Number: MY123456789
  - Title: Test Incident
  - Description: This is a test incident
→ Click "🤖 Classify with AI" (see classification result)
→ Click "Create Incident"
```

### 5. Check Reports
```
→ Click "Reports" in sidebar
→ See summary, trends, status distribution
→ View category breakdown with visual charts
```

---

## 🔧 Customization

### Change DHL Brand Colors
Edit `frontend/src/index.css`:
```css
:root {
  --dhl-red: #d4001c;           /* Main brand color */
  --dhl-yellow: #ffcc00;        /* Accent color */
  --dhl-gray-dark: #333333;     /* Sidebar background */
  /* ... other colors */
}
```

### Add More Sample Incidents
Edit `backend/data/incidents.json` - add new objects following the existing structure.

### Enable Claude API Classification
Edit `backend/.env`:
```env
CLAUDE_API_KEY=sk-your-key-here
```

Then update `backend/routes/process.js` to call Claude API instead of returning mock data.

### Change Port Numbers
**Backend:** Edit `backend/.env` → Change `PORT=3001`
**Frontend:** Edit `frontend/vite.config.js` → Change `port: 3000`

---

## 🗄️ Data Storage

Currently uses **JSON files** for demo purposes:
- `backend/data/users.json` → Hardcoded users (admin, agent01)
- `backend/data/incidents.json` → All incidents (persisted to file)

### For Production: Switch to PostgreSQL
Replace `backend/utils/filedb.js` with database queries using a library like `pg` or Sequelize.

---

## 🔐 Security Notes

⚠️ **DEMO MODE SECURITY** - For development only!
- JWT secret is hardcoded (change for production)
- Passwords stored in plaintext (use bcrypt in production)
- No input validation (add validation libraries)
- No rate limiting (add express-rate-limit)
- CORS accepts all origins (restrict in production)

---

## 🐛 Common Issues

### Port Already in Use
```bash
# Find process on port 3001
lsof -i :3001

# Kill it
kill -9 <PID>
```

### Module Not Found Errors
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### API Connection Failed
```bash
# Ensure backend is running
curl http://localhost:3001/api/health
# Should return: {"status":"OK","timestamp":"2024-05-14T..."}
```

### CORS Errors
Check that `backend/.env` has `PORT=3001` and `frontend/.env` has `VITE_API_BASE_URL=http://localhost:3001`

---

## 📱 API Examples

### Login (Get JWT Token)
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# Response:
# {
#   "token": "eyJhbGciOiJIUzI1NiIs...",
#   "user": {"id": "usr_001", "username": "admin", "role": "admin", ...}
# }
```

### Get All Incidents (with filters)
```bash
curl -X GET "http://localhost:3001/api/incidents?status=open&priority=HIGH" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Create New Incident
```bash
curl -X POST http://localhost:3001/api/incidents \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "trackingNumber": "MY123456789",
    "title": "Test Incident",
    "description": "This is a test",
    "priority": "HIGH",
    "category": "Damage"
  }'
```

### Get Dashboard Stats
```bash
curl -X GET http://localhost:3001/api/incidents/stats \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 🚀 Deployment Options

### Option 1: Heroku (Free tier available)
```bash
# Backend
heroku create dhl-incident-backend
git push heroku main

# Frontend (via Vercel)
npm run build
# Deploy dist/ folder to Vercel
```

### Option 2: DigitalOcean (Recommended for DHL)
```bash
# Create Ubuntu VM
# SSH into server
# Install Node.js, git
# Clone repo
# Run backend & frontend with PM2

pm2 start backend/server.js --name "dhl-backend"
pm2 start "cd frontend && npm start" --name "dhl-frontend"
pm2 startup
pm2 save
```

### Option 3: Docker + Docker Compose
Create `docker-compose.yml` to run both services in containers.

---

## 📈 Next Steps

### Immediate (Week 1)
- [ ] Test all features locally
- [ ] Add more sample incidents
- [ ] Customize with actual DHL data

### Short-term (Week 2-3)
- [ ] Integrate Claude API for classifications
- [ ] Replace JSON with PostgreSQL
- [ ] Add email notifications
- [ ] Implement audit logging

### Medium-term (Month 2)
- [ ] UiPath RPA workflow integration
- [ ] Advanced analytics & dashboards
- [ ] Email attachment support
- [ ] Mobile app (React Native)

### Long-term (Month 3+)
- [ ] Multi-tenant support
- [ ] Integration with external systems
- [ ] Machine learning for pattern detection
- [ ] 24/7 monitoring & alerts

---

## 📞 Support & Contact

**Questions?** Review the main README.md or check individual component files for inline comments.

**Bug reports?** Describe:
1. What you were doing
2. Expected behavior
3. Actual behavior
4. Browser/terminal output

---

## 📄 File Summary

| File | Purpose |
|------|---------|
| `backend/server.js` | Express server entry point |
| `backend/routes/*.js` | API endpoint handlers |
| `backend/middleware/auth.js` | JWT & RBAC logic |
| `backend/utils/filedb.js` | File-based persistence |
| `frontend/src/App.jsx` | Router & auth protection |
| `frontend/src/api.js` | Axios HTTP client |
| `frontend/src/context/AuthContext.jsx` | Auth state management |
| `frontend/src/pages/*.jsx` | Page components |
| `frontend/src/index.css` | Global styles + DHL branding |

---

## ✨ Key Architecture Decisions

✅ **Vite instead of Create React App** → Faster dev server & builds
✅ **React Router v6** → Modern routing with hooks
✅ **Axios with interceptors** → Automatic token injection
✅ **File-based DB for demo** → Zero setup, easy testing
✅ **JWT tokens** → Stateless authentication
✅ **CSS-in-JS via CSS variables** → Consistent branding
✅ **Protected routes** → Automatic redirect to login
✅ **API client layer** → Centralized endpoint management

---

Enjoy! 🎉
