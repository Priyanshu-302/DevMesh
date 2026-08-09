# 🔌 DevMesh REST & WebSocket API Reference

This document provides a comprehensive API reference for the DevMesh backend services, including JSON request/response formats, query parameters, authentication states, rate limits, and WebSocket event structures.

---

## 🔐 Global Authentication & Headers

All API endpoints (except `/api/auth/signup` and `/api/auth/login`) require a valid JSON Web Token (JWT) passed in the `Authorization` header.

```http
Authorization: Bearer <your_jwt_token>
Content-Type: application/json
```

If the token is missing, expired, or invalid, the backend will return a `401 Unauthorized` response:
```json
{
  "success": false,
  "error": {
    "message": "Authentication failed: JWT token is invalid or missing",
    "details": null
  }
}
```

---

## 🔒 Authentication API (`/api/auth`)

### 1. User Registration
Register a new account.

* **Method**: `POST`
* **Path**: `/api/auth/signup`
* **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "SecurePassword123",
    "fullName": "John Doe"
  }
  ```
* **Success Response (`201 Created`)**:
  ```json
  {
    "success": true,
    "message": "User registered successfully",
    "data": {
      "token": "eyJhbGciOi...",
      "user": {
        "id": "6a77761000...",
        "email": "user@example.com",
        "fullName": "John Doe",
        "avatarUrl": "https://api.dicebear.com/7.x/bottts/svg?seed=user@example.com"
      }
    }
  }
  ```

---

### 2. User Login
Log in to receive a JWT authentication token.

* **Method**: `POST`
* **Path**: `/api/auth/login`
* **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "SecurePassword123"
  }
  ```
* **Success Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "message": "Login successful",
    "data": {
      "token": "eyJhbGciOi...",
      "user": {
        "id": "6a77761000...",
        "email": "user@example.com",
        "fullName": "John Doe",
        "avatarUrl": "https://api.dicebear.com/7.x/bottts/svg?seed=user@example.com"
      }
    }
  }
  ```

---

### 3. Get User Profile
Fetch user metadata parsed from the active token.

* **Method**: `GET`
* **Path**: `/api/auth/profile`
* **Success Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "message": "User profile retrieved successfully",
    "data": {
      "user": {
        "id": "6a77761000...",
        "email": "user@example.com",
        "fullName": "John Doe",
        "avatarUrl": "https://api.dicebear.com/7.x/bottts/svg?seed=user@example.com",
        "createdAt": "2026-08-08T18:12:11.000Z"
      }
    }
  }
  ```

---

### 4. Update User Profile
Edit your profile metadata.

* **Method**: `PUT`
* **Path**: `/api/auth/profile`
* **Request Body** (All fields optional):
  ```json
  {
    "fullName": "John H. Doe",
    "email": "newemail@example.com",
    "avatarUrl": "https://custom-avatar-link.com/img.png"
  }
  ```
* **Success Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "message": "Profile updated successfully",
    "data": {
      "user": {
        "id": "6a77761000...",
        "email": "newemail@example.com",
        "fullName": "John H. Doe",
        "avatarUrl": "https://custom-avatar-link.com/img.png"
      }
    }
  }
  ```

---

## 📂 Workspace API (`/api/workspaces`)

### 1. Create Workspace
Initialize a new workspace container for codebases.

* **Method**: `POST`
* **Path**: `/api/workspaces`
* **Request Body**:
  ```json
  {
    "name": "My Calculator App",
    "description": "A basic math library"
  }
  ```
* **Success Response (`201 Created`)**:
  ```json
  {
    "success": true,
    "message": "Workspace created successfully",
    "data": {
      "id": "6a7778c000...",
      "name": "My Calculator App",
      "description": "A basic math library",
      "ingestionStatus": "idle",
      "createdAt": "2026-08-08T18:45:00.000Z"
    }
  }
  ```

---

### 2. List Workspaces
Fetch all workspaces associated with the authenticated user.

* **Method**: `GET`
* **Path**: `/api/workspaces`
* **Success Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "message": "Workspaces retrieved successfully",
    "data": [
      {
        "id": "6a7778c000...",
        "name": "My Calculator App",
        "description": "A basic math library",
        "ingestionStatus": "completed",
        "createdAt": "2026-08-08T18:45:00.000Z"
      }
    ]
  }
  ```

---

## 💿 Codebase & File API (`/api/workspaces/:id/codebase`)

### 1. Upload Codebase Archive
Uploads a `.zip` file of your project, extracts it to disk, and runs RAG parsing.

