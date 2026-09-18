/**
 * Copyright (c) 2026 Shawon Barua (shawon.cse.ku@gmail.com)
 * All rights reserved.
 */

import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import compression from 'compression';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5005;
const JWT_SECRET = process.env.JWT_SECRET || 'falguni-artisan-super-secret-key-2026';

// -------------------------------------------------------------
// PERFORMANCE & SECURITY MIDDLEWARE
// -------------------------------------------------------------
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));
app.use(compression());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Anti-caching headers for dynamic API endpoints (instructs LiteSpeed, proxies, & browsers never to cache)
app.use('/api', (req, res, next) => {
  res.set({
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
    'Surrogate-Control': 'no-store'
  });
  next();
});

// Rate Limiters
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many failed login attempts. Please try again in 15 minutes.' }
});

const orderLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many orders submitted. Please try again shortly.' }
});

// Paths
const DATA_DIR = path.join(__dirname, 'data');
const STORE_FILE = path.join(DATA_DIR, 'store.json');
const BACKUP_FILE = path.join(DATA_DIR, 'store.backup.json');
const INITIAL_FILE = path.join(DATA_DIR, 'initialData.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const UPLOADS_DIR = path.join(DATA_DIR, 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}
app.use('/uploads', express.static(UPLOADS_DIR, { maxAge: '7d' }));

// -------------------------------------------------------------
// IN-MEMORY STORE CACHING & ROBUST DISK PERSISTENCE
// -------------------------------------------------------------
let memoryStore = null;

function saveStoreSync(data) {
  const content = JSON.stringify(data, null, 2);
  let saved = false;

  // 1. Direct write (proven reliable on cPanel/CloudLinux filesystems, identical to image uploads)
  try {
    fs.writeFileSync(STORE_FILE, content, 'utf-8');
    saved = true;
  } catch (directErr) {
    console.warn('Direct write to store.json failed, attempting tmp rename fallback:', directErr.message);
  }

  // 2. Fallback via tmp rename if direct write encountered a filesystem lock
  if (!saved) {
    try {
      const tmpFile = `${STORE_FILE}.tmp`;
      fs.writeFileSync(tmpFile, content, 'utf-8');
      fs.renameSync(tmpFile, STORE_FILE);
      saved = true;
    } catch (renameErr) {
      console.error('CRITICAL: Fallback tmp rename also failed:', renameErr.message);
    }
  }

  // 3. Persistent local backup (never tracked in Git)
  try {
    fs.writeFileSync(BACKUP_FILE, content, 'utf-8');
  } catch (backupErr) {
    console.warn('Warning: Could not write store.backup.json:', backupErr.message);
  }

  if (!saved) {
    throw new Error('CRITICAL: Failed to write store data to disk on server');
  }
}

function loadStore() {
  try {
    let storeData;
    // Empty/corrupted file check (< 5 bytes means corrupted or blank file)
    if (!fs.existsSync(STORE_FILE) || fs.statSync(STORE_FILE).size < 5) {
      // Check if persistent backup exists first
      if (fs.existsSync(BACKUP_FILE) && fs.statSync(BACKUP_FILE).size >= 5) {
        console.log('Restoring store from persistent backup store.backup.json...');
        const backupData = fs.readFileSync(BACKUP_FILE, 'utf-8');
        fs.writeFileSync(STORE_FILE, backupData, 'utf-8');
        storeData = JSON.parse(backupData);
      } else {
        console.log('Initializing store from initialData.json...');
        const initialData = fs.readFileSync(INITIAL_FILE, 'utf-8');
        fs.writeFileSync(STORE_FILE, initialData, 'utf-8');
        storeData = JSON.parse(initialData);
      }
    } else {
      const data = fs.readFileSync(STORE_FILE, 'utf-8');
      storeData = JSON.parse(data);
    }

    // Guarantee default Super Admin exists with bcrypt hashed password
    if (!storeData.admins || !Array.isArray(storeData.admins) || storeData.admins.length === 0) {
      storeData.admins = [
        {
          id: 'admin-super-01',
          name: 'Shawon (Super Admin)',
          email: 'shawon.cse.ku@gmail.com',
          password: bcrypt.hashSync('superadmin123', 10),
          role: 'superadmin',
          createdAt: new Date().toISOString()
        }
      ];
      saveStoreSync(storeData);
    } else {
      let migrated = false;
      // Upgrade plaintext passwords to bcrypt
      storeData.admins.forEach(admin => {
        if (admin.password && !admin.password.startsWith('$2a$') && !admin.password.startsWith('$2b$')) {
          admin.password = bcrypt.hashSync(admin.password, 10);
          migrated = true;
        }
      });

      // Ensure primary superadmin role
      const superAdminIndex = storeData.admins.findIndex(
        a => a.id === 'admin-super-01' || a.email.toLowerCase() === 'shawon.cse.ku@gmail.com'
      );
      if (superAdminIndex !== -1 && storeData.admins[superAdminIndex].role !== 'superadmin') {
        storeData.admins[superAdminIndex].role = 'superadmin';
        migrated = true;
      }

      if (migrated) {
        saveStoreSync(storeData);
      }
    }

    memoryStore = storeData;
    return memoryStore;
  } catch (err) {
    console.error('Error reading store file, falling back to initial data:', err);
    try {
      const initialData = fs.readFileSync(INITIAL_FILE, 'utf-8');
      memoryStore = JSON.parse(initialData);
      saveStoreSync(memoryStore);
      return memoryStore;
    } catch {
      memoryStore = { categories: [], products: [], orders: [], settings: {}, admins: [] };
      return memoryStore;
    }
  }
}

function saveStore(data) {
  memoryStore = data;
  saveStoreSync(data);
}

// Preload store on boot
loadStore();

// -------------------------------------------------------------
// AUTHENTICATION & AUTHORIZATION MIDDLEWARE
// -------------------------------------------------------------
function requireAdmin(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized: Admin authentication token required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Unauthorized: Invalid or expired token' });
  }
}

