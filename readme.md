# Task Management System

A full-stack task management application built with Next.js 14, Node.js, and TypeScript. This project features secure authentication, real-time task updates, and a responsive dashboard with advanced filtering and pagination.

## Tech Stack

### Frontend (Track A)

- Framework: Next.js 14 (App Router)
- Language: TypeScript
- Styling: Tailwind CSS
- Components: shadcn/ui (Radix UI)
- State/API: Axios, React Hooks
- Notifications: Sonner

### Backend

- Runtime: Node.js
- Framework: Express.js
- Database: SQLite (via Prisma ORM)
- Authentication: JWT (Access + Refresh Tokens)
- Validation: Zod
- Security: Bcrypt (Password Hashing)

## Features

### Secure Authentication

- User registration and login
- JWT implementation with secure short-lived access tokens and long-lived refresh tokens
- Automatic token refresh using Axios interceptors to maintain user sessions

### Task Management (CRUD)

- **Create**: Add new tasks instantly
- **Read**: View tasks with a clean, responsive interface
- **Update**: Edit task titles and toggle status (Pending/Completed)
- **Delete**: Remove tasks permanently

### Advanced Functionality

- **Pagination**: Efficiently load tasks in batches (5 per page)
- **Search**: Real-time filtering by task title
- **Filtering**: Sort tasks by status (All / Pending / Completed)
- **Responsive Design**: Fully optimized for desktop and mobile devices

## Screenshots

### Dashboard

View, search, filter, and manage your tasks in one place.

![Dashboard](/assets/2026-02-05-181313_hyprshot.png)

### Login Page

Secure entry point with validation.

![Login Page](/assets/2026-02-05-181227_hyprshot.png)

### Registration Page

New user onboarding.

![Registration Page](/assets/2026-02-05-181207_hyprshot.png)

## Installation & Setup

Follow these steps to run the project locally.

### Prerequisites

- Node.js (v18 or higher)
- npm

### 1. Clone the Repository

```bash
git clone https://github.com/yakitoritrash/task-management-system.git
cd task-management-system
```

### 2. Backend Setup

Navigate to the server folder, install dependencies, and start the API.

```bash
cd server

# Install dependencies
npm install

# Set up environment variables
# Create a .env file in server/ and add:
# DATABASE_URL="file:./dev.db"
# JWT_SECRET="your_super_secret_key_change_this"
# PORT=5000

# Run database migrations (Prisma)
npx prisma migrate dev --name init

# Start the server
npx nodemon src/index.ts
```

Server runs on: http://localhost:5000

### 3. Frontend Setup

Open a new terminal, navigate to the client folder, and start the UI.

```bash
cd client

# Install dependencies
npm install

# Start the Next.js dev server
npm run dev
```

Frontend runs on: http://localhost:3000

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Create a new user account |
| POST | `/auth/login` | Login and receive access/refresh tokens |
| POST | `/auth/refresh` | Generate a new access token |
| GET | `/tasks` | Fetch tasks (supports `?page=`, `?search=`, `?status=`) |
| POST | `/tasks` | Create a new task |
| PATCH | `/tasks/:id` | Update task details or status |
| DELETE | `/tasks/:id` | Delete a task |

## Project Structure

```
task-management-system/
├── client/                 # Next.js Frontend
│   ├── src/app/            # App Router Pages (Login, Dashboard)
│   ├── src/components/ui/  # shadcn/ui Components
│   ├── src/lib/            # API Utilities (Axios interceptors)
│   └── ...
├── server/                 # Express Backend
│   ├── src/controllers/    # Logic for Auth and Tasks
│   ├── src/middleware/     # JWT Verification
│   ├── src/prisma/         # Database Schema
│   └── src/routes/         # API Routes
└── README.md
```

## Contributing

Contributions are welcome. To contribute:

1. Fork the repository
2. Create a new branch (`git checkout -b feature/your-feature-name`)
3. Commit your changes (`git commit -m 'Add some feature'`)
4. Push to the branch (`git push origin feature/your-feature-name`)
5. Open a Pull Request

## License

This project is open source and available under the MIT License.
