const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3001;

// Middlewares
app.use(cors());
app.use(express.json());

// ==========================================
// UPLOADS DIRECTORY SETUP
// ==========================================
const uploadsDir = path.join(__dirname, 'uploads');
const dirsToCreate = [
  uploadsDir,
  path.join(uploadsDir, 'products'),
  path.join(uploadsDir, 'employees')
];

dirsToCreate.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Serve static files from uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ==========================================
// MULTER CONFIGURATION
// ==========================================
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let dest = path.join(uploadsDir, 'misc');
    if (req.originalUrl.includes('/products') || req.originalUrl.includes('product')) dest = path.join(uploadsDir, 'products');
    if (req.originalUrl.includes('/employees') || req.originalUrl.includes('employee')) dest = path.join(uploadsDir, 'employees');
    
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    cb(null, dest);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  }
});
const upload = multer({ storage: storage });

// ==========================================
// DATABASE SETUP (SQLite)
// ==========================================
const db = new sqlite3.Database(path.join(__dirname, 'database.sqlite'), (err) => {
  if (err) {
    console.error('Error connecting to SQLite:', err.message);
  } else {
    console.log('Connected to the SQLite database.');
    initializeDatabase();
  }
});

function initializeDatabase() {
  db.serialize(() => {
    
    // Tables will only be created if they do not exist.

    // 1. PRODUCTS
    db.run(`CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      company_id INTEGER NOT NULL DEFAULT 1,
      name TEXT NOT NULL,
      code TEXT,
      buy_price INTEGER NOT NULL DEFAULT 0,
      sell_price INTEGER NOT NULL DEFAULT 0,
      stock_qty INTEGER NOT NULL DEFAULT 0,
      min_qty INTEGER NOT NULL DEFAULT 0,
      category TEXT,
      image_url TEXT
    )`);

    // 2. CUSTOMERS
    db.run(`CREATE TABLE IF NOT EXISTS customers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      company_id INTEGER NOT NULL DEFAULT 1,
      name TEXT NOT NULL,
      phone TEXT,
      document TEXT,
      address TEXT,
      balance INTEGER NOT NULL DEFAULT 0
    )`);

    // 3. SUPPLIERS
    db.run(`CREATE TABLE IF NOT EXISTS suppliers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      company_id INTEGER NOT NULL DEFAULT 1,
      name TEXT NOT NULL,
      phone TEXT,
      document_type TEXT,
      document TEXT
    )`);

    // 4. EMPLOYEES
    db.run(`CREATE TABLE IF NOT EXISTS employees (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      company_id INTEGER NOT NULL DEFAULT 1,
      name TEXT NOT NULL,
      phone TEXT,
      document TEXT,
      role TEXT,
      dpi_image_url TEXT
    )`);

    // 5. SALES
    db.run(`CREATE TABLE IF NOT EXISTS sales (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      company_id INTEGER NOT NULL DEFAULT 1,
      customer_id INTEGER,
      employee_id INTEGER,
      total_amount INTEGER NOT NULL DEFAULT 0,
      payment_method TEXT,
      date DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (customer_id) REFERENCES customers(id),
      FOREIGN KEY (employee_id) REFERENCES employees(id)
    )`);

    // 6. SALE ITEMS
    db.run(`CREATE TABLE IF NOT EXISTS sale_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sale_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      quantity INTEGER NOT NULL,
      unit_price INTEGER NOT NULL,
      FOREIGN KEY (sale_id) REFERENCES sales(id),
      FOREIGN KEY (product_id) REFERENCES products(id)
    )`);

    // 7. EXPENSES
    db.run(`CREATE TABLE IF NOT EXISTS expenses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      company_id INTEGER NOT NULL DEFAULT 1,
      supplier_id INTEGER,
      category TEXT,
      amount INTEGER NOT NULL DEFAULT 0,
      concept TEXT,
      date DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (supplier_id) REFERENCES suppliers(id)
    )`);

    // 8. USERS (LOGIN)
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      company_id INTEGER NOT NULL DEFAULT 1,
      employee_id INTEGER,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'Empleado',
      FOREIGN KEY (employee_id) REFERENCES employees(id)
    )`, () => {
      // Create default admin user if none exists
      db.get('SELECT * FROM users WHERE username = ?', ['Danielch'], (err, row) => {
        if (!err && !row) {
          db.run(`INSERT INTO users (company_id, username, password, role) VALUES (?, ?, ?, ?)`, [1, 'Danielch', '123', 'Propietario']);
        }
      });
    });

    // 8. QUOTES
    db.run(`CREATE TABLE IF NOT EXISTS quotes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      company_id INTEGER NOT NULL DEFAULT 1,
      customer_name TEXT,
      total_amount INTEGER NOT NULL DEFAULT 0,
      date DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // 9. QUOTE ITEMS
    db.run(`CREATE TABLE IF NOT EXISTS quote_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      quote_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      quantity INTEGER NOT NULL,
      unit_price INTEGER NOT NULL,
      FOREIGN KEY (quote_id) REFERENCES quotes(id),
      FOREIGN KEY (product_id) REFERENCES products(id)
    )`);

    console.log('Database tables successfully initialized with company_id.');
  });
}