function requireSuperAdmin(req, res, next) {
  requireAdmin(req, res, () => {
    if (req.user?.role !== 'superadmin') {
      return res.status(403).json({ error: 'Forbidden: Super Admin privileges required' });
    }
    next();
  });
}

// -------------------------------------------------------------
// FILE UPLOAD (Hardened image-only upload)
// -------------------------------------------------------------
app.post('/api/upload', requireAdmin, (req, res) => {
  try {
    const { image, filename } = req.body;
    if (!image) {
      return res.status(400).json({ error: 'No image data provided' });
    }

    const matches = image.match(/^data:([A-Za-z0-9-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return res.status(400).json({ error: 'Invalid base64 image data' });
    }

    const mimeType = matches[1].toLowerCase();
    const base64Data = matches[2];
    const buffer = Buffer.from(base64Data, 'base64');

    const mimeToExt = {
      'image/jpeg': '.jpg',
      'image/jpg': '.jpg',
      'image/png': '.png',
      'image/webp': '.webp'
    };

    const ext = mimeToExt[mimeType];
    if (!ext) {
      return res.status(400).json({ error: 'Invalid format. Only JPEG, PNG, and WEBP images are permitted.' });
    }

    if (buffer.length > 10 * 1024 * 1024) {
      return res.status(400).json({ error: 'Image file size exceeds maximum limit of 10MB' });
    }

    const safeName = `item-${Date.now()}-${Math.random().toString(36).substring(2, 7)}${ext}`;
    const filePath = path.join(UPLOADS_DIR, safeName);

    fs.writeFileSync(filePath, buffer);
    const publicUrl = `/uploads/${safeName}`;

    res.json({ success: true, url: publicUrl, filename: safeName });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

// -------------------------------------------------------------
// AUTHENTICATION & ADMIN MANAGEMENT
// -------------------------------------------------------------
app.post('/api/auth/login', loginLimiter, (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const db = loadStore();
    const normalizedInput = email.trim().toLowerCase();

    const admin = (db.admins || []).find(a => 
      a.email.toLowerCase() === normalizedInput ||
      (a.username && a.username.toLowerCase() === normalizedInput)
    );

    if (!admin) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Password verification with bcrypt & legacy upgrade
    let isMatch = false;
    if (admin.password.startsWith('$2a$') || admin.password.startsWith('$2b$')) {
      isMatch = bcrypt.compareSync(password, admin.password);
    } else {
      isMatch = admin.password === password;
      if (isMatch) {
        admin.password = bcrypt.hashSync(password, 10);
        saveStore(db);
      }
    }

    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: admin.id, name: admin.name, email: admin.email, role: admin.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const { password: _, ...safeUser } = admin;
    res.json({
      success: true,
      user: safeUser,
      token
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error during login' });
  }
});

// List admins (Protected: Admin only)
app.get('/api/auth/admins', requireAdmin, (req, res) => {
  try {
    const db = loadStore();
    const safeAdmins = (db.admins || []).map(({ password, ...rest }) => rest);
    res.json(safeAdmins);
  } catch (err) {
    console.error('Fetch admins error:', err);
    res.status(500).json({ error: 'Failed to fetch admin list' });
  }
});

// Create new admin (Protected: Super Admin only)
app.post('/api/auth/admins', requireSuperAdmin, (req, res) => {
  try {
    const { name, email, password, role } = req.body || {};
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    const db = loadStore();
    if (!db.admins) db.admins = [];

    const normalizedEmail = email.trim().toLowerCase();
    const existing = db.admins.find(a => a.email.toLowerCase() === normalizedEmail);
    if (existing) {
      return res.status(400).json({ error: 'An admin account with this email already exists' });
    }

    const newAdmin = {
      id: `admin-${Date.now()}`,
      name: name.trim(),
      email: normalizedEmail,
      password: bcrypt.hashSync(password.trim(), 10),
      role: role === 'superadmin' ? 'superadmin' : 'admin',
      createdAt: new Date().toISOString()
    };

    db.admins.push(newAdmin);
    saveStore(db);

    const { password: _, ...safeUser } = newAdmin;
    res.status(201).json({ success: true, admin: safeUser });
  } catch (err) {
    console.error('Create admin error:', err);
    res.status(500).json({ error: 'Failed to create admin' });
  }
});

// Delete an admin account (Protected: Super Admin only)
app.delete('/api/auth/admins/:id', requireSuperAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const db = loadStore();
    if (!db.admins) return res.status(404).json({ error: 'No admin accounts found' });

    const targetIndex = db.admins.findIndex(a => a.id === id);
    if (targetIndex === -1) {
      return res.status(404).json({ error: 'Admin account not found' });
    }

    const target = db.admins[targetIndex];

    if (
      target.role === 'superadmin' || 
      target.id === 'admin-super-01' || 
      target.email.toLowerCase() === 'shawon.cse.ku@gmail.com'
    ) {
      return res.status(403).json({ 
        error: 'CRITICAL SECURITY: The Super Admin account cannot be deleted or removed.' 
      });
    }

    db.admins.splice(targetIndex, 1);
    saveStore(db);

    res.json({ success: true, message: `Admin account '${target.name}' successfully deleted` });
  } catch (err) {
    console.error('Delete admin error:', err);
    res.status(500).json({ error: 'Failed to delete admin' });
  }
});

// Change own password (Protected: Any logged-in Admin)
app.post('/api/auth/change-password', requireAdmin, (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body || {};
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required' });
    }

    if (String(newPassword).trim().length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters long' });
    }

    const db = loadStore();
    const admin = (db.admins || []).find(
      a => a.id === req.user.id || a.email.toLowerCase() === req.user.email.toLowerCase()
    );
    if (!admin) {
      return res.status(404).json({ error: 'Admin account not found' });
    }

    // Verify current password
    let isMatch = false;
    if (admin.password.startsWith('$2a$') || admin.password.startsWith('$2b$')) {
      isMatch = bcrypt.compareSync(currentPassword, admin.password);
    } else {
      isMatch = admin.password === currentPassword;
    }

    if (!isMatch) {
      return res.status(401).json({ error: 'Incorrect current password. Please verify and try again.' });
    }

    // Update password with bcrypt hash
    admin.password = bcrypt.hashSync(newPassword.trim(), 10);
    saveStore(db);

    res.json({ success: true, message: 'Your password has been changed successfully!' });
  } catch (err) {
    console.error('Change password error:', err);
    res.status(500).json({ error: 'Failed to change password' });
  }
});

// Reset an admin's password (Protected: Super Admin only)
app.post('/api/auth/reset-admin-password', requireSuperAdmin, (req, res) => {
  try {
    const { adminId, newPassword } = req.body || {};
    if (!adminId || !newPassword) {
      return res.status(400).json({ error: 'Admin ID and new password are required' });
    }

    if (String(newPassword).trim().length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters long' });
    }

    const db = loadStore();
    const admin = (db.admins || []).find(a => a.id === adminId);
    if (!admin) {
      return res.status(404).json({ error: 'Admin account not found' });
    }

    admin.password = bcrypt.hashSync(newPassword.trim(), 10);
    saveStore(db);

    res.json({ success: true, message: `Password for ${admin.name} has been updated successfully!` });
  } catch (err) {
    console.error('Reset admin password error:', err);
    res.status(500).json({ error: 'Failed to reset password' });
  }
});

// -------------------------------------------------------------
// SETTINGS
// -------------------------------------------------------------
app.get('/api/settings', (req, res) => {
  const db = loadStore();
  res.json(db.settings || {});
});

app.post('/api/settings', requireAdmin, (req, res) => {
  const db = loadStore();
  db.settings = { ...db.settings, ...req.body };
  saveStore(db);
  res.json({ success: true, settings: db.settings });
});

// -------------------------------------------------------------
// CATEGORIES
// -------------------------------------------------------------
app.get('/api/categories', (req, res) => {
  const db = loadStore();
  const categoriesWithCounts = (db.categories || []).map(cat => {
    const catProducts = (db.products || []).filter(p => p && (p.category === cat.slug || p.category === cat.id));
    const count = catProducts.length;

    // Find if any product has an uploaded image (/uploads/ or base64 data)
    const productWithUpload = catProducts.find(p => 
      (p.image && (p.image.startsWith('/uploads/') || p.image.startsWith('data:'))) ||
      (Array.isArray(p.images) && p.images.some(img => img && (img.startsWith('/uploads/') || img.startsWith('data:'))))
    );

    let uploadedProductImg = null;
    if (productWithUpload) {
      if (productWithUpload.image && (productWithUpload.image.startsWith('/uploads/') || productWithUpload.image.startsWith('data:'))) {
        uploadedProductImg = productWithUpload.image;
      } else {
        uploadedProductImg = productWithUpload.images?.find(img => img && (img.startsWith('/uploads/') || img.startsWith('data:')));
      }
    }

    const latestProd = catProducts.find(p => p.image || (Array.isArray(p.images) && p.images[0]));
    const latestProdImg = latestProd ? (latestProd.image || latestProd.images[0]) : null;

    let resolvedImage = cat.image;
    if (cat.image && (cat.image.startsWith('/uploads/') || cat.image.startsWith('data:'))) {
      resolvedImage = cat.image;
    } else if (uploadedProductImg) {
      resolvedImage = uploadedProductImg;
    } else if (!resolvedImage || resolvedImage.includes('unsplash.com')) {
      resolvedImage = latestProdImg || resolvedImage;
    }

    return { 
      ...cat, 
      image: resolvedImage || cat.image,
      productCount: count,
      latestProductImage: latestProdImg
    };
  });
  res.json(categoriesWithCounts);
});

app.post('/api/categories', requireAdmin, (req, res) => {
  const db = loadStore();
  const { name, description, image, icon } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Category name is required' });
  }

  const slug = req.body.slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const newCat = {
    id: slug,
    name,
    slug,
    description: description || '',
    image: image || 'https://images.unsplash.com/photo-1611591475847-19069d511977?auto=format&fit=crop&w=600&q=80',
    icon: icon || 'Sparkles'
  };

  db.categories.push(newCat);
  saveStore(db);
  res.status(201).json(newCat);
});

app.put('/api/categories/:id', requireAdmin, (req, res) => {
  const db = loadStore();
  const index = db.categories.findIndex(c => c.id === req.params.id || c.slug === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Category not found' });
  }

  db.categories[index] = { ...db.categories[index], ...req.body };
  saveStore(db);
  res.json(db.categories[index]);
});

app.delete('/api/categories/:id', requireAdmin, (req, res) => {
  const db = loadStore();
  const id = req.params.id;
  db.categories = db.categories.filter(c => c.id !== id && c.slug !== id);
  saveStore(db);
  res.json({ success: true });
});

// -------------------------------------------------------------
// PRODUCTS
// -------------------------------------------------------------
app.get('/api/products', (req, res) => {
  const db = loadStore();
  let products = db.products || [];

  const { category, search, minPrice, maxPrice } = req.query;

  if (category && category !== 'all') {
    products = products.filter(p => p.category === category);
  }

  if (search) {
    const q = search.toLowerCase().trim();
    const getRelevance = (p) => {
      const title = (p.title || '').toLowerCase();
      const cat = (p.category || '').toLowerCase().replace(/-/g, ' ');
      const words = title.split(/\s+/);
      const catWords = cat.split(/\s+/);
      let score = 0;

      if (title.startsWith(q)) score += 150;
      else if (words.some(w => w.startsWith(q))) score += 100;
      else if (cat.startsWith(q) || catWords.some(w => w.startsWith(q))) score += 80;
      else if (title.includes(q)) score += 50;
      else if (cat.includes(q)) score += 35;

      if (q.length <= 2) {
        const matWords = (p.materials || '').toLowerCase().split(/[\s,]+/);
        if (matWords.some(w => w.startsWith(q))) score += 15;
      } else {
        if ((p.materials || '').toLowerCase().includes(q)) score += 15;
        if ((p.description || '').toLowerCase().includes(q)) score += 10;
      }
      return score;
    };

    products = products
      .map(p => ({ product: p, score: getRelevance(p) }))
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .map(item => item.product);
  }

  if (minPrice) {
    products = products.filter(p => p.price >= Number(minPrice));
  }
  if (maxPrice) {
    products = products.filter(p => p.price <= Number(maxPrice));
  }

  res.json(products);
});

app.get('/api/products/:id', (req, res) => {
  const db = loadStore();
  const product = (db.products || []).find(p => p.id === req.params.id);
  if (!product) return res.status(404).json({ error: 'Product not found' });
  res.json(product);
});

app.post('/api/products', requireAdmin, (req, res) => {
  const db = loadStore();
  const { title, category, price, description, materials, quality, craftingTime, image, images, image1, image2, image3, stock, originalPrice, badges } = req.body;

  if (!title || !category || price === undefined) {
    return res.status(400).json({ error: 'Title, category, and price are required' });
  }

  let productImages = [];
  if (Array.isArray(images) && images.length > 0) {
    productImages = images.filter(Boolean);
  } else if (image1 || image2 || image3) {
    productImages = [image1, image2, image3].filter(Boolean);
  } else if (image) {
    productImages = [image];
  }

  const defaultImg = 'https://images.unsplash.com/photo-1611591475847-19069d511977?auto=format&fit=crop&w=800&q=80';
  while (productImages.length < 3) {
    productImages.push(productImages[0] || defaultImg);
  }

  const newProduct = {
    id: `p-${Date.now()}`,
    title: String(title).trim(),
    category: String(category).trim(),
    price: Math.max(0, Number(price)),
    originalPrice: originalPrice ? Math.max(0, Number(originalPrice)) : Math.round(Number(price) * 1.25),
    description: description || 'Beautiful handcrafted artisan piece made with premium traditional materials.',
    materials: materials || 'Handcrafted Organic Materials',
    quality: quality || '100% Artisan Handcrafted, Premium Quality',
    craftingTime: craftingTime || '3-4 Days of meticulous artisan effort',
    badges: badges && badges.length ? badges : ['Handcrafted'],
    stock: stock !== undefined ? Math.max(0, Number(stock)) : 10,
    rating: 5.0,
    images: productImages.slice(0, 3),
    image: productImages[0]
  };

  db.products.unshift(newProduct);
  saveStore(db);
  res.status(201).json(newProduct);
});

app.put('/api/products/:id', requireAdmin, (req, res) => {
  const db = loadStore();
  const index = db.products.findIndex(p => p.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Product not found' });
  }

  const updates = { ...req.body };
  if (req.body.price !== undefined) updates.price = Math.max(0, Number(req.body.price));
  if (req.body.originalPrice !== undefined) updates.originalPrice = Math.max(0, Number(req.body.originalPrice));
  if (req.body.stock !== undefined) updates.stock = Math.max(0, Number(req.body.stock));

  if (req.body.images && Array.isArray(req.body.images)) {
    updates.images = req.body.images.filter(Boolean).slice(0, 3);
    if (updates.images.length > 0) updates.image = updates.images[0];
  } else if (req.body.image1 || req.body.image2 || req.body.image3) {
    updates.images = [req.body.image1, req.body.image2, req.body.image3].filter(Boolean);
    if (updates.images.length > 0) updates.image = updates.images[0];
  }

  db.products[index] = { ...db.products[index], ...updates };
  saveStore(db);
  res.json(db.products[index]);
});

app.delete('/api/products/:id', requireAdmin, (req, res) => {
  const db = loadStore();
  db.products = db.products.filter(p => p.id !== req.params.id);
  saveStore(db);
  res.json({ success: true });
});

// -------------------------------------------------------------
// ORDERS & CHECKOUT (Protected Orders List + Verified Calculation)
// -------------------------------------------------------------
app.get('/api/orders', requireAdmin, (req, res) => {
  const db = loadStore();
  const orders = [...(db.orders || [])].sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));
  res.json(orders);
});

