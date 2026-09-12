import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5005;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

const DATA_DIR = path.join(__dirname, 'data');
const STORE_FILE = path.join(DATA_DIR, 'store.json');
const INITIAL_FILE = path.join(DATA_DIR, 'initialData.json');

const UPLOADS_DIR = path.join(__dirname, '../public/uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}
app.use('/uploads', express.static(UPLOADS_DIR));

// Image Upload Endpoint (Base64 file upload)
app.post('/api/upload', (req, res) => {
  try {
    const { image, filename } = req.body;
    if (!image) {
      return res.status(400).json({ error: 'No image data provided' });
    }

    const matches = image.match(/^data:([A-Za-z0-9-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return res.status(400).json({ error: 'Invalid base64 image data' });
    }

    const mimeType = matches[1];
    const base64Data = matches[2];
    const buffer = Buffer.from(base64Data, 'base64');

    let ext = '.jpg';
    if (mimeType.includes('png')) ext = '.png';
    else if (mimeType.includes('webp')) ext = '.webp';
    else if (mimeType.includes('jpeg') || mimeType.includes('jpg')) ext = '.jpg';
    else if (filename) {
      const originalExt = path.extname(filename);
      if (originalExt) ext = originalExt;
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

// Initialize store if not present
function loadStore() {
  try {
    let storeData;
    if (!fs.existsSync(STORE_FILE)) {
      const initialData = fs.readFileSync(INITIAL_FILE, 'utf-8');
      fs.writeFileSync(STORE_FILE, initialData, 'utf-8');
      storeData = JSON.parse(initialData);
    } else {
      const data = fs.readFileSync(STORE_FILE, 'utf-8');
      storeData = JSON.parse(data);
    }

    // Guarantee default Super Admin exists and is protected
    if (!storeData.admins || !Array.isArray(storeData.admins) || storeData.admins.length === 0) {
      storeData.admins = [
        {
          id: 'admin-super-01',
          name: 'Shawon (Super Admin)',
          email: 'shawon.cse.ku@gmail.com',
          password: 'superadmin123',
          role: 'superadmin',
          createdAt: new Date().toISOString()
        }
      ];
      saveStore(storeData);
    } else {
      // Ensure primary superadmin has role 'superadmin'
      const superAdminIndex = storeData.admins.findIndex(
        a => a.id === 'admin-super-01' || a.email.toLowerCase() === 'shawon.cse.ku@gmail.com'
      );
      if (superAdminIndex !== -1 && storeData.admins[superAdminIndex].role !== 'superadmin') {
        storeData.admins[superAdminIndex].role = 'superadmin';
        saveStore(storeData);
      }
    }

    return storeData;
  } catch (err) {
    console.error('Error reading store file:', err);
    return { categories: [], products: [], orders: [], settings: {}, admins: [] };
  }
}

function saveStore(data) {
  try {
    fs.writeFileSync(STORE_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving store file:', err);
  }
}

// -------------------------------------------------------------
// AUTHENTICATION & ADMIN MANAGEMENT
// -------------------------------------------------------------
app.post('/api/auth/login', (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const db = loadStore();
    const normalizedInput = email.trim().toLowerCase();

    // Find admin matching email or username
    const admin = (db.admins || []).find(a => 
      a.email.toLowerCase() === normalizedInput ||
      (a.username && a.username.toLowerCase() === normalizedInput)
    );

    if (!admin || admin.password !== password) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Success: return safe user info (exclude password)
    const { password: _, ...safeUser } = admin;
    res.json({
      success: true,
      user: safeUser,
      token: `admin-token-${admin.id}-${Date.now()}`
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error during login' });
  }
});

// List admins (passwords omitted)
app.get('/api/auth/admins', (req, res) => {
  try {
    const db = loadStore();
    const safeAdmins = (db.admins || []).map(({ password, ...rest }) => rest);
    res.json(safeAdmins);
  } catch (err) {
    console.error('Fetch admins error:', err);
    res.status(500).json({ error: 'Failed to fetch admin list' });
  }
});

// Create new admin (Superadmin capability)
app.post('/api/auth/admins', (req, res) => {
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
      password: password.trim(),
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

// Delete an admin account (Protected: Cannot delete Super Admin)
app.delete('/api/auth/admins/:id', (req, res) => {
  try {
    const { id } = req.params;
    const db = loadStore();
    if (!db.admins) return res.status(404).json({ error: 'No admin accounts found' });

    const targetIndex = db.admins.findIndex(a => a.id === id);
    if (targetIndex === -1) {
      return res.status(404).json({ error: 'Admin account not found' });
    }

    const target = db.admins[targetIndex];

    // STRICT PROTECTION: Cannot delete Super Admin
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

// -------------------------------------------------------------
// SETTINGS
// -------------------------------------------------------------
app.get('/api/settings', (req, res) => {
  const db = loadStore();
  res.json(db.settings || {});
});

app.post('/api/settings', (req, res) => {
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
  // Attach product count to each category
  const categoriesWithCounts = (db.categories || []).map(cat => {
    const count = (db.products || []).filter(p => p.category === cat.slug || p.category === cat.id).length;
    return { ...cat, productCount: count };
  });
  res.json(categoriesWithCounts);
});

app.post('/api/categories', (req, res) => {
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

app.put('/api/categories/:id', (req, res) => {
  const db = loadStore();
  const index = db.categories.findIndex(c => c.id === req.params.id || c.slug === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Category not found' });
  }

  db.categories[index] = { ...db.categories[index], ...req.body };
  saveStore(db);
  res.json(db.categories[index]);
});

app.delete('/api/categories/:id', (req, res) => {
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
    const q = search.toLowerCase();
    products = products.filter(p =>
      p.title.toLowerCase().includes(q) ||
      (p.description && p.description.toLowerCase().includes(q)) ||
      (p.materials && p.materials.toLowerCase().includes(q))
    );
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

app.post('/api/products', (req, res) => {
  const db = loadStore();
  const { title, category, price, description, materials, image, images, image1, image2, image3, stock, originalPrice, badges } = req.body;

  if (!title || !category || price === undefined) {
    return res.status(400).json({ error: 'Title, category, and price are required' });
  }

  // Assemble 3 separate images
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
    title,
    category,
    price: Number(price),
    originalPrice: originalPrice ? Number(originalPrice) : Math.round(Number(price) * 1.25),
    description: description || 'Beautiful handcrafted artisan piece made with premium traditional materials.',
    materials: materials || 'Handcrafted Organic Materials',
    badges: badges && badges.length ? badges : ['Handcrafted'],
    stock: stock !== undefined ? Number(stock) : 10,
    rating: 5.0,
    images: productImages.slice(0, 3),
    image: productImages[0]
  };

  db.products.unshift(newProduct);
  saveStore(db);
  res.status(201).json(newProduct);
});

app.put('/api/products/:id', (req, res) => {
  const db = loadStore();
  const index = db.products.findIndex(p => p.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Product not found' });
  }

  const updates = { ...req.body };
  if (req.body.price !== undefined) updates.price = Number(req.body.price);
  if (req.body.originalPrice !== undefined) updates.originalPrice = Number(req.body.originalPrice);
  if (req.body.stock !== undefined) updates.stock = Number(req.body.stock);

  // Handle images update
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

app.delete('/api/products/:id', (req, res) => {
  const db = loadStore();
  db.products = db.products.filter(p => p.id !== req.params.id);
  saveStore(db);
  res.json({ success: true });
});

// -------------------------------------------------------------
// ORDERS & CHECKOUT
// -------------------------------------------------------------
app.get('/api/orders', (req, res) => {
  const db = loadStore();
  // Return sorted newest first
  const orders = [...(db.orders || [])].sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));
  res.json(orders);
});

app.post('/api/orders', (req, res) => {
  const db = loadStore();
  const { customer, items, channel, totalAmount } = req.body;

  if (!customer || !items || !items.length) {
    return res.status(400).json({ error: 'Customer info and items are required' });
  }

  const orderNumber = Math.floor(1000 + Math.random() * 9000);
  const newOrder = {
    id: `ORD-${orderNumber}`,
    orderDate: new Date().toISOString(),
    channel: channel || 'whatsapp',
    status: 'In Negotiation',
    customer: {
      name: customer.name || 'Anonymous Customer',
      phone: customer.phone || '',
      address: customer.address || '',
      city: customer.city || 'Dhaka',
      notes: customer.notes || ''
    },
    items: items.map(item => ({
      id: item.id,
      title: item.title,
      price: item.price,
      quantity: item.quantity || 1,
      image: item.image || ''
    })),
    totalAmount: totalAmount || items.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0),
    specialNote: '' // Empty by default, ready for admin to annotate!
  };

  db.orders.unshift(newOrder);
  saveStore(db);
  res.status(201).json(newOrder);
});

app.patch('/api/orders/:id', (req, res) => {
  const db = loadStore();
  const order = db.orders.find(o => o.id === req.params.id);
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }

  if (req.body.specialNote !== undefined) {
    order.specialNote = req.body.specialNote;
  }
  if (req.body.status !== undefined) {
    order.status = req.body.status;
  }
  if (req.body.totalAmount !== undefined) {
    order.totalAmount = Number(req.body.totalAmount);
  }

  saveStore(db);
  res.json(order);
});

// -------------------------------------------------------------
// ADMIN STATS & ANALYTICS
// -------------------------------------------------------------
app.get('/api/stats', (req, res) => {
  const db = loadStore();
  const orders = db.orders || [];
  const products = db.products || [];
  const categories = db.categories || [];

  const totalOrders = orders.length;

  // Calculate total sale from confirmed sales
  const confirmedOrCompletedOrders = orders.filter(o =>
    o.status === 'Confirmed' || o.status === 'Confirmed Sales'
  );

  const totalSale = confirmedOrCompletedOrders.reduce((acc, o) => acc + (Number(o.totalAmount) || 0), 0);
  const potentialNegotiationSale = orders
    .filter(o => o.status === 'In Negotiation' || o.status === 'Active Negotiation')
    .reduce((acc, o) => acc + (Number(o.totalAmount) || 0), 0);

  const inNegotiationCount = orders.filter(o => o.status === 'In Negotiation' || o.status === 'Active Negotiation').length;

  // Category breakdown
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

// Serve Frontend Static Build in Production
const DIST_DIR = path.join(__dirname, '../dist');
if (fs.existsSync(DIST_DIR)) {
  app.use(express.static(DIST_DIR));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
      return next();
    }
    res.sendFile(path.join(DIST_DIR, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`✨ Handcrafted Store running on http://localhost:${PORT}`);
});
