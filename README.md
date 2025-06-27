# Personal Goal Tracker

A full-stack application designed for users to manage and track their personal goals. Built with NestJS for the backend API, PostgreSQL for data storage, and React/TypeScript for the frontend.

## Features

*   **User Authentication:**
    *   User registration and login.
    *   JWT (JSON Web Tokens) for securing API endpoints.
*   **Goal Management (User-Specific):**
    *   Create new goals with a description.
    *   View a list of all personal goals.
    *   Update existing goals (e.g., modify description, change status).
    *   Delete goals.
    *   Set and update goal status (e.g., "To Do", "In Progress", "Completed", "On Hold").
*   **Data Persistence:**
    *   All user and goal data is stored in a PostgreSQL database.

## Tech Stack

**Backend:**

*   **Framework:** NestJS (Node.js)
*   **Language:** TypeScript
*   **Database:** PostgreSQL
*   **ORM:** TypeORM
*   **Authentication:** Passport.js (JWT Strategy)
*   **Validation:** `class-validator`, `class-transformer`

**Frontend:**

*   **Library:** React JS
*   **Language:** TypeScript
*   **State Management:** React Context API / Local State (Redux can be added if complexity grows)
*   **Routing:** React Router
*   **HTTP Client:** Axios with custom interceptors for authentication
*   **Styling:** Tailwind CSS
*   **Testing:** Jest and React Testing Library
*   **Frontend Services:**
    * `apiClient` - Wrapper for Axios with auth token management and refresh capability
    * `goalService` - Service for goal-related CRUD operations
    * `authService` - Authentication service for login, register, and user management

## Prerequisites

*   Docker and Docker Compose (for running PostgreSQL)
*   Node.js (v18.x or later recommended)
*   npm (v8.x or later) or yarn
*   Git

## Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd personal-goal-tracker
```

### 2. Set Up Environment Variables

Navigate to the `backend` directory and create a `.env` file by copying the `.env.example` file:

```bash
cd backend
cp .env.example .env
```

Update the `.env` file with your desired settings if necessary. The default values should work with the Docker Compose setup.

### 3. Start the PostgreSQL Database

Make sure Docker is running on your system. Then, from the project root directory (`personal-goal-tracker`), run:

```bash
docker-compose up -d
```

This command will start a PostgreSQL container in detached mode. The database will be accessible on `localhost:5432` with the credentials specified in `docker-compose.yml` (and matching the defaults in `.env.example`).

### 4. Install Backend Dependencies

Navigate to the `backend` directory and install the dependencies:

```bash
cd backend
npm install
```

### 5. Run the Backend Application

Once the dependencies are installed and the database is running, you can start the NestJS backend application:

```bash
npm run start:dev
```

The application will be running on `http://localhost:3000`.

## Testing

The application includes both unit tests and integration (e2e) tests. The test suite is configured to use a separate test database to ensure your development data remains intact.

### Testing Technologies

- **Jest**: Primary testing framework for both unit and integration tests
- **Supertest**: HTTP assertion library for API endpoint testing
- **TypeORM Testing**: Database testing utilities for TypeORM entities
- **Test Doubles**: Mocks, stubs, and spies for isolating components

### 1. Set Up Test Environment

Ensure you have a test database configuration by creating a `.env.test` file in the `backend` directory:

```bash
cp backend/.env.example backend/.env.test
```

Update the `.env.test` file to use a different database name (e.g., `goal_tracker_test_db`). The test database should be separate from your development database.

### 2. Running Unit Tests

Unit tests verify individual components in isolation, using mocks for external dependencies. These are the standard tests that run during regular development cycles.

```bash
cd backend
npm run test
```

This command runs **ONLY the unit tests** (`.spec.ts` files) in the project. It does **NOT** run the e2e tests.

Additional unit test commands:

```bash
# Watch for changes and automatically re-run unit tests
npm run test:watch

# Generate a test coverage report for unit tests
npm run test:cov
```

### 3. Running End-to-End (E2E) Tests

E2E tests verify the entire application stack, including real database interactions. **These tests are completely separate from unit tests** and require additional setup.

**Important:**
- E2E tests are NOT run with the regular `npm run test` command
- E2E tests require a separate test database
- E2E tests will reset the test database on each run

#### a. Set up the Test Database

Before running E2E tests, you **MUST** create a separate test database:

**Option 1: Using psql directly** (if PostgreSQL is installed locally):

```bash
# Start PostgreSQL client
psql -U postgres

# Create the test database
CREATE DATABASE goal_tracker_test_db;

# Verify it was created
\l

# Exit PostgreSQL client
\q
```

**Option 2: Using Docker** (if using the Docker setup):

```bash
# Execute PostgreSQL command in Docker container
docker exec -it goal-tracker-postgres bash -c "psql -U goaltracker_dev_user goal_tracker_dev_db -c 'CREATE DATABASE goal_tracker_test_db;'"
```

#### b. Configure the Test Environment

Make sure your `.env.test` file points to the test database:

```
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=your_database_user  # Use the same as in root .env file
DATABASE_PASSWORD=your_database_password  # Use the same as in root .env file
DATABASE_NAME=goal_tracker_test_db  # This should be your test database
```

#### c. Run the E2E Tests

E2E tests must be run with a dedicated command:

```bash
cd backend
npm run test:e2e
```

### Testing Architecture

The testing architecture is structured as follows:

- **Unit tests** (`.spec.ts` files): Located alongside the files they test in the `src` directory
- **Integration tests** (`.e2e-spec.ts` files): Located in the `test` directory
- **Test utilities**: Located in the `test` directory to support test setup and teardown

The test database is automatically set up and torn down during the integration test process.

### 4. Frontend Testing

The frontend uses Jest and React Testing Library for testing components and services.

```bash
# Navigate to the frontend directory
cd frontend

# Run tests
npm test
```

#### Frontend Test Structure

- **Service Tests**: Located in `src/services/__tests__/` directory to test the API client and service methods
- **Testing Setup**: `setupTests.js` provides mock implementations for browser APIs like localStorage
- **Babel Configuration**: The project includes babel.config.js to properly support TypeScript and React in tests
