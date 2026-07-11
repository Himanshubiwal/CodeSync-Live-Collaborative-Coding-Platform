# Deployment Guide — CodeSync Live Collaborative Platform

## Architecture
- **Vercel** → Hosts the React client (static SPA)
- **Render** → Hosts the Node.js + Socket.IO + Yjs CRDT server

---

## Step 1: Deploy the Server to Render

1. Push your code to **GitHub**.
2. Go to [render.com](https://render.com) → **New** → **Web Service**.
3. Connect your GitHub repo.
4. Configure:
   - **Root Directory**: `server`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Environment**: `Node`
5. Add Environment Variables:
   - `CLIENT_URL` = `https://your-app-name.vercel.app` (set after Vercel deploy)
6. Click **Deploy**.
7. Copy the Render URL (e.g. `https://codesync-server.onrender.com`).

---

## Step 2: Deploy the Client to Vercel

1. Go to [vercel.com](https://vercel.com) → **New Project**.
2. Import your GitHub repo.
3. Configure:
   - **Root Directory**: `client`
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Add Environment Variable:
   - `VITE_BACKEND_URL` = `https://codesync-server.onrender.com` (your Render URL from Step 1)
5. Click **Deploy**.

---

## Step 3: Update Render CORS

After Vercel deploys, go back to Render and update:
- `CLIENT_URL` = `http://localhost:5173,https://your-app-name.vercel.app`

This allows both local dev and production to connect.

---

## Local Development (No Changes Needed)

Both `VITE_BACKEND_URL` and `CLIENT_URL` default to localhost, so local dev works out of the box:
```bash
# Terminal 1 — Server
cd server && npm run dev

# Terminal 2 — Client
cd client && npm run dev
```
