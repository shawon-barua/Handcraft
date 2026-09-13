# 🚀 Hosting & Deployment Guide — Falguni Handcraft
**Domain:** `https://falgunishandcraft.com`

This application is a full-stack Node.js + React web application. The backend Express server (`server/server.js`) securely serves both the REST API and the production-optimized React storefront from `/dist`.

---

## ⚡ Quick Hosting Summary

| Component | Setting |
| :--- | :--- |
| **Node.js Version** | **18.x, 20.x, or 22.x** (LTS recommended) |
| **Startup File / Entry Point** | `server/server.js` |
| **Install Command** | `npm install` |
| **Build Command** | `npm run build` |
| **Start Command** | `npm start` *(or `node server/server.js`)* |
| **Default Port** | `5005` *(or assigned by your host via `process.env.PORT`)* |
| **Data Directory** | `server/data/store.json` (JSON database) and `server/data/uploads/` |

---

## Option 1: cPanel / Shared Hosting ("Setup Node.js App")

Most Bangladeshi & international cPanel hosts (Namecheap, Hostinger, ExonHost, DianaHost, etc.) provide the **"Setup Node.js App"** (CloudLinux / cPanel) tool.

### Step 1: Point Your Domain (`falgunishandcraft.com`)
1. In your domain registrar DNS management (e.g. Namecheap, Cloudflare, GoDaddy):
   - Point the **A Record** (`@`) to your hosting server's IP address.
   - Point the **CNAME Record** (`www`) to `falgunishandcraft.com`.
2. In cPanel, ensure `falgunishandcraft.com` is added as your primary or addon domain.

### Step 2: Create the Node.js Application in cPanel
1. Log in to cPanel and search for **Setup Node.js App**.
2. Click **Create Application**:
   - **Node.js version**: Choose `20.x` or `18.x`.
   - **Application mode**: `Production`.
   - **Application root**: `handcrafted-store` (or your folder name).
   - **Application URL**: Select `falgunishandcraft.com`.
   - **Application startup file**: `server/server.js`.
3. Click **Create**.

### Step 3: Upload Files or Git Deploy
- **Via Git Version Control (cPanel)**:
  - Connect your GitHub repository `shawon-barua/Handcraft` into the application root.
- **Via File Manager / FTP**:
  - Upload the project files (including `dist/`, `server/`, `public/`, `package.json`, etc.).
  - *Do NOT upload `node_modules/`.*

### Step 4: Install Dependencies & Build
1. In the cPanel Node.js app interface, click **Run NPM Install** (or access terminal via cPanel and run `npm install`).
2. Run build: `npm run build` (if not already uploaded pre-built in `dist/`).
3. Click **Restart Application**.

### Step 5: Enable Free SSL (HTTPS)
1. Go to cPanel **SSL/TLS Status**.
2. Run **AutoSSL** for `falgunishandcraft.com` and `www.falgunishandcraft.com`.

---

## Option 2: Render.com / Railway / Cloud Platform (Easiest Cloud Deploy)

### Render.com
1. Sign up on [Render.com](https://render.com) and create a new **Web Service**.
2. Connect your GitHub repository: `shawon-barua/Handcraft`.
3. Configure the settings:
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
4. In **Settings > Custom Domains**, add:
   - `falgunishandcraft.com`
   - `www.falgunishandcraft.com`
5. Configure the DNS records provided by Render. Free SSL is generated automatically.

### Railway.app
1. Create a project on [Railway.app](https://railway.app) from GitHub repo.
2. Railway detects Node.js automatically and runs `npm run build` & `npm start`.
3. Go to **Settings > Custom Domain** and bind `falgunishandcraft.com`.

---

## Option 3: VPS / Ubuntu (DigitalOcean, Linode, AWS EC2, Contabo)

1. **SSH into your server**:
   ```bash
   sudo apt update && sudo apt install -y nodejs npm git nginx
   sudo npm install -g pm2
   ```
2. **Clone and setup**:
   ```bash
   git clone https://github.com/shawon-barua/Handcraft.git /var/www/falgunishandcraft
   cd /var/www/falgunishandcraft
   npm install
   npm run build
   ```
3. **Start with PM2** (process manager that keeps it running 24/7 and on reboot):
   ```bash
   pm2 start server/server.js --name "falgunishandcraft"
   pm2 startup
   pm2 save
   ```
4. **Configure Nginx as reverse proxy** (`/etc/nginx/sites-available/falgunishandcraft`):
   ```nginx
   server {
       server_name falgunishandcraft.com www.falgunishandcraft.com;

       location / {
           proxy_pass http://localhost:5005;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```
5. Enable SSL via Certbot:
   ```bash
   sudo certbot --nginx -d falgunishandcraft.com -d www.falgunishandcraft.com
   ```

---

## 🔒 Environment Variables (Optional)

You can set these in your hosting environment panel or a `.env` file:

```env
PORT=5005
NODE_ENV=production
JWT_SECRET=your_ultra_secure_random_key_here
```

---

## 📦 Backups & Maintenance
- **Database Backup**: All products, categories, settings, and orders live in `server/data/store.json`. To backup your store, simply download or copy `server/data/store.json`.
- **Uploaded Images**: All uploaded custom images are stored in `server/data/uploads/`.
