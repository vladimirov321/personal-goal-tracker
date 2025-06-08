# Personal Goal Tracker

A full-stack application designed for users to manage and track their personal goals. Built with NestJS for the backend API, PostgreSQL for data storage, and React for the frontend.

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
*   **State Management:** React Context API / Local State (Redux can be added if complexity grows)
*   **Routing:** React Router
*   **HTTP Client:** Axios (or Fetch API)
*   **Styling:** Tailwind CSS

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
