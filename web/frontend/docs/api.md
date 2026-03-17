# Zerra API Documentation (Complete Reference)

This document provides a comprehensive list of all backend API routes, their expected inputs, and sample outputs. This reflects the source of truth from the Hono backend.

---

## 🔐 1. Authentication Module (`/auth`)

| Endpoint                | Method | Protected | Description                    |
| ----------------------- | ------ | --------- | ------------------------------ |
| `/auth/register`        | POST   | No        | Create a new user account      |
| `/auth/login`           | POST   | No        | Authenticate and start session |
| `/auth/logout`          | POST   | Yes       | End current session            |
| `/auth/forgot-password` | POST   | No        | Initiate password reset flow   |
| `/auth/reset-password`  | POST   | No        | Reset password using OTP       |
| `/auth/refresh-token`   | POST   | No        | Rotate JWT/Session tokens      |
| `/auth/verify-email`    | POST   | No        | Verify user email address      |

### Details: Register

- **Input**:
    ```json
    {
        "name": "string (3-50 chars)",
        "email": "valid email",
        "password": "string (8-24 chars)",
        "confirmPassword": "must match password",
        "username": "string (5-16 chars, letters/numbers/_)",
        "bio": "string (max 150) [optional]",
        "link": "valid url [optional]",
        "avatar": "valid url [optional]",
        "banner": "valid url [optional]",
        "timezone": "string [optional]"
    }
    ```

---

## 👤 2. Users Module (`/users`)

| Endpoint                              | Method | Protected | Description                    |
| ------------------------------------- | ------ | --------- | ------------------------------ |
| `/users/profile/:id`                  | GET    | No        | Get public profile by ID       |
| `/users/profile/username/:username`   | GET    | No        | Get public profile by username |
| `/users/me`                           | GET    | Yes       | Get current user details       |
| `/users/me`                           | PATCH  | Yes       | Update current profile (Form)  |
| `/users/me`                           | DELETE | Yes       | Delete current user account    |
| `/users/me/change-password`           | PATCH  | Yes       | Change user password           |
| `/users/me/change-email`              | PATCH  | Yes       | Change user email              |
| `/users/follow/:id`                   | POST   | Yes       | Follow a user                  |
| `/users/unfollow/:id`                 | POST   | Yes       | Unfollow a user                |
| `/users/followers/:id?`               | GET    | Yes       | Get followers list             |
| `/users/following/:id?`               | GET    | Yes       | Get following list             |
| `/users/me/avatar`                    | POST   | Yes       | Update avatar image (Form)     |
| `/users/me/banner`                    | POST   | Yes       | Update banner image (Form)     |
| `/users/me/two-factor-authentication` | PATCH  | Yes       | Toggle 2FA settings            |

> [!NOTE]
> Endpoints marked with **(Form)** expect `multipart/form-data`.

---

## 📝 3. Posts Module (`/posts`)

| Endpoint                  | Method | Protected | Description                                                      |
| ------------------------- | ------ | --------- | ---------------------------------------------------------------- |
| `/posts/`                 | GET    | No        | Fetch all posts                                                  |
| `/posts/for-you`          | GET    | No        | Fetch personalized algorithmic feed                              |
| `/posts/:id`              | GET    | No        | Fetch post by ID                                                 |
| `/posts/author/:authorId` | GET    | No        | Fetch all posts by a specific author                             |
| `/posts/`                 | POST   | Yes       | Create a new post (unverified max 500 chars, verified unlimited) |
| `/posts/:id`              | PATCH  | Yes       | Update a post (Owner only)                                       |
| `/posts/:id`              | DELETE | Yes       | Delete a post (Owner only)                                       |
| `/posts/:id/like`         | POST   | Yes       | Toggle Like on a post                                            |
| `/posts/:id/bookmark`     | POST   | Yes       | Toggle Bookmark on a post                                        |
| `/posts/search`           | GET    | No        | Search posts by query                                            |

### Details: Create Post

