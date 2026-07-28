# SnapWire Backend

SnapWire Backend is a TypeScript API built with Express for a social network application. It manages user accounts, authentication, posts, likes, friend relationships, media uploads, email workflows, MongoDB persistence, and Redis-backed cache/session data.

The project is structured around a layered approach inspired by clean architecture. Each main feature keeps its domain models, use cases, controllers, routes, and repository implementations separated so the code is easier to read, test, and extend.

## What This API Provides

- User registration, profile updates, soft deletion, and public profile lookup.
- Email/password authentication and Google authentication.
- JWT session validation through HTTP-only cookies or bearer tokens.
- Account verification and password reset email flows.
- Post creation with text and optional media files.
- Post feed retrieval and soft deletion.
- Likes for supported resources.
- Friend requests, accepted friendships, received requests, and relation deletion.
- ImageKit integration for avatars and post media.
- MongoDB repositories for persistence.
- Redis integration for cache/session-oriented storage.
- Centralized error handling through custom exception classes.

## Tech Stack

- Node.js
- TypeScript
- Express
- MongoDB
- Redis
- JSON Web Tokens
- Express Session
- Google Auth Library
- bcryptjs
- multer
- ImageKit
- Nodemailer and Google APIs

## Project Structure

```text
src/
├── app.ts
├── Default/
│   ├── api.routes.ts
│   ├── application/
│   ├── configs/
│   ├── domain/
│   ├── helpers/
│   └── infrastructure/
├── Auth/
│   ├── application/
│   ├── domain/
│   └── infrastructure/
├── User/
│   ├── application/
│   ├── domain/
│   └── infrastructure/
├── Posts/
│   ├── application/
│   ├── domain/
│   └── infrastructure/
├── Like/
│   ├── application/
│   ├── domain/
│   └── infrastructure/
└── Comment/
    ├── domain/
    └── infrastructure/
```

## Architecture

### Domain

The domain layer contains the core business contracts and models. This includes entities such as users, posts, likes, repositories, and custom exceptions.

### Application

The application layer contains the use cases. These classes coordinate workflows such as creating a user, authenticating a session, updating a profile, creating a post, sending a friend request, or restoring a password.

### Infrastructure

The infrastructure layer connects the application with external inputs and services. This is where Express controllers, routes, middleware, MongoDB repositories, email services, and media storage adapters live.

### Default Module

`src/Default` contains shared infrastructure: configuration, database connections, common helpers, email and storage services, cache repositories, token utilities, shared exceptions, and the root API router.

## API Base URL

All feature routes are mounted under:

```text
/api/v1
```

The root endpoint can be used as a simple server check:

```text
GET /
```

It returns a `200` response with a welcome message when the server is running.

## API Routes

### Auth

Base path:

```text
/api/v1/auth
```

| Method | Route | Description |
| --- | --- | --- |
| `POST` | `/` | Authenticates a user with username/email and password. |
| `POST` | `/google` | Authenticates a user with Google credentials. |
| `DELETE` | `/logout` | Logs out the current session. |
| `PATCH` | `/:userId/password` | Updates a user's password. |
| `POST` | `/:userId/code/confirm` | Confirms an account verification code. |
| `POST` | `/:user/email/:type` | Sends an account verification or password recovery email. |
| `POST` | `/:token/restore/password` | Restores a password using a reset token. |

### Users

Base path:

```text
/api/v1/user
```

| Method | Route | Description |
| --- | --- | --- |
| `POST` | `/` | Creates a new user account. |
| `PATCH` | `/:userId` | Updates profile data and optionally uploads an avatar. |
| `DELETE` | `/:userId` | Soft-deletes or deactivates a user account. |
| `GET` | `/:user` | Retrieves a user by id or username. |
| `POST` | `/:submittedUserId/request/:recipientUserId` | Sends a friend request or accepts an existing incoming request. |
| `DELETE` | `/:userId/relation/:relationId` | Deletes a friend relation or request. |
| `GET` | `/:user/friends` | Retrieves a user's friends. |
| `GET` | `/:userId/requests/received` | Retrieves received friend requests. |

Protected user routes require a valid session.

### Posts

Base path:

```text
/api/v1/post
```

| Method | Route | Description |
| --- | --- | --- |
| `POST` | `/` | Creates a post with text and optional media files. |
| `GET` | `/` | Retrieves visible posts. |
| `DELETE` | `/:postId` | Soft-deletes a post owned by the authenticated user. |

