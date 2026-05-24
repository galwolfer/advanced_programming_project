# WeTube Web (Advanced)

This app is now a full-stack project:
- Frontend: React (Create React App)
- Backend: Node.js + Express
- Database: MongoDB (Mongoose)

## Features

- User sign-up and sign-in with password hashing (`bcryptjs`)
- JWT authentication (persistent session)
- Video feed from MongoDB with:
  - Search
  - Category filtering
  - Sort (latest, most viewed, most liked)
- Video page with:
  - Like/unlike persistence
  - View counter persistence
  - Comment create/delete persistence
  - Owner-only video deletion
- Upload page to publish new videos (URL-based media fields)
- Initial automatic seeding from `src/videos.json` into MongoDB

## Prerequisites

- Node.js 18+
- MongoDB running locally or remotely

## Setup

### 1. Install frontend dependencies

```bash
npm install
```

### 2. Install backend dependencies

```bash
npm --prefix server install
```

### 3. Configure backend environment

Copy `server/.env.example` to `server/.env` and set:

```env
PORT=5001
MONGODB_URI=mongodb://127.0.0.1:27017/wetube
JWT_SECRET=change-me-in-production
CLIENT_ORIGIN=http://localhost:3000
```

### 4. Configure frontend environment (optional)

Copy `.env.example` to `.env` if you need a custom API URL:

```env
REACT_APP_API_BASE_URL=http://localhost:5001/api
```

## Run

### Run both frontend + backend together

```bash
npm run dev
```

### Or run separately

Frontend:

```bash
npm start
```

Backend:

```bash
npm run start:server
```

## API Overview

- `POST /api/auth/signup`
- `POST /api/auth/signin`
- `GET /api/auth/me`
- `GET /api/videos`
- `GET /api/videos/:id`
- `POST /api/videos`
- `DELETE /api/videos/:id`
- `POST /api/videos/:id/view`
- `POST /api/videos/:id/like`
- `POST /api/videos/:id/comments`
- `DELETE /api/videos/:id/comments/:commentId`

## Notes

- Seed user credentials (only if DB starts empty):
  - Username: `seed_user`
  - Password: `SeedUser123`
- For production, use HTTPS, stronger JWT secret management, and a real media upload storage flow (S3/Cloudinary).
