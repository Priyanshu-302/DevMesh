# DevMesh Deployment Guide

This guide details how to deploy the DevMesh monorepo:
* **Frontend**: React + Vite on **Vercel**
* **Backend + AI Agent**: Express + LangGraph on **Render**

---

## 1. Deployed Backend Configuration (Render)

Render needs to compile the `backend` and the `ai-agent` directories. Because they are structured in a `pnpm` monorepo, keeping the **Root Directory** as the root (`.`) is crucial so they can reference each other.

### Step-by-Step Settings on Render:
1. Log in to **[Render](https://render.com/)** and click **New > Web Service**.
2. Connect your GitHub repository.
3. Use the following configuration settings:

| Setting | Value | Rationale |
| :--- | :--- | :--- |
| **Name** | `devmesh-backend` | Your public API service name |
| **Region** | Select nearest to your users | Low latency |
| **Branch** | `develop` (or `main`) | The branch containing production code |
| **Root Directory** | Leave blank (default is `.`) | **Crucial**: Keeps the root workspace scope so `backend` can access `ai-agent/` |
| **Runtime** | `Node` | Execution environment |
| **Build Command** | `pnpm install` | Installs dependencies for both `backend` and `ai-agent` |
| **Start Command** | `pnpm --filter backend start` | Starts the Express server using the pnpm workspace filter |

### Environment Variables on Render:
Add these in the **Environment** section of your Render Web Service settings:

* `NODE_ENV`: `production`
* `MONGO_URI`: `mongodb+srv://...` (your MongoDB Atlas connection string)
* `JWT_SECRET`: `your_secure_random_string` (generate a strong secret)
* `JWT_EXPIRES_IN`: `24h`
* `GROQ_API_KEY`: `gsk_...` (your production Groq key)
* `PORT`: `10000` (Render defaults to routing here, but it's good to specify)

---

## 2. Deployed Frontend Configuration (Vercel)

Vercel has native monorepo support. We configure the Vercel project to target the `frontend` folder directly.

### Step-by-Step Settings on Vercel:
1. Log in to **[Vercel](https://vercel.com/)** and click **Add New > Project**.
2. Import your GitHub repository.
3. Before clicking deploy, click **Edit** next to **Configure Project** and set:

| Setting | Value | Rationale |
| :--- | :--- | :--- |
| **Framework Preset** | `Vite` | Detected automatically |
| **Root Directory** | `frontend` | **Crucial**: Tells Vercel to build and serve files out of the `frontend` directory |
| **Build Command** | `pnpm build` | Compiles Vite production bundle |
| **Output Directory** | `dist` | Target directory for static build |

4. **React Router SPA Routing**: The `vercel.json` file we pushed inside the `frontend/` folder handles URL rewriting, ensuring route updates (like reloading `/dashboard` or `/profile`) work seamlessly.

### Environment Variables on Vercel:
Add these under the **Environment Variables** section on Vercel:

* `VITE_API_BASE_URL`: `https://devmesh-backend.onrender.com` (replace with your Render service URL)
* `VITE_SOCKET_URL`: `https://devmesh-backend.onrender.com` (replace with your Render service URL)

Click **Deploy**! Vercel will compile and host your static frontend at a public `.vercel.app` domain.