Post creation accepts multipart form data through `multer`. Supported media includes PNG, JPG, JPEG, and MP4 files.

### Likes

Base path:

```text
/api/v1/like
```

| Method | Route | Description |
| --- | --- | --- |
| `POST` | `/:to/:type` | Creates or toggles a like for a target resource. |
| `GET` | `/:from` | Retrieves likes associated with a source user or entity. |

The like creation route includes a small rate limiter to reduce repeated rapid requests.

### Comments

The repository contains comment-related code, but comment routes are not currently mounted in `src/Default/api.routes.ts`. That means comments are not part of the public API surface yet. The unfinished comment module is also excluded from the TypeScript build until the repository methods and route wiring are completed.

## Authentication Flow

1. The client sends credentials to `POST /api/v1/auth`.
2. The authentication use case validates the user and password.
3. The server creates a JWT and stores session data.
4. The token is returned in the response and can also be set as an HTTP-only cookie named `tkn`.
5. Protected routes use `verifySession` to read the token.
6. If the token is valid, the request continues.

Supported token sources:

```text
Authorization: Bearer <token>
Cookie: tkn=<token>
```

## Media Uploads

SnapWire uses ImageKit to store user avatars and post media. Upload services return the stored file URL and the external file id.

Post media is grouped by file type:

- Image files are stored as images.
- MP4 files are stored as videos.

If a multi-file upload fails after some files were already uploaded, the service tries to remove the uploaded files to avoid leaving unused media behind.

## Email Workflows

The API includes email flows for account verification and password recovery. Email delivery is implemented through services that use Nodemailer and Google API configuration.

Main flows:

- Send account verification code.
- Confirm verification code.
- Send password reset email.
- Restore password from a reset token.

## Environment Variables

The application loads local environment variables from:

```text
.env.development.local
```

Create this file locally and provide the required values. Do not commit real credentials.

```env
PORT=8000
DB_URL_MONGO=
URI_REDIS=

SECRET_SESSION=
SECRET_KEY_TOKEN=
SECRET_RESTORE_PASSWORD=

PUBLIC_KEY_IMAGEKIT=
PRIVATE_KEY_IMAGEKIT=
URL_ENDPOINT_IMAGEKIT=
AVATAR_DEFAULT=
AVATARS_FOLDER_DEST=
MEDIA_FOLDER_DEST=

APP_EMAIL=
APP_PASSWORD_EMAIL=

CLIENT_ID=
SECRET_CLIENT=
REFRESH_TOKEN_GOOGLE=
GOOGLE_CLIENT_ID=
SECURE_URL_RESET_PASSWORD=
```

`DB_URL_MONGO` is required. The project intentionally does not include a fallback database URI because connection strings must stay outside the repository.

## Installation

Use Node.js 20 or 22 LTS. Node 26 is not supported by the current dependency tree.

Install dependencies:

```bash
npm install
```

Or with Yarn:

```bash
yarn install
```

## Development

Run the API in development mode:

```bash
npm run dev
```

The development command starts `src/app.ts` with `ts-node-dev`.

## Build

Compile TypeScript:

```bash
npm run build
```

The build script uses the local TypeScript dependency installed in the project.

## Production Start

After building the project:

```bash
npm start
```

## Response Style

Successful responses commonly follow this shape:

```json
{
  "state": "ok",
  "data": {}
}
```

Errors are handled through `ErrorHandler` and custom exception classes under `src/Default/domain/exceptions`.

## Development Notes

- Feature routes are mounted in `src/Default/api.routes.ts`.
- Session and CORS settings are centralized in `src/Default/configs/config.ts`.
- MongoDB and Redis connection setup lives under `src/Default/configs/`.
- Protected endpoints use `verifySession`.
- Post and avatar uploads use in-memory `multer` handling before sending files to ImageKit.
- Repository implementations live in each feature's infrastructure layer.
- `src/Comment` is intentionally treated as pending work and is not compiled yet.

## Open Source Notes

This repository is published as an open source learning and portfolio project. Contributions should keep the current module separation, avoid committing secrets, and prefer clear API behavior over hidden side effects.

Useful areas for future work:

- Add automated tests for use cases and route middleware.
- Mount and document the comment module when it is ready.
- Add API examples with request and response payloads.
- Add Docker or compose files for local MongoDB and Redis development.

## License

This project is licensed under the MIT License. See [LICENSE](./LICENSE) for details.
