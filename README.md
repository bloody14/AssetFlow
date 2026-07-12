# AssetFlow 🏢

An enterprise-grade asset management, allocation, booking, and maintenance system built with React, Node.js, Express, and Prisma.

## Current Project Status & Missing Files 🚨
**Important Note:** The **Backend** is 100% complete, fully verified, and production-ready inside the `/backend` directory. However, the **Frontend source files are currently missing**. The `/src` directory at the root is completely empty. There are no React components, pages, or routing files yet.

To proceed with frontend development, you will need to populate the `/src` folder with your React application (e.g., `main.tsx`, `App.tsx`, components).

## Integration Setup 🔗

To prepare for when the frontend files are added, the integration architecture has already been set up:

1. **Backend CORS**: The backend is configured to accept requests from the Vite frontend at `http://localhost:5173` with credentials enabled (for JWT cookies).
2. **Frontend Proxy**: The `vite.config.ts` is configured to proxy all requests starting with `/api/v1` to the backend server at `http://localhost:3000`. This avoids CORS issues during local development.

When writing frontend code, you can fetch data directly via relative paths:
```typescript
// Example: This will automatically proxy to http://localhost:3000/api/v1/auth/login
const response = await fetch('/api/v1/auth/login', {
  method: 'POST',
  // ...
});
```

## Running the Application 🚀

### 1. Start the Backend
```bash
cd backend
npm install
# Set up .env with DATABASE_URL and JWT_SECRET
npx prisma generate
npx prisma migrate dev
npm run build
npm start
```

### 2. Start the Frontend
```bash
# From the root directory
npm install
npm run dev
```

## Docker Deployment 🐳
The backend is fully dockerized. Navigate to the `/backend` directory and run:
```bash
docker-compose up --build -d
```
This will spin up the Node server and the PostgreSQL database simultaneously.
