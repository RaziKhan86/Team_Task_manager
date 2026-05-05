# Team Task Manager - MERN Stack

A full-stack Team Task Manager with authentication, project management, team members, tasks, status tracking, dashboard stats, and Admin/Member role-based access.

## Tech Stack

- MongoDB
- Express.js
- React + Vite
- Node.js
- JWT authentication

## Setup

1. Install dependencies:

```bash
npm install
npm run install:all
```

2. Create backend environment file:

```bash
copy backend\.env.example backend\.env
```

3. Update `backend/.env` with your MongoDB connection string.

4. Run both apps:

```bash
npm run dev
```

Frontend: `http://localhost:5173`

Backend: `http://localhost:5000`

## Demo Data

After setting `backend/.env`, run:

```bash
npm run seed --prefix backend
```

Demo login:

- Admin: `admin@example.com` / `password123`
- Member: `priya@example.com` / `password123`

## Roles

- Admin: create projects, manage members, create/update/delete tasks, assign tasks.
- Member: view assigned projects/tasks and update task status.
