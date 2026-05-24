

# Project Overview

DevPulse is a backend issue tracking system designed for software teams.

The platform supports:

* User authentication with JWT
* Role-based authorization
* Bug and feature request management
* Dynamic filtering and sorting
* Secure protected routes
* Manual relational data mapping without SQL JOINs

All APIs were tested using Postman.

---

# Tech Stack

## Backend

* Node.js
* Express.js
* TypeScript

## Database

* PostgreSQL
* Raw SQL (`pool.query()`)

## Authentication & Security

* JWT (jsonwebtoken)
* bcrypt

## Validation & Utilities

* Zod
* http-status-codes
* dotenv
* cors

---

# Features

* User registration and login
* JWT-based authentication
* Role-based authorization
* Contributor and Maintainer roles
* Create issue
* Get all issues with filtering and sorting
* Get single issue
* Update issue with ownership validation
* Delete issue (maintainer only)
* Dynamic SQL query building
* Secure password hashing
* Centralized response handling
* PostgreSQL relational database integration
* RESTful API architecture
* Postman API testing

---

# User Roles

| Role        | Permissions                                        |
| ----------- | -------------------------------------------------- |
| contributor | Create issues, view issues, update own open issues |
| maintainer  | Full issue management including update and delete  |

---

# API Endpoints

## Authentication Routes

### Register User

```http
POST /api/auth/signup
```

### Login User

```http
POST /api/auth/login
```

---

## Issue Routes

### Create Issue

```http
POST /api/issues
```

Protected Route

---

### Get All Issues

```http
GET /api/issues
```

### Query Parameters

| Parameter | Values                      |
| --------- | --------------------------- |
| sort      | newest, oldest              |
| type      | bug, feature_request        |
| status    | open, in_progress, resolved |

Example:

```http
GET /api/issues?type=bug&status=open&sort=newest
```

---

### Get Single Issue

```http
GET /api/issues/:id
```

---

### Update Issue

```http
PATCH /api/issues/:id
```

Protected Route

Rules:

* Maintainer can update any issue
* Contributor can update only own issue when status is `open`

---

### Delete Issue

```http
DELETE /api/issues/:id
```

Protected Route (Maintainer Only)

---

# Database Schema Summary

## Users Table

| Column     | Type               |
| ---------- | ------------------ |
| id         | SERIAL PRIMARY KEY |
| name       | VARCHAR            |
| email      | VARCHAR UNIQUE     |
| password   | TEXT               |
| role       | VARCHAR            |
| created_at | TIMESTAMP          |
| updated_at | TIMESTAMP          |

---

## Issues Table

| Column      | Type               |
| ----------- | ------------------ |
| id          | SERIAL PRIMARY KEY |
| title       | VARCHAR(150)       |
| description | TEXT               |
| type        | VARCHAR            |
| status      | VARCHAR            |
| reporter_id | INTEGER            |
| created_at  | TIMESTAMP          |
| updated_at  | TIMESTAMP          |

---

# Project Structure

```bash
src/
│
├── app.ts
├── server.ts
│
├── config/
├── db/
├── middlewares/
├── modules/
│   ├── auth/
│   └── issues/
├── utils/
├── types/
└── interfaces/
```

---

# Installation & Setup

## Clone Repository

```bash
git clone https://github.com/dev-peyas9911/DevPulse-Node.js-Express.js-PostgreSQL-Project.git
```

## Move Into Project Directory

```bash
cd devpulse-api
```

## Install Dependencies

```bash
npm install
```

## Create Environment File

Create a `.env` file in the root directory:

```env
PORT=5000
connectionString=your_postgresql_connection_url
jwt_secret=your_secret_key
NODE_ENV=development
```

---

# Run Project

## Development Mode

```bash
npm run dev
```

## Production Build

```bash
npm run build
```

## Start Production Server

```bash
npm start
```

---

# Authentication Flow

1. User registers an account
2. Password is hashed using bcrypt
3. User logs in with credentials
4. Server generates JWT token
5. Client sends token in Authorization header
6. Protected routes verify token before access

Example Header:

```http
Authorization: YOUR_JWT_TOKEN
```

---

# Validation & Security

* Passwords are securely hashed
* JWT protected routes
* Role-based access control
* Input validation using Zod
* SQL injection prevention using parameterized queries
* Protected ownership-based updates
* No passwords returned in API responses

---

# Postman API Testing

All endpoints were tested using Postman.

Example tested features:

* Authentication flow
* Protected routes
* Filtering and sorting
* Authorization validation
* CRUD operations
* Error handling

---

# Author

## Peyas Barmon

Frontend Developer transitioning into Backend Development.

GitHub:

```bash
https://github.com/dev-peyas9911
```

---

```
```
