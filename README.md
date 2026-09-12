# 🌸 Falguni Handcraft — Handcrafted Artisan Store

[![React](https://img.shields.io/badge/React-18.3.1-61DAFB?style=flat&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5.3.1-646CFF?style=flat&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Node Express](https://img.shields.io/badge/Express-4.19.2-000000?style=flat&logo=express&logoColor=white)](https://expressjs.com/)
[![Three.js](https://img.shields.io/badge/Three.js-0.165.0-black?style=flat&logo=three.js&logoColor=white)](https://threejs.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

An artisan e-commerce web application crafted for showcasing and selling authentic handmade jewelry, Haldi & Mehendi bridal event sets, terracotta pottery crafts, anklets, bracelets, and custom artisan creations. Built with a responsive React frontend, interactive 3D product inspection via Three.js, direct WhatsApp order routing, and a full-featured administrative control suite.

---

## ✨ Features

### 🛍️ Storefront & Customer Experience
- **Interactive Catalog & Filtering**: Browse products by category (Haldi Sets, Terracotta, Clay Jewelry, Anklets, Bracelets, etc.) with real-time keyword search and price sorting (*Featured*, *Price: Low to High*, *Price: High to Low*).
- **Interactive 3D Product Visualizer**: Powered by Three.js, allowing customers to rotate, zoom, and inspect handcrafted item details under realistic studio lighting.
- **Detailed Product Modal**: Comprehensive view with multiple image galleries, stock status, material specifications, and artisan notes.
- **Cart & Wishlist**: Fast, persistent shopping cart and wishlist saved to `localStorage` for uninterrupted sessions.
- **Seamless WhatsApp Checkout**: Directly routes customized orders and shipping addresses to the store's official WhatsApp business contact with a pre-composed itemized order summary.

### ⚙️ Admin Management Suite
- **Store Overview & Analytics**: Live snapshot of total products, orders, active inventory, and store status.
- **Product Management (CRUD)**: Create, update, toggle stock, attach multiple photos with instant image uploads, and assign 3D display models.
- **Category Control**: Add, organize, and prune product categories in real time.
- **Order Tracking**: Review incoming customer orders with status updates (*Pending*, *Confirmed*, *Shipped*, *Delivered*, *Cancelled*).
- **Live Store Settings**: Dynamically configure the store name, banner announcement, WhatsApp ordering contact, currency symbol (`৳`, `$`, etc.), and logo directly from the admin dashboard without rebuilding.

---

## 🛠️ Technology Stack

- **Frontend**:
  - [React 18](https://react.dev/) (Hooks, State Management, LocalStorage persistence)
  - [Vite 5](https://vitejs.dev/) (Fast HMR & build bundling)
  - [Three.js](https://threejs.org/) (3D interactive canvas rendering)
  - [Lucide React](https://lucide.dev/) (Icons)
  - Vanilla CSS3 (Custom design system with rich artisan earth & terracotta tones, warm shadows, glassmorphic headers)

- **Backend**:
  - [Node.js](https://nodejs.org/) & [Express.js](https://expressjs.com/) (RESTful API & static asset hosting)
  - [CORS](https://www.npmjs.com/package/cors) (Cross-Origin Resource Sharing)
  - JSON-based persistent file storage engine (`server/data/store.json`) with auto-fallback to `initialData.json`

---

## 📁 Project Structure

```text
handcrafted-store/
├── public/                 # Static assets (logos, uploads, sample product imagery)
│   └── uploads/            # Dynamically uploaded product pictures
├── server/                 # Express backend API & data persistence
│   ├── data/
│   │   ├── initialData.json# Default fallback product & category seed data
│   │   └── store.json      # Live JSON data store (products, orders, settings)
│   └── server.js           # Express API server (port 5005)
├── src/                    # React frontend application
│   ├── components/
│   │   ├── AdminPanel.jsx         # Complete store management dashboard
│   │   ├── CartDrawer.jsx         # Slide-out shopping cart
│   │   ├── CheckoutModal.jsx      # Checkout modal with WhatsApp integration
│   │   ├── HeroBanner.jsx         # Hero section & store highlights
│   │   ├── Navbar.jsx             # Navigation bar with search & quick actions
│   │   ├── ProductCard.jsx        # Grid product card with quick-actions
│   │   ├── ProductDetailModal.jsx # Full-view product modal
│   │   └── ThreeProductViewer.jsx # Three.js 3D model viewer
│   ├── App.jsx             # Main application orchestrator
│   ├── index.css           # Global typography, color tokens, and layout styles
│   └── main.jsx            # React root mount
├── .gitignore              # Git ignore configuration
├── package.json            # NPM dependencies & scripts
├── vite.config.js          # Vite configuration
└── README.md               # Project documentation
```

---

## 🚀 Getting Started

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed (v18.0.0 or higher recommended).

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/handcrafted-store.git
cd handcrafted-store
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Run Development Servers
To run both the **Vite frontend** and the **Express backend** concurrently:
```bash
npm run dev
```

- **Frontend**: Accessible at [http://localhost:5173](http://localhost:5173)
- **Backend API**: Accessible at [http://localhost:5005](http://localhost:5005)

#### Alternative Individual Run Commands:
```bash
# Start only the backend API server (port 5005)
npm run server

# Start only the Vite frontend dev server (port 5173)
npm run client
```

### 4. Build for Production
```bash
npm run build
```
To preview the generated production build locally:
```bash
npm run preview
```

---

## 🔌 API Reference

The backend runs by default at `http://localhost:5005`. Key endpoints include:

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/products` | Retrieve list of all products |
| `POST` | `/api/products` | Add a new product (Admin) |
| `PUT` | `/api/products/:id` | Update an existing product (Admin) |
| `DELETE` | `/api/products/:id` | Delete a product (Admin) |
| `GET` | `/api/categories` | Retrieve all categories |
| `POST` | `/api/categories` | Create a new category |
| `DELETE` | `/api/categories/:id` | Delete a category |
| `GET` | `/api/orders` | Retrieve list of placed orders (Admin) |
| `POST` | `/api/orders` | Create a new order (Checkout) |
| `PUT` | `/api/orders/:id` | Update order status (`shipped`, `delivered`, etc.) |
| `GET` | `/api/settings` | Retrieve store configuration & announcement |
| `POST` | `/api/settings` | Update store configuration (WhatsApp number, name, etc.) |
| `POST` | `/api/upload` | Upload product images (Base64) to `/uploads` directory |

---

## 🔒 Admin Access & Configuration

1. Click on the **Admin** shield icon in the top navigation bar to open the Admin Suite.
2. In the Admin Panel, you can:
   - Add new handcrafted items with custom images and 3D preview options.
   - Adjust product pricing, stock availability, and featured badges.
   - Update your WhatsApp phone number to receive incoming customer orders directly.
   - Customize the top announcement banner for ongoing sales or seasonal greetings.

---

## 📄 License & Copyright

Copyright © 2026 **Shawon Barua** ([shawon.cse.ku@gmail.com](mailto:shawon.cse.ku@gmail.com)). All rights reserved.

This project is licensed under the [MIT License](LICENSE).