app.post('/api/orders', orderLimiter, (req, res) => {
  const db = loadStore();
  const { customer, items, channel } = req.body;

  if (!customer || !items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Customer info and items are required' });
  }

  // Recalculate price server-side from product catalog to prevent price tampering
  const verifiedItems = items.map(item => {
    const dbProd = (db.products || []).find(p => p.id === item.id);
    const verifiedPrice = dbProd ? Number(dbProd.price) : (Number(item.price) || 0);
    const quantity = Math.max(1, Math.min(Number(item.quantity) || 1, 100));
    return {
      id: item.id,
      title: dbProd ? dbProd.title : String(item.title || 'Handcrafted Item'),
      price: verifiedPrice,
      quantity,
      image: dbProd ? dbProd.image : String(item.image || '')
    };
  });

  const verifiedTotal = verifiedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const orderNumber = Math.floor(1000 + Math.random() * 9000);

  const newOrder = {
    id: `ORD-${orderNumber}`,
    orderDate: new Date().toISOString(),
    channel: channel || 'whatsapp',
    status: 'In Negotiation',
    customer: {
      name: String(customer.name || 'Anonymous Customer').slice(0, 100),
      phone: String(customer.phone || '').slice(0, 30),
      address: String(customer.address || '').slice(0, 250),
      city: String(customer.city || 'Dhaka').slice(0, 50),
      notes: String(customer.notes || '').slice(0, 500)
    },
    items: verifiedItems,
    totalAmount: verifiedTotal,
    specialNote: ''
  };

  db.orders.unshift(newOrder);
  saveStore(db);
  res.status(201).json(newOrder);
});

