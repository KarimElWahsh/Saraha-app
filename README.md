# Saraha App — Anonymous Messaging API

A RESTful backend API for an anonymous messaging platform, built with **Node.js, Express.js, and MongoDB**. The application allows users to create accounts, manage their profiles, and receive anonymous messages while providing authentication, account management, and message organization features.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture and Design Decisions](#architecture-and-design-decisions)
- [API Documentation](#api-documentation)
- [Getting Started](#getting-started)
- [Configuration](#configuration)
- [Main API Routes](#main-api-routes)
- [Security and Validation](#security-and-validation)
- [Project Structure](#project-structure)
- [Future Improvements](#future-improvements)

## Overview

Saraha App is a modular backend application designed around three main domains:

- **Authentication:** Account registration, login, email confirmation, password recovery, token refresh, social login, and logout.
- **Users:** Profile retrieval, profile and cover image uploads, password updates, account freezing and restoration, and account deletion.
- **Messages:** Anonymous message delivery, inbox retrieval, pagination, read/unread status, and favorites.

The project focuses on API design, separation of responsibilities, authentication and authorization, validation, error handling, and backend security practices.

## Features

### Authentication and Account Security

- User registration and login.
- Email confirmation using an OTP.
- Forgot-password and password-reset flows.
- Access-token and refresh-token handling.
- Google social login.
- Authenticated logout.
- Authentication and role-based authorization middleware.
- Password hashing.

### User Management

- Retrieve the authenticated user's profile.
- Upload a profile picture.
- Upload multiple cover images.
- Update the account password.
- Freeze and restore accounts.
- Restrict account deletion to authorized administrators.

### Anonymous Messaging

- Send an anonymous message to a recipient.
- Retrieve the authenticated user's inbox.
- Paginate inbox results.
- Mark messages as read or unread.
- Add messages to or remove them from favorites.
- Validate message ownership before updating its status.

### Backend Infrastructure

- MongoDB integration through Mongoose.
- Redis client integration.
- Request validation using Joi.
- Centralized error-handling middleware.
- Standardized success responses.
- Security headers using Helmet.
- Configurable CORS.
- HTTP request logging with Morgan.
- Custom IP-based rate-limiting middleware.
- Local file uploads using Multer.

## Tech Stack

| Technology | Purpose |
|---|---|
| Node.js | JavaScript runtime |
| Express.js | REST API and middleware |
| MongoDB | Persistent data storage |
| Mongoose | MongoDB object modeling |
| Redis | In-memory data-store integration |
| JWT | Access and refresh token authentication |
| Joi | Request validation |
| Argon2 / bcrypt | Password-hashing libraries |
| Multer | Multipart file uploads |
| Nodemailer | Email delivery integration |
| Google Auth Library | Google sign-in integration |
| Helmet | HTTP security headers |
| CORS | Cross-origin request configuration |
| Morgan | HTTP request logging |
| dotenv | Environment-based configuration |

## Architecture and Design Decisions

### 1. Modular Monolith

The application follows a **modular monolith** approach: authentication, user management, and messaging are organized into separate modules while running inside a single Express application.

This keeps development and deployment relatively straightforward while making responsibilities easier to understand and maintain.

The current architecture is not a microservices architecture. The modules are separated at the code level, but they share the same application runtime.

### 2. Middleware-Based Request Pipeline

Requests pass through shared middleware for concerns such as:

- JSON parsing.
- CORS configuration.
- Security headers.
- HTTP request logging.
- Rate limiting.
- Authentication and authorization where required.
- Request validation.

This reduces duplicated logic and keeps route handlers focused on application behavior.

### 3. Authentication and Authorization

Authentication middleware validates the relevant token type, while authorization middleware checks whether the authenticated user has the required role.

Protected endpoints use these controls to restrict access to profile operations, inbox retrieval, account management, and other authenticated actions.

### 4. Validation at the API Boundary

Joi schemas validate request data before it reaches service logic. This helps reject malformed input early and keeps validation rules separate from business logic.

### 5. Centralized Error Handling

The application uses reusable HTTP error helpers and a global error-handling middleware to produce a consistent error response structure.

This makes common cases such as bad requests, unauthorized access, forbidden operations, missing resources, conflicts, and rate limiting easier to handle consistently.

### 6. Message Ownership and Pagination

Inbox retrieval uses pagination to avoid returning every message in a single response. Message updates also check that the target message belongs to the authenticated receiver before changing its read or favorite state.

### 7. File Upload Handling

Multer handles profile-picture and cover-image uploads. The upload configuration applies file-type rules and organizes uploaded files into application directories.

### 8. Rate Limiting

The application includes custom IP-based rate-limiting middleware to restrict excessive requests within a time window.

**Current design consideration:** The limiter stores its counters and blocked-IP state in application memory. This is suitable for learning and a single application instance, but it does not share counters across multiple instances and its state is lost when the process restarts. A distributed deployment would benefit from a shared Redis-backed rate limiter.

### 9. Redis Integration

The application establishes a Redis client connection as part of startup. Redis provides a foundation for shared, in-memory data operations; individual Redis-backed features should be documented according to their actual implementation.

## API Documentation

Explore the available endpoints, request parameters, and response examples in the Postman documentation:

**[Open Saraha App API Documentation](https://documenter.getpostman.com/view/53757173/2sBY4TpdGe)**

Base route prefixes:

| Domain | Route Prefix |
|---|---|
| Authentication | `/api/v1/auth` |
| Users | `/api/v1/user` |
| Messages | `/api/v1/message` |

## Getting Started

### Prerequisites

Make sure you have the following installed and configured:

- Node.js and npm.
- A reachable MongoDB instance.
- A reachable Redis instance.
- The environment configuration required by the application.

### 1. Clone the Repository

```bash
git clone https://github.com/KarimElWahsh/Saraha-app.git
cd Saraha-app
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create the environment configuration file expected by the project's configuration service.

Set the required values for the application port, MongoDB connection, Redis connection, authentication secrets, email delivery, and Google sign-in if those features are being used.

Check the configuration service in the repository for the exact variable names and required formats. Never commit real credentials, tokens, or production secrets.

### 4. Start the Application

```bash
npm run dev
```

The development script uses Node.js watch mode to restart the application when files change.

Once the server starts and the configured services are reachable, use the Postman documentation to test the API endpoints.

## Main API Routes

The following routes are defined in the current controllers. Refer to the Postman documentation for the expected request bodies, validation requirements, and complete examples.

### Authentication

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/v1/auth/signup` | Register an account |
| POST | `/api/v1/auth/login` | Authenticate a user |
| PATCH | `/api/v1/auth/confirm-email` | Confirm an email address |
| PATCH | `/api/v1/auth/forget-password` | Start password recovery |
| PATCH | `/api/v1/auth/reset-password` | Reset a password |
| POST | `/api/v1/auth/refresh-token` | Refresh authentication tokens |
| POST | `/api/v1/auth/social-login` | Google social login |
| POST | `/api/v1/auth/logout` | Log out an authenticated user |

### Users

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/v1/user/get-profile` | Retrieve the current profile |
| PATCH | `/api/v1/user/upload-file` | Upload a profile picture |
| PATCH | `/api/v1/user/upload-cover-images` | Upload cover images |
| PATCH | `/api/v1/user/update-password` | Update the account password |
| PATCH | `/api/v1/user/{/:userId}/freeze-account` | Freeze an account |
| PATCH | `/api/v1/user/{/:userId}/restore-account` | Restore an account |
| DELETE | `/api/v1/user/:userId/delete-account` | Delete an account with administrator authorization |

### Messages

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/v1/message/send-message/:receiverId` | Send an anonymous message |
| GET | `/api/v1/message` | Retrieve the authenticated user's inbox |
| PATCH | `/api/v1/message/read/:messageId` | Toggle read status |
| PATCH | `/api/v1/message/favorite/:messageId` | Toggle favorite status |

## Security and Validation

The application includes several backend security measures:

- JWT-based authentication.
- Role-based authorization for protected operations.
- Joi validation for supported request schemas.
- Password hashing.
- Helmet security headers.
- Configurable CORS.
- IP-based rate limiting.
- File-type restrictions for configured upload routes.
- Message ownership checks before updating message state.
- Environment-based configuration for secrets and service connections.

Security is an ongoing process. Production deployment should also review password policy, OTP expiration and attempt limits, upload-content verification, token revocation, rate-limit storage, logging of sensitive data, and production-safe error responses.

## Project Structure

The main application modules are organised under `src/Modules`:

```text
Saraha-app/
├── index.js
├── config/
│   └── config.service.js
└── src/
    ├── app.controller.js
    ├── DB/
    │   ├── connection.js
    │   ├── redis-connection.js
    │   └── Models/
    ├── Middleware/
    ├── Modules/
    │   ├── Auth/
    │   ├── User/
    │   └── Messages/
    └── Utils/
```

The structure above highlights the main areas of the application; consult the repository for the complete file tree.

## Future Improvements

Potential improvements for a more production-ready deployment include:

- Replace in-memory rate-limit state with Redis-backed shared storage.
- Add automated unit and integration tests.
- Add structured logging and request correlation IDs.
- Improve upload validation by verifying file signatures and content, not only MIME metadata.
- Define consistent production error responses that do not expose internal stack traces.
- Add Docker-based local development and deployment configuration.
- Add API versioning and more detailed operational documentation.
- Review transaction boundaries and consistency requirements as the application grows.

## Author

**Karim El Wahsh**

- GitHub: [KarimElWahsh](https://github.com/KarimElWahsh/Saraha-app)
- API Documentation: [Saraha App — Postman](https://documenter.getpostman.com/view/53757173/2sBY4TpdGe)

---

*Built as a backend project to practice REST API development, authentication, authorization, modular application design, validation, and backend infrastructure integration.*
