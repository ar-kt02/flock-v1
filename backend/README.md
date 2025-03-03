# Event Platform Backend

## Summary

This is a backend service for an events platform, built with Fastify, Prisma, and PostgreSQL. It provides APIs for user authentication, event management, and more.

## Setup Instructions

Navigate to directory:

```bash
cd frontend
```

Run the setup script in the terminal:

```bash
sh setup.sh
```

Alternatively,

1.  **Install dependencies:**

    ```bash
    npm install
    ```

2.  **Set up the environment variables:**

    Create a `.env.development` file in the `backend` directory and add the following variables:

    ```
    DATABASE_URL="postgresql://postgres:password@127.0.0.1:5432/database"
    JWT_SECRET="your-custom-secret-key"
    PORT=custom-port-number
    CORS_ORIGIN="*" # or your frontend URL
    ```

    - `DATABASE_URL`: Your PostgreSQL database connection string.
    - `JWT_SECRET`: A secret key for signing JWT tokens. **Important:** Use a strong, randomly generated key in production.
    - `PORT`: The port the server will be running on. Defaults to 3000 if not specified.
    - `CORS_ORIGIN`: The origin of your frontend application. Set to `*` to allow all origins (not recommended for production).

3.  **Run database migrations:**

    ```bash
    npm run prisma:migrate:dev
    ```

4.  **Seed the database (optional):**

    ```bash
    npm run seed:dev
    ```

5.  **Start the development server:**

    ```bash
    npm run dev
    ```

    The server will be running on `http://localhost:3000` by default.

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

Before running the tests, you must create a `.env.test` file with the necessary environment variables. Use the following template:

```
DATABASE_URL="postgresql://postgres:password@127.0.0.1:5432/database"
JWT_SECRET="your-custom-secret-key"
PORT=custom-port-number (optional)
CORS_ORIGIN="*" # or your frontend URL (optional for testing)
```

To run the tests:

```bash
npm test
```