- **Input** (Form):
    ```json
    {
        "content": "string (unverified: 1-500, verified: unlimited)",
        "media": "file [optional]",
        "published": "boolean [optional, default: false]"
    }
    ```

---

## 📰 4. Articles Module (`/articles`)

| Endpoint                 | Method | Protected | Description                         |
| ------------------------ | ------ | --------- | ----------------------------------- |
| `/articles/`             | GET    | No        | Fetch all articles                  |
| `/articles/for-you`      | GET    | No        | Fetch personalized algorithmic feed |
| `/articles/:id`          | GET    | No        | Fetch article by ID                 |
| `/articles/user/:userId` | GET    | No        | Fetch all articles by a user        |
| `/articles/`             | POST   | Yes       | Create a new article (Form)         |
| `/articles/:id`          | PATCH  | Yes       | Update an article                   |
| `/articles/:id`          | DELETE | Yes       | Delete an article                   |
| `/articles/:id/like`     | POST   | Yes       | Toggle Like on an article           |
| `/articles/:id/bookmark` | POST   | Yes       | Toggle Bookmark on an article       |

---

## 💬 5. Comments Module (`/comments`)

| Endpoint                       | Method | Protected | Description                   |
| ------------------------------ | ------ | --------- | ----------------------------- |
| `/comments/:id`                | GET    | No        | Fetch comment by ID           |
| `/comments/post/:postId`       | GET    | No        | Fetch comments for a post     |
| `/comments/article/:articleId` | GET    | No        | Fetch comments for an article |
| `/comments/:id/replies`        | GET    | No        | Fetch replies for a comment   |
| `/comments/`                   | POST   | Yes       | Create a comment or reply     |
| `/comments/:id`                | PATCH  | Yes       | Update a comment (Owner only) |
| `/comments/:id`                | DELETE | Yes       | Delete a comment (Owner only) |
| `/comments/:id/like`           | POST   | Yes       | Toggle Like on a comment      |
| `/comments/:id/bookmark`       | POST   | Yes       | Toggle Bookmark on a comment  |

### Details: Create Comment

- **Input**:
    ```json
    {
        "content": "string (1-500)",
        "postId": "number [optional]",
        "articlesId": "number [optional]",
        "parentId": "number [optional]"
    }
    ```
- _Note: Must provide one of `postId`, `articlesId`, or `parentId`._

---

---

## 🌿 6. Fern AI Module (`/fern`)

| Endpoint                | Method | Protected | Description                |
| ----------------------- | ------ | --------- | -------------------------- |
| `/fern/chats`           | GET    | Yes       | Get all user chat sessions |
| `/fern/:chatId`         | GET    | Yes       | Get messages for a session |
| `/fern/:chatId/message` | POST   | Yes       | Send prompt to AI          |
| `/fern/:chatId/rename`  | POST   | Yes       | Rename a chat session      |
| `/fern/:chatId`         | DELETE | Yes       | Delete a chat session      |

### Details: Send Message

- **Input**:
    ```json
    {
        "prompt": "string",
        "model": "string [optional]",
        "webSearch": "boolean [optional]",
        "reasoning": "boolean [optional]"
    }
    ```

---

## 🏥 7. Health & Diagnostics

| Endpoint        | Method | Protected | Description                       |
| --------------- | ------ | --------- | --------------------------------- |
| `/health/`      | GET    | No        | General health status             |
| `/health/live`  | GET    | No        | Liveness probe                    |
| `/health/ready` | GET    | No        | Readiness probe (DB/Redis checks) |
| `/media-vault`  | GET    | No        | Storage & Media statistics        |

---

## 📦 8. Standard Response Format

All API responses follow this structure:

**Success (200/201):**

```json
{
  "status": "success",
  "data": { ... },
  "message": "Action completed successfully"
}
```

**Error (400/401/404/500):**

```json
{
  "status": "error",
  "data": null,
  "message": "Detailed error message",
  "errors": [ ... ]
}
```