// ==========================================
// API ENDPOINTS
// ==========================================

const dbAll = (query, params = []) => new Promise((resolve, reject) => {
  db.all(query, params, (err, rows) => {
    if (err) reject(err); else resolve(rows);
  });
});

const dbRun = (query, params = []) => new Promise((resolve, reject) => {
  db.run(query, params, function (err) {
    if (err) reject(err); else resolve(this);
  });
});

// --- INVENTORY (PRODUCTS) ---
app.get('/api/inventory', async (req, res) => {
  try {
    const company_id = req.query.company_id || 1;
    const products = await dbAll('SELECT * FROM products WHERE company_id = ?', [company_id]);
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/inventory', upload.single('image'), async (req, res) => {
  try {
    const { company_id, name, code, buy_price, sell_price, stock_qty, min_qty, category } = req.body;
    const cid = company_id || 1;
    const imageUrl = req.file ? `/uploads/products/${req.file.filename}` : null;
    
    const result = await dbRun(
      `INSERT INTO products (company_id, name, code, buy_price, sell_price, stock_qty, min_qty, category, image_url) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [cid, name, code, parseInt(buy_price) || 0, parseInt(sell_price) || 0, parseInt(stock_qty) || 0, parseInt(min_qty) || 0, category, imageUrl]
    );
    res.json({ id: result.lastID, message: 'Producto creado exitosamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/inventory/:id', upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    const { company_id, name, code, buy_price, sell_price, stock_qty, min_qty, category } = req.body;
    const cid = company_id || 1;
    const imageUrl = req.file ? `/uploads/products/${req.file.filename}` : null;
    
    let query = `UPDATE products SET name = ?, code = ?, buy_price = ?, sell_price = ?, stock_qty = ?, min_qty = ?, category = ?`;
    let params = [name, code, parseInt(buy_price) || 0, parseInt(sell_price) || 0, parseInt(stock_qty) || 0, parseInt(min_qty) || 0, category];
    
    if (imageUrl) {
      query += `, image_url = ?`;
      params.push(imageUrl);
    }
    
    query += ` WHERE id = ? AND company_id = ?`;
    params.push(id, cid);
    
    const result = await dbRun(query, params);
    res.json({ id, message: 'Producto actualizado exitosamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- EMPLOYEES ---
app.get('/api/employees', async (req, res) => {
  try {
    const company_id = req.query.company_id || 1;
    const employees = await dbAll('SELECT * FROM employees WHERE company_id = ?', [company_id]);
    res.json(employees);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/employees', upload.single('dpi_image'), async (req, res) => {
  try {
    const { company_id, name, phone, document, role, username, password } = req.body;
    const cid = company_id || 1;
    const dpiImageUrl = req.file ? `/uploads/employees/${req.file.filename}` : null;
    
    await dbRun('BEGIN TRANSACTION');
    
    const result = await dbRun(
      `INSERT INTO employees (company_id, name, phone, document, role, dpi_image_url) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [cid, name, phone, document, role, dpiImageUrl]
    );
    
    const employeeId = result.lastID;
    
    if (username && password) {
      await dbRun(
        `INSERT INTO users (company_id, employee_id, username, password, role) VALUES (?, ?, ?, ?, ?)`,
        [cid, employeeId, username, password, role || 'Empleado']
      );
    }
    
    await dbRun('COMMIT');
    res.json({ id: employeeId, message: 'Empleado creado exitosamente' });
  } catch (error) {
    try { await dbRun('ROLLBACK'); } catch(e) {}
    res.status(500).json({ error: error.message });
  }
});

// --- CUSTOMERS ---
app.get('/api/customers', async (req, res) => {
  try {
    const company_id = req.query.company_id || 1;
    const customers = await dbAll('SELECT * FROM customers WHERE company_id = ?', [company_id]);
    res.json(customers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/customers', async (req, res) => {
  try {
    const { company_id, name, phone, document, address, balance } = req.body;
    const cid = company_id || 1;
    const result = await dbRun(
      `INSERT INTO customers (company_id, name, phone, document, address, balance) VALUES (?, ?, ?, ?, ?, ?)`,
      [cid, name, phone, document, address, parseInt(balance) || 0]
    );
    res.json({ id: result.lastID, message: 'Cliente creado exitosamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- SUPPLIERS ---
app.get('/api/suppliers', async (req, res) => {
  try {
    const company_id = req.query.company_id || 1;
    const suppliers = await dbAll('SELECT * FROM suppliers WHERE company_id = ?', [company_id]);
    res.json(suppliers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/suppliers', async (req, res) => {
  try {
    const { company_id, name, phone, document_type, document } = req.body;
    const cid = company_id || 1;
    const result = await dbRun(
      `INSERT INTO suppliers (company_id, name, phone, document_type, document) VALUES (?, ?, ?, ?, ?)`,
      [cid, name, phone, document_type, document]
    );
    res.json({ id: result.lastID, message: 'Proveedor creado exitosamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- EXPENSES ---
app.get('/api/expenses', async (req, res) => {
  try {
    const company_id = req.query.company_id || 1;
    const expenses = await dbAll(`
      SELECT e.*, s.name as supplier_name 
      FROM expenses e 
      LEFT JOIN suppliers s ON e.supplier_id = s.id
      WHERE e.company_id = ?
      ORDER BY e.date DESC
    `, [company_id]);
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/expenses', async (req, res) => {
  try {
    const { company_id, supplier_id, category, amount, concept, date } = req.body;
    const cid = company_id || 1;
    const result = await dbRun(
      `INSERT INTO expenses (company_id, supplier_id, category, amount, concept, date) VALUES (?, ?, ?, ?, ?, ?)`,
      [cid, supplier_id, category, parseInt(amount) || 0, concept, date || new Date().toISOString()]
    );
    res.json({ id: result.lastID, message: 'Gasto registrado exitosamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- SALES (Basic Implementation) ---
app.post('/api/sales', async (req, res) => {
  const { company_id, customer_id, employee_id, total_amount, payment_method, items } = req.body;
  const cid = company_id || 1;
  
  try {
    await dbRun('BEGIN TRANSACTION');
    
    const saleResult = await dbRun(
      `INSERT INTO sales (company_id, customer_id, employee_id, total_amount, payment_method) VALUES (?, ?, ?, ?, ?)`,
      [cid, customer_id, employee_id, parseInt(total_amount) || 0, payment_method]
    );
    const saleId = saleResult.lastID;

    if (items && items.length > 0) {
      for (const item of items) {
        await dbRun(
          `INSERT INTO sale_items (sale_id, product_id, quantity, unit_price) VALUES (?, ?, ?, ?)`,
          [saleId, item.product_id, parseInt(item.quantity) || 0, parseInt(item.unit_price) || 0]
        );

        await dbRun(
          `UPDATE products SET stock_qty = stock_qty - ? WHERE id = ? AND company_id = ?`,
          [parseInt(item.quantity) || 0, item.product_id, cid]
        );
      }
    }

    await dbRun('COMMIT');
    res.json({ id: saleId, message: 'Venta registrada exitosamente' });
  } catch (error) {
    try { await dbRun('ROLLBACK'); } catch(e) {}
    console.error("Sale POST Error:", error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/sales', async (req, res) => {
  try {
    const company_id = req.query.company_id || 1;
    const sales = await dbAll(`
      SELECT s.*, c.name as customer_name 
      FROM sales s 
      LEFT JOIN customers c ON s.customer_id = c.id
      WHERE s.company_id = ?
      ORDER BY s.date DESC
    `, [company_id]);
    res.json(sales);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- AUTH / LOGIN ---
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const users = await dbAll('SELECT * FROM users WHERE LOWER(username) = LOWER(?) AND password = ?', [username, password]);
    
    if (users && users.length > 0) {
      const user = users[0];
      res.json({ 
        success: true, 
        user: {
          id: user.id,
          username: user.username,
          role: user.role,
          company_id: user.company_id,
          employee_id: user.employee_id
        }
      });
    } else {
      res.status(401).json({ success: false, message: 'Usuario o contraseña incorrectos' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`Backend server is running on http://localhost:${PORT}`);
});
