# Store Rating Platform

A full-stack web application that allows users to submit ratings (1–5) for stores registered on the platform. Built with role-based access control for System Administrators, Normal Users, and Store Owners.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React.js (Vite) |
| Backend | Express.js |
| Database | PostgreSQL |
| Auth | JWT (JSON Web Tokens) |

## Features

### System Administrator
- Dashboard with total users, stores, and ratings
- Create and manage users (admin, normal user, store owner)
- Create and manage stores with owner assignment
- View/filter/sort user and store listings
- Delete users

### Normal User
- Self-registration and login
- Browse and search stores by name/address
- Submit and modify ratings (1–5 stars)
- Update password and delete account

### Store Owner
- Dashboard showing average rating and user ratings
- View list of users who submitted ratings
- Update password

### Additional
- Forgot password (verify via registered address)
- Form validations (name 20-60 chars, password 8-16 with uppercase + special char, email format, address max 400 chars)
- Sortable tables (ascending/descending)
- Responsive dark-themed UI

## Getting Started

### Prerequisites
- Node.js (v18+)
- PostgreSQL (v14+)

### 1. Clone the repository
```bash
git clone <repository-url>
cd store-rating-platform
```

### 2. Set up the database
```bash
psql -U postgres -c "CREATE DATABASE store_rating_platform;"
```

### 3. Configure the backend
```bash
cd backend
cp .env.example .env
# Edit .env with your PostgreSQL password and a JWT secret
npm install
```

### 4. Start the backend
```bash
node server.js
```
The server auto-creates tables and seeds a default admin user on first run.

**Default Admin Credentials:**
- Email: `admin@storerating.com`
- Password: `Admin@1234`

### 5. Set up and start the frontend
```bash
cd frontend
npm install
npx vite
```

The app opens at `http://localhost:5173`

## Project Structure

```
├── backend/
│   ├── config/
│   │   ├── db.js              # PostgreSQL connection pool
│   │   └── initDb.js          # Table creation & seeding
│   ├── middleware/
│   │   ├── auth.js            # JWT auth & role authorization
│   │   └── validate.js        # Form validation middleware
│   ├── routes/
│   │   ├── auth.js            # Login, signup, password reset
│   │   ├── users.js           # User CRUD (admin)
│   │   ├── stores.js          # Store CRUD & ratings
│   │   └── dashboard.js       # Admin & store owner stats
│   ├── server.js              # Express entry point
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/        # Layout, shared components
│   │   ├── context/           # Auth context
│   │   ├── pages/             # All page components
│   │   └── utils/             # API client
│   ├── index.html
│   └── vite.config.js
└── README.md
```

## Database Schema

- **users** — id, name, email, password_hash, address, role, created_at
- **stores** — id, name, email, address, owner_id (FK → users), created_at
- **ratings** — id, user_id (FK → users), store_id (FK → stores), rating (1-5), created_at, updated_at, UNIQUE(user_id, store_id)
