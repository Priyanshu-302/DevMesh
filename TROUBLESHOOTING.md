# 🛠️ DevMesh Troubleshooting Guide

This guide compiles common setup issues, network errors, compilation bugs, and deployment warnings, along with their solutions.

---

## 1. Port Collisions (`EADDRINUSE`)

### The Problem:
When starting the backend or frontend dev servers, you see this terminal crash:
```text
Error: listen EADDRINUSE: address already in use :::5000
    at Server.setupListenHandle [as _listen2] (node:net:1940:16)
```

### The Solution:
Port `5000` (default backend) or `5173` (default frontend) is already occupied by a running process.
* **Option A: Kill the existing process (Windows)**:
  Open PowerShell as Administrator and run:
  ```powershell
  Get-Process -Id (Get-NetTCPConnection -LocalPort 5000).OwningProcess | Stop-Process -Force
  ```
* **Option B: Change Ports**:
  Edit your `.env` config file and update the port number:
  ```text
  PORT=5001
  ```
  *(Remember to update `VITE_API_BASE_URL` and `VITE_SOCKET_URL` in the `frontend/.env` file to point to the new port).*

---

## 2. RAG Cross-Workspace File Leakage

### The Problem:
When running tasks, files from other projects appear in your Code Editor file dropdown or are referenced by the agent.

### The Solution:
This is caused by old cached RAG entries in the fallback database from runs executed before workspace isolation was introduced.
* **Clean the RAG Cache**:
  Delete the fallback database JSON cache files on disk. They will be automatically regenerated cleanly on the next run:
  * Delete `backend/.vector-store-fallback.json`
  * Delete `ai-agent/.vector-store-fallback.json`
* **Clean Corrupted Folders**:
  Delete any folders inside your uploads directory starting with `WorkspaceID_...` or duplicate nested `uploads/` directories.

---

## 3. MongoDB Connection Failures

### The Problem:
The backend server console hangs or prints:
```text
MongooseServerSelectionError: connect ECONNREFUSED 127.0.0.1:27017
```

### The Solution:
The local MongoDB server is not running or the connection string is incorrect.
* **If running MongoDB locally**:
  Make sure the MongoDB service is active.
  * **Windows**: Open `services.msc`, locate `MongoDB Server`, and click **Start**.
* **If using MongoDB Atlas**:
  Make sure your connection string is correct in `backend/.env`:
  ```text
  MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/devmesh
  ```
  Also, ensure that you have added your current IP address to the **IP Access List** in MongoDB Atlas Network Security settings.

---

## 4. Groq API validation JSON Errors

### The Problem:
The agent execution fails during planning or coding with logs showing:
```text
Failed Groq API call: 400 {"error":{"message":"Failed to generate JSON..."}}
```

### The Solution:
Groq's strict JSON validator throws a `400` error if the model's output code string contains Javascript/Python single-quote escapes (`\'`), which are illegal in JSON standards.
* **Verify prompts**: Ensure that you have pulled the latest updates from the `develop` branch. We added strict prompting rules banning `\'` and replacing them with double-quote strings or properly escaped double-quotes (`\"`).
* **Rate Limits**: If you run into rapid rate-limit blocks (status `429`), increase the throttling delay in `ai-agent/src/reliability/throttle.js`.

---

## 5. Render Server Cold Starts

### The Problem:
The frontend console shows `AxiosError: Request failed with status code 404` or connection time-out when restoring users or loading workspaces on Render.

### The Solution:
Render's free tier spins down web services after 15 minutes of inactivity. When you open the frontend, the backend has to spin back up, which can take 1 to 2 minutes.
* **Keep-Alive is Active**: We have implemented a `/ping` route that automatically calls itself every 10 minutes when hosted on Render.
* **Configure keep-alive**: Ensure the environment variable `RENDER_EXTERNAL_URL` is set in your Render Web Service settings (e.g. `https://devmesh-backend.onrender.com`). The server will automatically use this URL to ping itself and prevent spin-downs.

---

## 6. CORS Blockages in Browser

### The Problem:
Frontend console shows CORS error blocks:
```text
Access to XMLHttpRequest at 'http://localhost:5000/api/...' from origin 'http://localhost:5173' has been blocked by CORS policy.
```

### The Solution:
The backend does not recognize the frontend's origin URL.
* In `backend/src/app.js`, verify that your frontend port is listed in the `allowedOrigins` array:
  ```javascript
  const allowedOrigins = [
    "http://localhost:3000",
    "http://localhost:5173", // default Vite port
  ];
  ```
* In development, `NODE_ENV` must be set to `development` inside `backend/.env` to bypass strict production CORS filters.
