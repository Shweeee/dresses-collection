const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, 'data');
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');
const PRODUCTS_FILE = path.join(DATA_DIR, 'products.json');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const UPLOADS_DIR = path.join(__dirname, 'uploads', 'products');
const DUMMY_UPI_ID = 'yourshop@upi';
const DELIVERY_CHARGE = 99;
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const AUTH_TOKEN_TTL_MS = 1000 * 60 * 60 * 12;
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'Muruganuma';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Muruganuma@20';
const ADMIN_TOKEN_STORAGE = new Map();
const USER_TOKEN_STORAGE = new Map();

const getPublicImageUrl = (imagePath) => {
  if (!imagePath || typeof imagePath !== 'string') {
    return '';
  }

  if (/^https?:\/\//i.test(imagePath)) {
    return imagePath;
  }

  if (imagePath.startsWith('/uploads/')) {
    return imagePath;
  }

  return imagePath;
};

const DEFAULT_CATEGORIES = [
  'Traditional Wear',
  "Men's Shirts",
  'Sarees',
  'Gowns',
  'Maternity Wear',
  'Kids Wear'
];

const seedProducts = [
 
  {
    id: 'PROD-007',
    name: 'Rose Satin Evening Gown',
    category: 'Traditional Wear',
    description: 'A statement gown with layered detailing, premium satin finish, and multiple color-ready styling options for festive evenings.',
    price: 3999,
    discountPrice: 3299,
    stock: 18,
    sku: 'ROSE-SET-07',
    images: [
      '/uploads/products/product-1/WhatsApp Image 2026-09-17 at 7.45.26 PM (1).jpeg',
      '/uploads/products/product-1/WhatsApp Image 2026-09-17 at 7.45.26 PM.jpeg',
      '/uploads/products/product-1/WhatsApp Image 2026-09-17 at 7.45.27 PM (1).jpeg',
      '/uploads/products/product-1/WhatsApp Image 2026-09-17 at 7.45.27 PM (2).jpeg',
      '/uploads/products/product-1/WhatsApp Image 2026-09-17 at 7.45.28 PM.jpeg'
    ],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: ['Rose', 'Wine', 'Peach', 'Ivory'],
    details: {
      material: 'Satin blend',
      color: 'Rose',
      size: 'M',
      occasion: 'Festive Evening',
      fit: 'Slim Fit'
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'PROD-002',
    name: 'Silk Heritage Gown',
    category: 'Gowns',
    description: 'A flowing gown crafted for weddings and grand celebrations.',
    price: 4599,
    discountPrice: 3999,
    stock: 8,
    sku: 'GWN-002',
    images: [
      '/uploads/products/WhatsApp Image 2026-09-17 at 7.45.26 PM.jpeg',
      "uploads/products/product-2/WhatsApp Image 2026-09-20 at 11.13.59 AM.jpeg",
      ""

    ],
    sizes: ['XS', 'S', 'M', 'L'],
    colors: ['Rose', 'Black', 'Ivory'],
    details: {
      material: 'Silk Blend',
      color: 'Rose',
      size: 'M',
      sleeveType: 'Sleeveless',
      length: 'Long',
      occasion: 'Reception'
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'PROD-003',
    name: 'Classic Linen Shirt',
    category: "Men's Shirts",
    description: 'Breathable linen shirt for everyday smart casual dressing.',
    price: 1899,
    discountPrice: null,
    stock: 20,
    sku: 'MSH-003',
    images: [
      '/uploads/products/WhatsApp Image 2026-09-17 at 7.45.27 PM.jpeg'
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['White', 'Sky Blue', 'Moss'],
    details: {
      material: 'Linen',
      color: 'White',
      size: 'L',
      fit: 'Regular',
      sleeveType: 'Full Sleeve'
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'PROD-004',
    name: 'Festive Lehenga Set',
    category: 'Traditional Wear',
    description: 'A premium festive lehenga with ornate embroidery and a comfortable fit.',
    price: 5399,
    discountPrice: 4899,
    stock: 6,
    sku: 'TRD-004',
    images: [
      '/uploads/products/WhatsApp Image 2026-09-17 at 7.45.28 PM.jpeg'
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Maroon', 'Pink', 'Golden'],
    details: {
      material: 'Net and Silk',
      color: 'Maroon',
      size: 'M',
      occasion: 'Festive'
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'PROD-005',
    name: 'Comfort Ease Maternity Dress',
    category: 'Maternity Wear',
    description: 'Soft and comfortable maternity dress designed with ease of movement.',
    price: 2499,
    discountPrice: null,
    stock: 10,
    sku: 'MAT-005',
    images: [
      '/uploads/products/WhatsApp Image 2026-09-17 at 7.45.29 PM.jpeg'
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Peach', 'Blue', 'Grey'],
    details: {
      material: 'Cotton Blend',
      size: 'M',
      color: 'Peach',
      nursingFriendly: 'Yes',
      stretchable: 'Yes'
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'PROD-006',
    name: 'Rainbow Kids Kurta Set',
    category: 'Kids Wear',
    description: 'Bright and playful kids wear set for family events and celebrations.',
    price: 1499,
    discountPrice: 1299,
    stock: 15,
    sku: 'KID-006',
    images: [
      '/uploads/products/WhatsApp Image 2026-09-17 at 7.45.27 PM (1).jpeg'
    ],
    sizes: ['4Y', '6Y', '8Y', '10Y'],
    colors: ['Mint', 'Coral', 'Yellow'],
    details: {
      ageGroup: '4-10 Years',
      size: '6Y',
      material: 'Cotton',
      color: 'Mint',
      gender: 'Unisex'
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const ensureDataFiles = () => {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }

  if (!fs.existsSync(ORDERS_FILE)) {
    fs.writeFileSync(ORDERS_FILE, JSON.stringify([], null, 2));
  }

  if (!fs.existsSync(PRODUCTS_FILE)) {
    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(seedProducts.map((product) => normalizeProduct(product)), null, 2));
  }

  if (!fs.existsSync(USERS_FILE)) {
    fs.writeFileSync(USERS_FILE, JSON.stringify([], null, 2));
  }
};

const normalizeProduct = (product = {}) => {
  const images = Array.isArray(product.images) ? product.images.filter(Boolean).map((image) => getPublicImageUrl(image)) : [];
  const details = product.details && typeof product.details === 'object' ? product.details : {};
  const price = Number(product.price || 0);
  const discountPrice = product.discountPrice !== undefined && product.discountPrice !== null && product.discountPrice !== '' ? Number(product.discountPrice) : null;

  return {
    id: String(product.id || ''),
    name: String(product.name || ''),
    category: String(product.category || 'Traditional Wear'),
    description: String(product.description || ''),
    price,
    discountPrice,
    stock: Number(product.stock || 0),
    sku: String(product.sku || ''),
    images,
    image: images[0] || getPublicImageUrl(product.image || ''),
    sizes: Array.isArray(product.sizes) ? product.sizes.filter(Boolean) : [],
    colors: Array.isArray(product.colors) ? product.colors.filter(Boolean) : [],
    details,
    createdAt: product.createdAt || new Date().toISOString(),
    updatedAt: product.updatedAt || product.createdAt || new Date().toISOString()
  };
};

const readProducts = () => {
  ensureDataFiles();
  const raw = fs.readFileSync(PRODUCTS_FILE, 'utf8');
  const parsed = JSON.parse(raw || '[]');
  return (parsed || []).map((product) => normalizeProduct(product));
};

const writeProducts = (products) => {
  ensureDataFiles();
  fs.writeFileSync(PRODUCTS_FILE, JSON.stringify((products || []).map((product) => normalizeProduct(product)), null, 2));
};

const readOrders = () => {
  ensureDataFiles();
  const raw = fs.readFileSync(ORDERS_FILE, 'utf8');
  return JSON.parse(raw || '[]');
};

const writeOrders = (orders) => {
  ensureDataFiles();
  fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2));
};

const readUsers = () => {
  ensureDataFiles();
  const raw = fs.readFileSync(USERS_FILE, 'utf8');
  return JSON.parse(raw || '[]');
};

const writeUsers = (users) => {
  ensureDataFiles();
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
};

const hashPassword = (value) => crypto.createHash('sha256').update(String(value || '')).digest('hex');

const normalizeUser = (user = {}) => ({
  id: user.id || `USR-${Math.random().toString(36).slice(2, 10).toUpperCase()}`,
  username: String(user.username || '').trim(),
  passwordHash: user.passwordHash || hashPassword(user.password || ''),
  email: String(user.email || '').trim(),
  fullName: String(user.fullName || '').trim(),
  mobile: String(user.mobile || '').trim(),
  createdAt: user.createdAt || new Date().toISOString(),
  updatedAt: user.updatedAt || user.createdAt || new Date().toISOString()
});

const issueUserToken = (user) => {
  const token = crypto.randomBytes(24).toString('hex');
  USER_TOKEN_STORAGE.set(token, {
    userId: user.id,
    issuedAt: Date.now(),
    expiresAt: Date.now() + AUTH_TOKEN_TTL_MS
  });
  return token;
};

const sendOrderConfirmationEmail = (order) => {
  const recipient = (order.customer && order.customer.email) || '';
  if (!recipient) {
    return { sent: false, reason: 'No customer email on file.' };
  }

  console.log(`[EMAIL] Order confirmation sent to ${recipient} for ${order.orderId}. Total: ₹${order.totalAmount}`);
  return { sent: true, recipient, orderId: order.orderId };
};

const sendTrackingUpdateEmail = (order) => {
  const recipient = (order.customer && order.customer.email) || '';
  const trackingLink = order.trackingLink || '';
  const status = order.orderStatus || 'Shipped';

  if (!recipient) {
    return { sent: false, reason: 'No customer email on file.' };
  }

  if (!trackingLink) {
    return { sent: false, reason: 'No tracking link available.' };
  }

  console.log(`[EMAIL] Tracking update sent to ${recipient} for ${order.orderId}. Status: ${status}. Tracking: ${trackingLink}`);
  return { sent: true, recipient, orderId: order.orderId, status, trackingLink };
};

const getProductPrice = (product) => {
  if (product && product.discountPrice !== null && product.discountPrice !== undefined && Number(product.discountPrice) > 0) {
    return Number(product.discountPrice);
  }

  return Number(product.price || 0);
};

const createProductId = () => {
  const now = new Date();
  const datePart = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
  return `PROD-${datePart}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
};

const isAdminTokenValid = (token) => {
  if (!token) {
    return false;
  }

  const tokenEntry = ADMIN_TOKEN_STORAGE.get(token);
  if (!tokenEntry) {
    return false;
  }

  if (Date.now() > tokenEntry.expiresAt) {
    ADMIN_TOKEN_STORAGE.delete(token);
    return false;
  }

  return true;
};

const requireAdmin = (req, res, next) => {
  const token = req.headers['x-admin-token'];

  if (!isAdminTokenValid(token)) {
    return res.status(401).json({ message: 'Admin authentication required.' });
  }

  return next();
};

const requireUser = (req, res, next) => {
  const token = req.headers['x-user-token'];
  const tokenEntry = USER_TOKEN_STORAGE.get(token);

  if (!tokenEntry || Date.now() > tokenEntry.expiresAt) {
    if (token) {
      USER_TOKEN_STORAGE.delete(token);
    }
    return res.status(401).json({ message: 'Customer authentication required.' });
  }

  const user = readUsers().find((entry) => entry.id === tokenEntry.userId);
  if (!user) {
    USER_TOKEN_STORAGE.delete(token);
    return res.status(401).json({ message: 'Customer account not found.' });
  }

  req.user = user;
  return next();
};

const dataUrlToBuffer = (dataUrl) => {
  const matches = dataUrl.match(/^data:(image\/(jpeg|png|webp));base64,(.+)$/i);

  if (!matches) {
    return null;
  }

  const mimeType = matches[1].toLowerCase();
  const base64 = matches[2];

  if (!base64) {
    return null;
  }

  const buffer = Buffer.from(base64, 'base64');
  if (buffer.length > MAX_IMAGE_BYTES) {
    throw new Error('Uploaded image is too large. Maximum size is 5MB per image.');
  }

  const ext = mimeType.includes('jpeg') ? 'jpg' : mimeType.includes('png') ? 'png' : 'webp';
  const fileName = `product-${Date.now()}-${Math.random().toString(16).slice(2)}.${ext}`;
  const filePath = path.join(UPLOADS_DIR, fileName);

  fs.writeFileSync(filePath, buffer);
  return `/uploads/products/${fileName}`;
};

const saveImages = (images = []) => {
  const result = [];

  for (const image of images) {
    if (typeof image !== 'string' || !image.trim()) {
      continue;
    }

    if (image.startsWith('/uploads/')) {
      result.push(image);
      continue;
    }

    if (image.startsWith('http://') || image.startsWith('https://')) {
      result.push(image);
      continue;
    }

    if (image.startsWith('data:image/')) {
      const savedImage = dataUrlToBuffer(image);
      if (savedImage) {
        result.push(savedImage);
      }
    }
  }

  return result;
};

const deleteImageFile = (imagePath) => {
  if (!imagePath || !imagePath.startsWith('/uploads/')) {
    return;
  }

  const filePath = path.join(__dirname, imagePath.replace(/^\//, ''));
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
};

const normalizeOrder = (order) => {
  const customer = order.customer || {
    name: order.customerName || '',
    mobile: order.mobileNumber || '',
    email: order.email || ''
  };

  const address = order.address || {
    houseNumber: '',
    street: '',
    area: '',
    city: '',
    state: '',
    pincode: ''
  };

  const items = order.items || order.products || [];
  const payment = order.payment || {
    method: order.paymentMethod || 'UPI / GPay',
    upiId: DUMMY_UPI_ID,
    utrNumber: '',
    paymentScreenshot: '',
    status: order.paymentStatus || 'Verification Pending',
    rejectionReason: ''
  };

  return {
    orderId: order.orderId,
    customer,
    address,
    items,
    subtotal: Number(order.subtotal || 0),
    deliveryCharge: Number(order.deliveryCharge || DELIVERY_CHARGE),
    totalAmount: Number(order.totalAmount || 0),
    payment: {
      method: payment.method || 'UPI / GPay',
      upiId: payment.upiId || DUMMY_UPI_ID,
      utrNumber: payment.utrNumber || '',
      paymentScreenshot: payment.paymentScreenshot || '',
      status: payment.status || 'Verification Pending',
      rejectionReason: payment.rejectionReason || ''
    },
    orderStatus: order.orderStatus || order.status || 'Payment Verification Pending',
    trackingLink: order.trackingLink || '',
    createdAt: order.createdAt || order.orderDate || new Date().toISOString()
  };
};

const validateName = (name) => /^[A-Za-z][A-Za-z\s.'-]{1,}$/.test(name.trim());
const validateMobile = (mobile) => /^[6-9]\d{9}$/.test(mobile.trim());
const validateEmail = (email) => !email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
const validatePincode = (pincode) => /^[1-9][0-9]{5}$/.test(pincode.trim());
const validateUtr = (utr) => /^[A-Za-z0-9]{8,}$/.test(utr.trim());

const validateOrderPayload = (payload) => {
  if (!payload || typeof payload !== 'object') {
    throw new Error('Order payload is required.');
  }

  if (!payload.customer || !payload.customer.name || !validateName(payload.customer.name)) {
    throw new Error('Please provide a valid customer name.');
  }

  if (!payload.customer.mobile || !validateMobile(payload.customer.mobile)) {
    throw new Error('Please provide a valid 10-digit Indian mobile number.');
  }

  if (payload.customer.email && !validateEmail(payload.customer.email)) {
    throw new Error('Please provide a valid email address.');
  }

  if (!payload.address || !payload.address.houseNumber || !payload.address.street || !payload.address.area || !payload.address.city || !payload.address.state || !payload.address.pincode) {
    throw new Error('Please complete all delivery address fields.');
  }

  if (!validatePincode(payload.address.pincode)) {
    throw new Error('Please provide a valid 6-digit Indian pincode.');
  }

  if (!Array.isArray(payload.items) || payload.items.length === 0) {
    throw new Error('Your cart must contain at least one item.');
  }

  const productCatalog = readProducts();
  const productIds = new Set(productCatalog.map((product) => String(product.id)));

  for (const item of payload.items) {
    if (!item.productId || !productIds.has(String(item.productId))) {
      throw new Error(`Invalid product selected: ${item.productId || 'unknown'}`);
    }

    if (!item.quantity || item.quantity < 1 || !Number.isInteger(item.quantity)) {
      throw new Error('Each product quantity must be a positive whole number.');
    }

    const product = productCatalog.find((entry) => String(entry.id) === String(item.productId));
    if (!product) {
      throw new Error(`Product not found: ${item.productId}`);
    }

    if (Number(item.quantity) > Number(product.stock)) {
      throw new Error(`Only ${product.stock} units available for ${product.name}.`);
    }
  }

  const paymentMethod = payload.payment?.method || 'UPI / GPay';
  if (!['UPI / GPay', 'Cash on Delivery'].includes(paymentMethod)) {
    throw new Error('Invalid payment method selected.');
  }

  if (payload.payment?.utrNumber && !validateUtr(payload.payment.utrNumber)) {
    throw new Error('Please provide a valid UTR / transaction reference.');
  }

  if (paymentMethod === 'UPI / GPay' && !payload.payment?.paymentScreenshot) {
    throw new Error('A payment screenshot is required for UPI verification.');
  }

  if (payload.payment?.paymentScreenshot && typeof payload.payment.paymentScreenshot !== 'string') {
    throw new Error('Payment screenshot must be provided as an image upload.');
  }

  return paymentMethod;
};

const calculateOrderTotals = (items) => {
  const productCatalog = readProducts();
  const subtotal = items.reduce((sum, item) => {
    const product = productCatalog.find((entry) => String(entry.id) === String(item.productId));
    if (!product) {
      throw new Error(`Product not found for item ${item.productId}`);
    }

    return sum + getProductPrice(product) * item.quantity;
  }, 0);

  return {
    subtotal,
    deliveryCharge: DELIVERY_CHARGE,
    totalAmount: subtotal + DELIVERY_CHARGE
  };
};

const duplicateUtrExists = (orders, orderId, utrNumber) => {
  if (!utrNumber) {
    return false;
  }

  const normalizedInput = utrNumber.trim().toLowerCase();

  return orders.some((order) => {
    const normalizedOrder = normalizeOrder(order);
    if (normalizedOrder.orderId === orderId) {
      return false;
    }

    return (normalizedOrder.payment?.utrNumber || '').trim().toLowerCase() === normalizedInput;
  });
};

const buildProductPayload = (payload) => {
  const trimmedName = String(payload.name || '').trim();
  const trimmedCategory = String(payload.category || '').trim();
  const trimmedDescription = String(payload.description || '').trim();
  const trimmedSku = String(payload.sku || '').trim();

  if (!trimmedName) {
    throw new Error('Product name is required.');
  }

  if (!trimmedCategory) {
    throw new Error('Product category is required.');
  }

  if (!trimmedDescription) {
    throw new Error('Product description is required.');
  }

  if (payload.price === undefined || payload.price === null || payload.price === '') {
    throw new Error('Product price is required.');
  }

  if (Number(payload.price) < 0) {
    throw new Error('Product price cannot be negative.');
  }

  if (payload.discountPrice !== undefined && payload.discountPrice !== null && payload.discountPrice !== '') {
    if (Number(payload.discountPrice) < 0 || Number(payload.discountPrice) > Number(payload.price)) {
      throw new Error('Discount price must be between 0 and the regular price.');
    }
  }

  if (payload.stock === undefined || payload.stock === null || payload.stock === '') {
    throw new Error('Stock quantity is required.');
  }

  if (!Number.isInteger(Number(payload.stock)) || Number(payload.stock) < 0) {
    throw new Error('Stock quantity must be a valid whole number.');
  }

  if (!trimmedSku) {
    throw new Error('Product code/SKU is required.');
  }

  const now = new Date().toISOString();

  return {
    id: payload.id || createProductId(),
    name: trimmedName,
    category: trimmedCategory,
    description: trimmedDescription,
    price: Number(payload.price),
    discountPrice: payload.discountPrice !== undefined && payload.discountPrice !== null && payload.discountPrice !== '' ? Number(payload.discountPrice) : null,
    stock: Number(payload.stock),
    sku: trimmedSku,
    images: saveImages(Array.isArray(payload.images) ? payload.images : []),
    sizes: Array.isArray(payload.sizes) ? payload.sizes.map((item) => String(item).trim()).filter(Boolean) : [],
    colors: Array.isArray(payload.colors) ? payload.colors.map((item) => String(item).trim()).filter(Boolean) : [],
    details: payload.details && typeof payload.details === 'object' ? payload.details : {},
    createdAt: payload.createdAt || now,
    updatedAt: now
  };
};

app.get('/api/products', (req, res) => {
  try {
    const products = readProducts().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Unable to fetch products.' });
  }
});

app.get('/api/products/:id', (req, res) => {
  try {
    const products = readProducts();
    const product = products.find((entry) => String(entry.id) === String(req.params.id));

    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    return res.json(product);
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Unable to fetch product.' });
  }
});

app.get('/api/products/category/:category', (req, res) => {
  try {
    const category = decodeURIComponent(req.params.category);
    const products = readProducts().filter((product) => product.category === category);
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Unable to fetch products for category.' });
  }
});

app.get('/api/categories', (req, res) => {
  try {
    const categories = [...new Set([...DEFAULT_CATEGORIES, ...readProducts().map((product) => product.category)])].filter(Boolean);
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Unable to fetch categories.' });
  }
});

app.post('/api/users/register', (req, res) => {
  try {
    const { username, password, email, fullName, mobile } = req.body || {};

    if (!username || !String(username).trim()) {
      return res.status(400).json({ message: 'Username is required.' });
    }

    if (!password || String(password).length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
    }

    if (!email || !validateEmail(email)) {
      return res.status(400).json({ message: 'Please provide a valid email address.' });
    }

    if (!mobile || !validateMobile(mobile)) {
      return res.status(400).json({ message: 'Please provide a valid 10-digit mobile number.' });
    }

    const users = readUsers();
    const existingUser = users.find((entry) => String(entry.username || '').trim().toLowerCase() === String(username).trim().toLowerCase());

    if (existingUser) {
      return res.status(409).json({ message: 'This username is already registered.' });
    }

    const nextUser = normalizeUser({
      username,
      password,
      email,
      fullName,
      mobile,
      createdAt: new Date().toISOString()
    });

    users.push(nextUser);
    writeUsers(users);

    const token = issueUserToken(nextUser);
    return res.status(201).json({
      token,
      user: {
        id: nextUser.id,
        username: nextUser.username,
        email: nextUser.email,
        fullName: nextUser.fullName,
        mobile: nextUser.mobile
      },
      message: 'Registration successful.'
    });
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Unable to register user.' });
  }
});

app.post('/api/users/login', (req, res) => {
  try {
    const { username, password } = req.body || {};

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required.' });
    }

    const users = readUsers();
    const matchedUser = users.find((entry) => String(entry.username || '').trim().toLowerCase() === String(username).trim().toLowerCase());

    if (!matchedUser) {
      return res.status(401).json({ message: 'Invalid username or password.' });
    }

    const hashedInput = hashPassword(password);
    if (matchedUser.passwordHash !== hashedInput) {
      return res.status(401).json({ message: 'Invalid username or password.' });
    }

    const token = issueUserToken(matchedUser);
    return res.json({
      token,
      user: {
        id: matchedUser.id,
        username: matchedUser.username,
        email: matchedUser.email,
        fullName: matchedUser.fullName,
        mobile: matchedUser.mobile
      },
      message: 'Login successful.'
    });
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Unable to login.' });
  }
});

app.post('/api/admin/login', (req, res) => {
  try {
    const { username, password } = req.body || {};

    if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
      return res.status(401).json({ message: 'Invalid admin credentials.' });
    }

    const token = crypto.randomBytes(24).toString('hex');
    ADMIN_TOKEN_STORAGE.set(token, {
      issuedAt: Date.now(),
      expiresAt: Date.now() + AUTH_TOKEN_TTL_MS
    });

    return res.json({ token, message: 'Admin authenticated successfully.' });
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Unable to authenticate admin.' });
  }
});

app.post('/api/admin/products', requireAdmin, (req, res) => {
  try {
    const payload = req.body || {};
    const nextProduct = buildProductPayload(payload);
    const products = readProducts();

    products.unshift(nextProduct);
    writeProducts(products);

    return res.status(201).json(nextProduct);
  } catch (error) {
    return res.status(400).json({ message: error.message || 'Unable to save product.' });
  }
});

app.put('/api/admin/products/:id', requireAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const payload = req.body || {};
    const products = readProducts();
    const index = products.findIndex((product) => String(product.id) === String(id));

    if (index === -1) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    const existingProduct = products[index];
    const updatedProduct = buildProductPayload({
      ...existingProduct,
      ...payload,
      id: existingProduct.id,
      createdAt: existingProduct.createdAt,
      images: Array.isArray(payload.images) ? payload.images : existingProduct.images
    });

    products[index] = updatedProduct;
    writeProducts(products);

    return res.json(updatedProduct);
  } catch (error) {
    return res.status(400).json({ message: error.message || 'Unable to update product.' });
  }
});

app.delete('/api/admin/products/:id', requireAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const products = readProducts();
    const index = products.findIndex((product) => String(product.id) === String(id));

    if (index === -1) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    const [removedProduct] = products.splice(index, 1);

    if (removedProduct) {
      (removedProduct.images || []).forEach((imagePath) => deleteImageFile(imagePath));
    }

    writeProducts(products);

    return res.json({ message: 'Product deleted successfully.' });
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Unable to delete product.' });
  }
});

app.post('/api/admin/products/:id/images', requireAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const { images } = req.body || {};
    const products = readProducts();
    const index = products.findIndex((product) => String(product.id) === String(id));

    if (index === -1) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    const nextImages = saveImages(Array.isArray(images) ? images : []);
    products[index].images = [...(products[index].images || []), ...nextImages];
    products[index].image = products[index].images[0] || '';
    products[index].updatedAt = new Date().toISOString();

    writeProducts(products);

    return res.json(products[index]);
  } catch (error) {
    return res.status(400).json({ message: error.message || 'Unable to upload product images.' });
  }
});

app.delete('/api/admin/products/:id/images/:imageId', requireAdmin, (req, res) => {
  try {
    const { id, imageId } = req.params;
    const products = readProducts();
    const index = products.findIndex((product) => String(product.id) === String(id));

    if (index === -1) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    const imageIndex = products[index].images.findIndex((image) => image.includes(imageId));

    if (imageIndex === -1) {
      return res.status(404).json({ message: 'Image not found.' });
    }

    const [removedImage] = products[index].images.splice(imageIndex, 1);
    deleteImageFile(removedImage);
    products[index].image = products[index].images[0] || '';
    products[index].updatedAt = new Date().toISOString();
    writeProducts(products);

    return res.json(products[index]);
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Unable to delete product image.' });
  }
});

app.get('/api/admin/orders', requireAdmin, (req, res) => {
  const orders = readOrders().map((order) => normalizeOrder(order));
  res.json(orders);
});

app.get('/api/orders', requireAdmin, (req, res) => {
  const orders = readOrders().map((order) => normalizeOrder(order));
  res.json(orders);
});

app.get('/api/orders/my-orders', requireUser, (req, res) => {
  const orders = readOrders()
    .map((order) => normalizeOrder(order))
    .filter((order) => order.customer.mobile === req.user.mobile)
    .map((order) => ({
      ...order,
      payment: { ...order.payment, utrNumber: '', paymentScreenshot: '' }
    }));
  res.json(orders);
});

app.get('/api/orders/lookup', (req, res) => {
  const mobile = String(req.query.mobile || '').trim();
  const orderId = String(req.query.orderId || '').trim();
  if (!mobile || !orderId) {
    return res.status(400).json({ message: 'Mobile number and order ID are both required.' });
  }

  const found = readOrders()
    .map((order) => normalizeOrder(order))
    .find((order) => order.customer.mobile === mobile && order.orderId.toLowerCase() === orderId.toLowerCase());

  if (!found) {
    return res.status(404).json({ message: 'No matching order found.' });
  }

  return res.json({
    ...found,
    payment: { ...found.payment, utrNumber: '', paymentScreenshot: '' }
  });
});

app.get('/api/orders/status-updates', requireUser, (req, res) => {
  const mobile = req.user.mobile;

  const updates = readOrders()
    .map((order) => normalizeOrder(order))
    .filter((order) => order.customer.mobile === mobile)
    .map((order) => ({
      orderId: order.orderId,
      orderStatus: order.orderStatus,
      trackingLink: order.trackingLink,
      payment: {
        status: order.payment.status,
        rejectionReason: order.payment.rejectionReason
      }
    }));

  res.json(updates);
});

app.get('/api/orders/:orderId', requireAdmin, (req, res) => {
  const orders = readOrders();
  const found = orders.find((order) => normalizeOrder(order).orderId === req.params.orderId);

  if (!found) {
    return res.status(404).json({ message: 'Order not found.' });
  }

  res.json(normalizeOrder(found));
});

app.post('/api/orders', (req, res) => {
  try {
    const payload = req.body || {};
    const paymentMethod = validateOrderPayload(payload);

    const totals = calculateOrderTotals(payload.items);
    const productCatalog = readProducts();
    const normalizedItems = payload.items.map((item) => {
      const product = productCatalog.find((entry) => String(entry.id) === String(item.productId));
      return {
        productId: String(item.productId),
        name: product?.name || item.name,
        quantity: item.quantity,
        price: getProductPrice(product),
        selectedSize: item.selectedSize || '',
        selectedColor: item.selectedColor || ''
      };
    });

    const existingOrders = readOrders();

    if (payload.payment?.utrNumber && duplicateUtrExists(existingOrders, '', payload.payment.utrNumber)) {
      return res.status(409).json({ message: 'This UTR number has already been used for another order.' });
    }

    const orderRecord = {
      orderId: `DS-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
      customer: {
        name: payload.customer.name.trim(),
        mobile: payload.customer.mobile.trim(),
        email: (payload.customer.email || '').trim()
      },
      address: {
        houseNumber: payload.address.houseNumber.trim(),
        street: payload.address.street.trim(),
        area: payload.address.area.trim(),
        city: payload.address.city.trim(),
        state: payload.address.state.trim(),
        pincode: payload.address.pincode.trim()
      },
      items: normalizedItems,
      subtotal: totals.subtotal,
      deliveryCharge: totals.deliveryCharge,
      totalAmount: totals.totalAmount,
      payment: {
        method: paymentMethod,
        upiId: paymentMethod === 'Cash on Delivery' ? '' : DUMMY_UPI_ID,
        utrNumber: payload.payment?.utrNumber || '',
        paymentScreenshot: payload.payment?.paymentScreenshot || '',
        status: paymentMethod === 'Cash on Delivery' ? 'Cash on Delivery' : 'Verification Pending',
        rejectionReason: ''
      },
      orderStatus: paymentMethod === 'Cash on Delivery' ? 'Order Received' : 'Payment Verification Pending',
      trackingLink: '',
      createdAt: new Date().toISOString()
    };

    existingOrders.push(orderRecord);
    writeOrders(existingOrders);

    const productCatalogLatest = readProducts();
    for (const item of normalizedItems) {
      const product = productCatalogLatest.find((entry) => String(entry.id) === String(item.productId));
      if (product) {
        product.stock = Math.max(0, product.stock - item.quantity);
        product.updatedAt = new Date().toISOString();
      }
    }

    writeProducts(productCatalogLatest);

    const emailStatus = sendOrderConfirmationEmail(orderRecord);
    res.status(201).json({ ...normalizeOrder(orderRecord), emailStatus });
  } catch (error) {
    res.status(400).json({ message: error.message || 'Unable to create order.' });
  }
});

app.post('/api/orders/:orderId/payment-proof', requireUser, (req, res) => {
  const { orderId } = req.params;
  const { utrNumber, paymentScreenshot } = req.body || {};

  try {
    if (utrNumber && !validateUtr(utrNumber)) {
      throw new Error('Please provide a valid UTR / transaction reference if supplied.');
    }

    if (!paymentScreenshot || typeof paymentScreenshot !== 'string') {
      throw new Error('A payment screenshot is required for UPI verification.');
    }

    const orders = readOrders();
    const orderIndex = orders.findIndex((order) => normalizeOrder(order).orderId === orderId);

    if (orderIndex === -1) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    if (normalizeOrder(orders[orderIndex]).customer.mobile !== req.user.mobile) {
      return res.status(403).json({ message: 'You can only update payment proof for your own orders.' });
    }

    if (utrNumber && duplicateUtrExists(orders, orderId, utrNumber)) {
      return res.status(409).json({ message: 'This UTR number has already been used for another order.' });
    }

    const order = normalizeOrder(orders[orderIndex]);
    order.payment.utrNumber = utrNumber ? utrNumber.trim() : '';
    order.payment.paymentScreenshot = paymentScreenshot;
    order.payment.status = 'Verification Pending';
    order.orderStatus = 'Payment Verification Pending';

    orders[orderIndex] = order;
    writeOrders(orders);

    res.json(order);
  } catch (error) {
    res.status(400).json({ message: error.message || 'Unable to update payment proof.' });
  }
});

app.patch('/api/orders/:orderId/verify-payment', requireAdmin, (req, res) => {
  const orders = readOrders();
  const orderIndex = orders.findIndex((order) => normalizeOrder(order).orderId === req.params.orderId);

  if (orderIndex === -1) {
    return res.status(404).json({ message: 'Order not found.' });
  }

  const order = normalizeOrder(orders[orderIndex]);
  order.payment.status = 'Paid / Verified';
  order.orderStatus = 'Confirmed';
  orders[orderIndex] = order;
  writeOrders(orders);

  res.json(order);
});

app.patch('/api/orders/:orderId/reject-payment', requireAdmin, (req, res) => {
  const { rejectionReason = '' } = req.body || {};
  const orders = readOrders();
  const orderIndex = orders.findIndex((order) => normalizeOrder(order).orderId === req.params.orderId);

  if (orderIndex === -1) {
    return res.status(404).json({ message: 'Order not found.' });
  }

  const order = normalizeOrder(orders[orderIndex]);
  order.payment.status = 'Payment Rejected';
  order.payment.rejectionReason = rejectionReason;
  order.orderStatus = 'Payment Failed';
  orders[orderIndex] = order;
  writeOrders(orders);

  res.json(order);
});

app.patch('/api/orders/:orderId', requireAdmin, (req, res) => {
  const { orderId } = req.params;
  const { status, trackingLink } = req.body || {};
  const orders = readOrders();
  const index = orders.findIndex((order) => normalizeOrder(order).orderId === orderId);

  if (index === -1) {
    return res.status(404).json({ message: 'Order not found' });
  }

  const previousOrder = normalizeOrder(orders[index]);
  const order = normalizeOrder(orders[index]);

  if (status) {
    order.orderStatus = status;
  }

  if (trackingLink !== undefined) {
    order.trackingLink = typeof trackingLink === 'string' ? trackingLink.trim() : '';
  }

  const shouldSendTrackingEmail = ['Shipped', 'Delivered'].includes(order.orderStatus) && Boolean(order.trackingLink);
  orders[index] = order;
  writeOrders(orders);

  if (shouldSendTrackingEmail) {
    sendTrackingUpdateEmail(order);
  }

  res.json(order);
});

ensureDataFiles();

app.listen(PORT, () => {
  console.log(`Dress Selection backend running on http://localhost:${PORT}`);
});