app.patch('/api/orders/:id', requireAdmin, (req, res) => {
  const db = loadStore();
  const order = db.orders.find(o => o.id === req.params.id);
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }

  if (req.body.status !== undefined) {
    const oldStatus = order.status;
    order.status = req.body.status;

    const updater = req.body.updatedBy || req.body.changedBy || req.user?.name || 'Admin';
    const updaterName = typeof updater === 'object' 
      ? (updater.name || updater.email || 'Admin') 
      : String(updater).trim();

    order.statusUpdatedBy = updaterName;
    order.statusUpdatedAt = new Date().toISOString();

    if (!Array.isArray(order.statusHistory)) {
      order.statusHistory = [];
      if (oldStatus) {
        order.statusHistory.push({
          status: oldStatus,
          changedBy: order.statusUpdatedBy || 'System / Initial Order',
          at: order.orderDate || new Date().toISOString()
        });
      }
    }

    order.statusHistory.push({
      status: req.body.status,
      changedBy: updaterName,
      at: new Date().toISOString()
    });
  }

  if (req.body.specialNote !== undefined) {
    order.specialNote = req.body.specialNote;
    if (req.body.noteUpdatedBy) {
      order.noteUpdatedBy = String(req.body.noteUpdatedBy).trim();
      order.noteUpdatedAt = new Date().toISOString();
    }
  }

  if (req.body.totalAmount !== undefined) {
    order.totalAmount = Math.max(0, Number(req.body.totalAmount));
  }

  saveStore(db);
  res.json(order);
});

