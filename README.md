# DMK Campaign HQ — v2

Social Media Campaign Coordination Platform with DMK-inspired design.

## What's New in v2

- **Username + Email auth** (no more phone number login)
- **Separate Tasks & Progress pages** for users
- **Filter toggle buttons** on Tasks page (All / X Post / Retweet / Facebook)
- **Backend pagination** on all list endpoints
- **DMK theme** — red/black/gold, Rajdhani + Noto Sans fonts
- **Full mobile responsiveness** — sidebar drawer, mobile cards, adaptive layouts

## Quick Start (Docker)

```bash
docker-compose up --build
# Frontend → http://localhost:3000
# Backend  → http://localhost:8000
# API Docs → http://localhost:8000/docs
```

## Manual Setup

### Backend
```bash
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env        # edit DATABASE_URL and SECRET_KEY
uvicorn app.main:app --reload --port 8000
python create_admin.py      # creates first admin account
```

### Frontend
```bash
cd frontend
npm install
cp .env.example .env        # edit VITE_API_URL if needed
npm run dev
```

## Default Admin Credentials (after running create_admin.py)

| Field    | Value              |
|----------|--------------------|
| Username | `admin`            |
| Email    | `admin@campaignhq.com` |
| Password | `Admin@123`        |

## Auth Changes

**Registration requires:**
- Name, Username, Email, Password
- District, Constituency (optional)
- Role (user/admin)

**Login accepts:**
- Username + Password **or**
- Email + Password

## API Reference

### Auth
```
POST /auth/register   Body: {name, username, email, password, district?, constituency?, role?}
POST /auth/login      Body: {identifier, password}  ← identifier = username OR email
```

### Tasks (user JWT)
```
GET /tasks/?page=1&page_size=10&platform=x_post   ← unified endpoint with filter
POST /tasks/complete/{id}
GET /tasks/my-progress
```

### Admin (admin JWT)
```
POST /admin/content
POST /admin/upload-excel
GET  /admin/content?page=1&page_size=10&platform=x_post
GET  /admin/content-progress?page=1&page_size=10
GET  /admin/user-progress?page=1&page_size=10&search=query
GET  /admin/stats
```

## Migration Note

If upgrading from v1, run this SQL to alter the users table:
```sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS username VARCHAR UNIQUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS email VARCHAR UNIQUE;
ALTER TABLE users ALTER COLUMN district DROP NOT NULL;
ALTER TABLE users ALTER COLUMN constituency DROP NOT NULL;
-- Set username for existing users (use phone as username temporarily)
UPDATE users SET username = phone_number, email = phone_number || '@placeholder.com' WHERE username IS NULL;
ALTER TABLE users DROP COLUMN IF EXISTS phone_number;
```
Or simply drop and recreate the database for a fresh start.
