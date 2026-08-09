# 💻 DevMesh: React Frontend Dashboard

This directory houses the client dashboard built with React, Vite, Vanilla CSS, and Socket.io-client.

---

## 📂 Folder Structure

```text
frontend/
├── src/
│   ├── api/             # API request wrappers (Axios client)
│   ├── components/      # UI components (Layout, Common, Agent visualizations)
│   ├── context/         # Auth, Socket, and Theme state providers
│   ├── hooks/           # Custom React hooks (useTaskSocket, useAuth)
│   ├── pages/           # Screen page components (LiveTask, Workspace, Dashboard)
│   ├── styles/          # Tailwind/CSS files
│   └── utils/           # Time calculators and visual constants
├── App.jsx              # Main routes guard and layouts mapping
├── main.jsx             # React DOM root and context mounting
├── index.html
├── vercel.json          # Vercel SPA routing rewrites
└── vite.config.js
```

---

## 🔒 Context Providers

* **`AuthContext`**: Restores the user profile from local storage tokens upon page load, handles user login/signup, and exposes `user` and `setUser` globally.
* **`SocketContext`**: Configures the WebSocket connection to the backend and exposes the active `socket` client wrapper.
* **`ThemeContext`**: Handles dark mode toggles and applies harmonious system colors.

---

## 🪝 Custom Socket Hook (`useTaskSocket.js`)

The `useTaskSocket` hook is the bridge for streaming data:
1. **Initial Mount**: Fetches the task's historical logs from the API and maps them to a visual format.
2. **Socket Room Binding**: Subscribes to the Socket.io room scoped to the current `taskId`.
3. **Live Logs Streaming**: Streams agent execution events and appends them to the log array state.
4. **Follow-up Reset**: Listens for the `task_status_updated` event to clear local log states when a user triggers an in-place follow-up run.

---

## 🎨 Layout & Visual Components

* **Code Editor Tab**: Built into `LiveTaskPage.jsx`. Dynamically lists all files inside the workspace directory. Clicking **Save Changes** updates the file on the server's disk and re-triggers RAG database builds.
* **Agent Graph Visualizer**: A tech-themed flow node map showing which agent is currently active (Architect, Developer, QA Tester).
* **Line-by-Line File Diff Viewer**: Renders red deletions (`- `) and green additions (`+ `) comparing original codebase files with modifications proposed by the Developer Agent.
* **QA Audit Diagnostic**: Renders LLM markdown summaries and system checks within a dark terminal layout block.
* **Profile Screen**: Allows users to update their metadata and view account dates.
