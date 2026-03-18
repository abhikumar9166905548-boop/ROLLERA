# 🔐 Full Auth System — Node.js + Express + MongoDB

## Stack
- **Backend:** Node.js, Express.js
- **Database:** MongoDB + Mongoose
- **Auth:** JWT (JSON Web Tokens)
- **Password Hashing:** bcryptjs
- **Email:** Nodemailer (Gmail / any SMTP)
- **Validation:** express-validator
- **Rate Limiting:** express-rate-limit

---

## 📁 Project Structure

```
auth-system/
├── server.js                  # Entry point
├── package.json
├── .env.example               # Copy to .env and fill values
│
├── models/
│   └── User.model.js          # Mongoose User schema
│
├── controllers/
│   └── auth.controller.js     # Signup, login, logout, forgot/reset password
│
├── routes/
│   └── auth.routes.js         # Express routes with validation
│
├── middleware/
│   └── auth.middleware.js     # JWT protect middleware
│
├── utils/
│   └── sendEmail.js           # Nodemailer email utility
│
└── public/
    └── index.html             # Frontend UI (Login / Signup / Forgot)
```

---

## 🚀 Setup & Run

### 1. Install dependencies
```bash
npm install
```

### 2. Setup environment variables
```bash
cp .env.example .env
```
Edit `.env` with your values:
- `MONGO_URI` — your MongoDB connection string
- `JWT_SECRET` — a long random secret string
- `EMAIL_USER`, `EMAIL_PASS` — Gmail credentials (use App Password)
- `CLIENT_URL` — your frontend URL (e.g. `http://localhost:3000`)

### 3. Start the server
```bash
# Development (with auto-restart)
npm run dev

# Production
npm start
```

---

## 📡 API Endpoints

| Method | Endpoint                          | Access  | Description              |
|--------|-----------------------------------|---------|--------------------------|
| POST   | `/api/auth/signup`                | Public  | Register new user        |
| POST   | `/api/auth/login`                 | Public  | Login user               |
| GET    | `/api/auth/me`                    | Private | Get current user         |
| POST   | `/api/auth/logout`                | Private | Logout user              |
| POST   | `/api/auth/forgot-password`       | Public  | Send password reset email|
| PUT    | `/api/auth/reset-password/:token` | Public  | Reset password with token|

---

## 🔒 Using Protected Routes

Add `Authorization: Bearer <token>` header to protected requests:

```js
fetch('/api/auth/me', {
  headers: { 'Authorization': `Bearer ${token}` }
})
```

---

## 📧 Gmail Setup (for password reset email)

1. Go to your Google Account → Security
2. Enable 2-Factor Authentication
3. Go to "App Passwords" → Generate one for "Mail"
4. Use that 16-character password in `EMAIL_PASS`

---

## 🛡️ Security Features

- ✅ Passwords hashed with bcrypt (12 salt rounds)
- ✅ JWT tokens with expiry
- ✅ Rate limiting on auth routes (10 req / 15 min)
- ✅ Input validation on all routes
- ✅ Reset tokens hashed in DB (SHA-256)
- ✅ Reset token expires in 15 minutes
- ✅ Password never returned in API responses
