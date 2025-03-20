# Flock! - an events platform enabling users to discover, book, and attend diverse experiences.&nbsp;🎟️✨

## Summary

A responsive events platform that allows users to browse events, register, and manage their tickets/bookings. The platform consists of a backend service built with Fastify, Prisma, and PostgreSQL, and a frontend application built with Next.js.

## Features

- **User Authentication:** Users can register, login, and manage their accounts.
- **Event Browsing:** Users can browse events by category and view event details.
- **Event Registration:** Users can register for events and manage their tickets.
- **Management Panel:** Administrators & Organizers can create, update, and delete events.
- **Role-Based Access Control:** Different user roles (attendee, organizer, admin) have different permissions.

## Live Apps

- [Backend](https://project-v1-launchpad.onrender.com)
- [Frontend](https://project-v1-launchpad.vercel.app/)

## Getting Started

1.  **Clone the repository:**

    ```bash
    git clone [repository URL]
    ```

2.  **Run the setup script:**

    ```bash
    sh setup.sh
    ```

    This script will:

    - Install dependencies for both the backend and frontend.
    - Prompt you for backend environment variables (Database URL, JWT Secret, Port, CORS Origin).
    - Create a `.env.development` file in the `backend` directory.
    - Run database migrations for the backend.
    - Optionally seed the backend database.
    - Prompt you for the frontend public API URL.
    - Create a `.env.local` file in the `frontend` directory.
    - Start the development servers for both the backend and frontend.

Alternatively, you can follow the manual setup instructions below.

## Manual Setup Instructions

#### Backend Setup

1.  **Navigate to the backend directory:**

    ```bash
    cd backend
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    ```

3.  **Set up the environment variables:**

    Create a `.env.development` file in the `backend` directory and add the following variables:

    ```
    DATABASE_URL="postgresql://postgres:password@127.0.0.1:5432/database"
    JWT_SECRET="your-custom-secret-key"
    PORT=custom-"port-number" (optional)
    CORS_ORIGIN="*" # or your frontend URL
    ```

    - `DATABASE_URL`: Your PostgreSQL database connection string.
    - `JWT_SECRET`: A secret key for signing JWT tokens. **Important:** Use a strong, randomly generated key in production.
    - `PORT`: The port the server will be running on. Defaults to 3001 if not specified.
    - `CORS_ORIGIN`: The origin of your frontend application. Set to `*` to allow all origins (not recommended for production).

4.  **Run database migrations:**

    ```bash
    npm run prisma:migrate:dev
    ```

5.  **Seed the database (optional):**

    ```bash
    npm run seed:dev
    ```

6.  **Start the development server:**

    ```bash
    npm run dev
    ```

    The server will be running on `http://localhost:3001` by default.

#### Frontend Setup

1.  **Navigate to the frontend directory:**

    ```bash
    cd frontend
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    ```

3.  **Set up the environment variables:**

    Create a `.env.local` file in the `frontend` directory and add the following variable:

    ```
    NEXT_PUBLIC_BACKEND_URL="http://localhost:3001" # or your backend URL
    ```

    - `NEXT_PUBLIC_BACKEND_URL`: The URL of your backend service.

4.  **Start the development server:**

    ```bash
    npm run dev
    # or
    yarn dev
    # or
    pnpm dev
    # or
    bun dev
    ```

    Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Test Account Access

Seeding required.

    email: admin@example.com
    password: admin123
    role: ADMIN

    email: organizer1@example.com
    password: organizer123
    role: ORGANIZER

    email: attendee1@example.com
    password: attendee123

## Testing

Before running the tests, you must create a `.env.test` file in the `backend` directory with the necessary environment variables. Use the following template:

```
DATABASE_URL="postgresql://postgres:password@127.0.0.1:5432/database"
JWT_SECRET="your-custom-secret-key"
PORT=custom-"port-number" (optional)
CORS_ORIGIN="*" # or your frontend URL (optional for testing)
```

To run the tests:

```bash
npm test
```

## Technologies Used

- **Backend:**
  - Fastify
  - Prisma
  - PostgreSQL
  - JWT
- **Frontend:**
  - Next.js
  - React
  - Tailwind CSS
