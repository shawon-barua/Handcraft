# 📋 Step-by-Step cPanel Deployment Guide — Falguni Handcraft
**Live Domain:** `https://falgunishandcraft.com`  
**GitHub Repo:** `https://github.com/shawon-barua/Handcraft.git`

This project is configured so that **no build commands are required on your cPanel server**. The production-ready storefront is already compiled inside `/dist`, and the root startup file `app.js` handles routing, security, and the API.

---

## 🧭 Exact cPanel Setup Values

When creating or configuring your application in cPanel **"Setup Node.js App"**, enter these exact values:

| Field in cPanel | Exact Value to Enter |
| :--- | :--- |
| **Node.js version** | **`20.x`** *(or `18.x` if 20 is not available)* |
| **Application mode** | **`Production`** |
| **Application root** | `falgunishandcraft` *(or your chosen directory name)* |
| **Application URL** | Select **`falgunishandcraft.com`** |
| **Application startup file** | **`app.js`** *(or `server/server.js`)* |

---

## 🛠️ Step-by-Step Instructions

### Step 1: DNS & Domain Check
1. Go to your domain registrar (Namecheap, Cloudflare, etc.) or cPanel Zone Editor:
   - Ensure the **A record** (`@`) points to your cPanel server's IP address.
   - Ensure the **CNAME** (`www`) points to `falgunishandcraft.com`.
2. In cPanel, ensure `falgunishandcraft.com` is configured as your primary or addon domain with its document root.

---

### Step 2: Deploy Code to cPanel (Method A or B)

#### Method A: Using cPanel "Git Version Control" (Recommended & Easiest)
1. Open cPanel and search for **Git Version Control**.
2. Click **Create**:
   - **Clone URL**: `https://github.com/shawon-barua/Handcraft.git`
   - **Repository Path**: `falgunishandcraft` *(must match your Application root)*
   - **Repository Name**: `falgunishandcraft`
3. Click **Create**. cPanel will automatically download all code and the pre-built `dist/` bundle!
4. Whenever you push new updates in the future, simply click **Pull or Deploy** in Git Version Control and then click **Restart** in the Node.js app!

#### Method B: Using File Manager / FTP
1. On your local machine, zip the project folder *(excluding `node_modules`)*.
2. In cPanel **File Manager**, upload the zip to `falgunishandcraft/` and extract it.

---

### Step 3: Create the Node.js App in cPanel
1. In cPanel, open **Setup Node.js App** (under the "Software" category).
2. Click **Create Application**.
3. Fill in the values from the table above:
   - Node.js Version: `20.x` (or `18.x`)
   - Mode: `Production`
   - Application root: `falgunishandcraft`
   - Application URL: `falgunishandcraft.com`
   - Application startup file: `app.js`
4. Click **Create**.

---

### Step 4: Install Dependencies & Launch
1. On the Node.js app page, locate the **Run NPM Install** button and click it.
   *(cPanel will install express, cors, helmet, bcryptjs, etc.)*
2. Under **Environment variables** (optional), you can add:
   - Name: `NODE_ENV` | Value: `production`
   - Name: `JWT_SECRET` | Value: *(a secret string of your choice)*
3. Click **Restart Application**.
4. Visit `https://falgunishandcraft.com` — your store is LIVE! 🎉

---

### Step 5: Enable Free SSL Certificate (HTTPS)
1. In cPanel, search for **SSL/TLS Status**.
2. Check the box next to `falgunishandcraft.com` and `www.falgunishandcraft.com`.
3. Click **Run AutoSSL**. Wait 1–2 minutes for the green padlock to appear.

---

## 💡 Important cPanel Tips

- **Pre-built Storefront**: You do **not** need to run `npm run build` on cPanel. The production bundle is already compiled inside `/dist` and tracked in Git.
- **Admin Login**:
  - Super Admin: `shawon.cse.ku@gmail.com` / `superadmin123`
  - Admin Portal URL: `https://falgunishandcraft.com/admin` (or click Admin in the storefront footer).
- **Store Data Backups**:
  - All categories, products, admins, and orders are saved in `server/data/store.json`.
  - In cPanel File Manager, you can download `server/data/store.json` anytime for a complete 1-click backup.