app.delete('/api/orders/:id', requireAdmin, (req, res) => {
  const db = loadStore();
  const index = (db.orders || []).findIndex(o => o.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Order not found' });
  }
  db.orders.splice(index, 1);
  saveStore(db);
  res.json({ success: true, message: 'Order deleted successfully' });
});

app.delete('/api/orders', requireAdmin, (req, res) => {
  const db = loadStore();
  db.orders = [];
  saveStore(db);
  res.json({ success: true, message: 'All orders cleared successfully' });
});

// -------------------------------------------------------------
// ADMIN STATS & ANALYTICS (Protected)
// -------------------------------------------------------------
app.get('/api/stats', requireAdmin, (req, res) => {
  const db = loadStore();
  const orders = db.orders || [];
  const products = db.products || [];
  const categories = db.categories || [];

  const totalOrders = orders.length;

  const confirmedOrCompletedOrders = orders.filter(o =>
    o.status === 'Confirmed' || o.status === 'Confirmed Sales'
  );

  const totalSale = confirmedOrCompletedOrders.reduce((acc, o) => acc + (Number(o.totalAmount) || 0), 0);
  const potentialNegotiationSale = orders
    .filter(o => o.status === 'In Negotiation' || o.status === 'Active Negotiation')
    .reduce((acc, o) => acc + (Number(o.totalAmount) || 0), 0);

  const inNegotiationCount = orders.filter(o => o.status === 'In Negotiation' || o.status === 'Active Negotiation').length;

  const categoryStats = categories.map(cat => {
    const catProducts = products.filter(p => p.category === cat.slug || p.category === cat.id);
    let orderCountForCat = 0;
    orders.forEach(ord => {
      ord.items?.forEach(item => {
        const prod = products.find(p => p.id === item.id);
        if (prod && (prod.category === cat.slug || prod.category === cat.id)) {
          orderCountForCat += item.quantity || 1;
        }
      });
    });

    return {
      name: cat.name,
      slug: cat.slug,
      productCount: catProducts.length,
      ordersItemCount: orderCountForCat
    };
  });

  res.json({
    totalOrders,
    totalSale,
    potentialNegotiationSale,
    inNegotiationCount,
    totalProducts: products.length,
    totalCategories: categories.length,
    categoryStats,
    recentOrders: orders.slice(0, 5)
  });
});

// -------------------------------------------------------------
// STATIC FRONTEND SERVING WITH CACHING & COMPRESSION
// -------------------------------------------------------------
const DIST_DIR = path.join(__dirname, '../dist');
if (fs.existsSync(DIST_DIR)) {
  // 1-year immutable caching for hashed assets
  app.use('/assets', express.static(path.join(DIST_DIR, 'assets'), {
    maxAge: '1y',
    immutable: true
  }));

  // General static file cache
  app.use(express.static(DIST_DIR, {
    maxAge: '1h'
  }));

  app.get('*', (req, res) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
      return res.status(404).json({ error: 'Resource not found' });
    }
    res.sendFile(path.join(DIST_DIR, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`✨ Handcrafted Store running securely on http://localhost:${PORT}`);
});