* **Method**: `POST`
* **Path**: `/api/workspaces/:id/codebase/upload`
* **Content-Type**: `multipart/form-data`
* **Request Payload**:
  * `zipFile` (binary, file form-data field)
* **Success Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "message": "Codebase archive uploaded and extracted. Ingestion pipeline is running in background.",
    "data": {
      "workspaceId": "6a7778c000...",
      "ingestionStatus": "ingesting"
    }
  }
  ```

---

### 2. Get Codebase Files
Fetches a recursive tree structure of all code files inside the workspace with their full text content.

* **Method**: `GET`
* **Path**: `/api/workspaces/:id/codebase/files`
* **Success Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "message": "Codebase files retrieved successfully",
    "data": {
      "files": {
        "calculator.cpp": "#include <iostream>...",
        "docs/README.md": "# Math docs..."
      }
    }
  }
  ```

---

### 3. Save File Content
Saves manual edits to a specific file on disk and automatically re-triggers RAG database ingestion.

* **Method**: `POST`
* **Path**: `/api/workspaces/:id/codebase/file`
* **Request Body**:
  ```json
  {
    "filePath": "calculator.cpp",
    "content": "#include <iostream>\nint add(int a, int b) { return a + b; }"
  }
  ```
* **Success Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "message": "File content saved and ingestion re-triggered successfully"
  }
  ```

---

## ⚡ Task API (`/api/tasks`)

### 1. Dispatch New Agent Task
Trigger a new execution loop for the AI agent team.

* **Method**: `POST`
* **Path**: `/api/workspaces/:workspaceId/tasks`
* **Request Body**:
  ```json
  {
    "requestText": "Add division logic and handle division by zero errors in calculator.cpp"
  }
  ```
* **Success Response (`210 Created`)**:
  ```json
  {
    "success": true,
    "message": "Task pipeline triggered successfully",
    "data": {
      "id": "6a77792a00...",
      "workspace": "6a7778c000...",
      "requestText": "Add division logic...",
      "status": "pending",
      "createdAt": "2026-08-08T18:48:00.000Z"
    }
  }
  ```

---

### 2. Dispatch Follow-Up Command (In-Place)
Reset and restart the agent execution pipeline for the **same task**, appending the new instructions to the prompt context.

* **Method**: `POST`
* **Path**: `/api/tasks/:taskId/followup`
* **Request Body**:
  ```json
  {
    "requestText": "Add comments to the newly created divide function."
  }
  ```
* **Success Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "message": "Follow-up task pipeline triggered successfully",
    "data": {
      "id": "6a77792a00...",
      "requestText": "Add division logic...\n\n[Follow-up Command]: Add comments...",
      "status": "in-progress"
    }
  }
  ```

---

### 3. Get Task Logs
Fetch historical logs of agent actions for a specific task.

* **Method**: `GET`
* **Path**: `/api/tasks/:taskId/logs`
* **Success Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "message": "Task execution logs retrieved successfully",
    "data": [
      {
        "eventType": "architect_started",
        "payload": {},
        "timestamp": "2026-08-08T18:48:02.000Z"
      },
      {
        "eventType": "architect_plan",
        "payload": {
          "plan": "Drafting step-by-step math functions..."
        },
        "timestamp": "2026-08-08T18:48:05.000Z"
      }
    ]
  }
  ```

---

## ⚡ WebSocket Events (Socket.io)

Clients connect to the socket server and join a room corresponding to the task ID to stream events in real time:

```javascript
import { io } from 'socket.io-client';
const socket = io('https://devmesh-backend.onrender.com');

// Join room
socket.emit('join_task_room', { taskId: '6a77792a00...' });
```

### Emitted Event Payloads:

* **`architect_started`**: Orchestrator begins planning.
* **`architect_plan`**: Renders details from the planning stage.
  ```json
  {
    "plan": "Detailed markdown plan text..."
  }
  ```
* **`developer_started`**: Developer begins coding.
* **`developer_code_chunk`**: Developer outputs updated file code.
  ```json
  {
    "filePath": "calculator.cpp",
    "diff": "--- calculator.cpp\n+++ calculator.cpp\n@@..."
  }
  ```
* **`qa_started`**: QA verification begins.
* **`qa_result`**: QA completes audit.
  ```json
  {
    "passed": false,
    "failed": 2,
    "total": 3,
    "feedback": "Markdown analysis of compile errors..."
  }
  ```
* **`task_status_updated`**: Clear client states when follow-up starts.
  ```json
  {
    "status": "in-progress"
  }
  ```
* **`task_completed`** / **`task_failed`**: Task finished.
