require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const http = require('http');
const socketIO = require('socket.io');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');

const { getPool } = require('./config/database');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const productRoutes = require('./routes/product');
const cartRoutes = require('./routes/cart');
const orderRoutes = require('./routes/order');
const sellerRoutes = require('./routes/seller');
const adminRoutes = require('./routes/admin');
const adminUsersRoutes = require('./routes/admin-users');
const membershipRoutes = require('./routes/membership');
const chatRoutes = require('./routes/chat');
const notificationRoutes = require('./routes/notification');
const favoritesRoutes = require('./routes/favorites');
const reviewRoutes = require('./routes/review');
const disputeRoutes = require('./routes/dispute');
const settlementRoutes = require('./routes/settlement');

const app = express();
const server = http.createServer(app);

const io = socketIO(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Lưu io instance để dùng trong các route
app.set('io', io);

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: false
}));
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Static files – phục vụ ảnh upload (PHẢI trước Content-Type middleware)
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// Đảm bảo response API luôn UTF-8
app.use('/api', (req, res, next) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  next();
});

// Fix encoding cho dữ liệu từ SQL Server (mssql v9 bug với Vietnamese)
const fixEncoding = (obj) => {
  if (typeof obj === 'string') {
    try {
      // Thử decode lại nếu bị lỗi Latin-1 → UTF-8
      const bytes = Buffer.from(obj, 'latin1');
      const decoded = bytes.toString('utf8');
      // Chỉ dùng decoded nếu có ký tự tiếng Việt hợp lệ
      if (/[àáâãèéêìíòóôõùúýăđơưạảấầẩẫậắằẳẵặẹẻẽếềểễệỉịọỏốồổỗộớờởỡợụủứừửữựỳỵỷỹ]/i.test(decoded)) {
        return decoded;
      }
    } catch {}
    return obj;
  }
  if (Array.isArray(obj)) return obj.map(fixEncoding);
  if (obj && typeof obj === 'object') {
    const fixed = {};
    for (const key of Object.keys(obj)) fixed[key] = fixEncoding(obj[key]);
    return fixed;
  }
  return obj;
};

app.use((req, res, next) => {
  const originalJson = res.json.bind(res);
  res.json = (data) => originalJson(fixEncoding(data));
  next();
});

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customSiteTitle: 'MartHub API Docs',
  customCss: '.swagger-ui .topbar { background-color: #dc2626; }',
  swaggerOptions: { persistAuthorization: true }
}));

// Root route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'E-commerce API Server',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      docs: '/api-docs',
      api: '/api'
    }
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'API is running ✅', timestamp: new Date(), swagger: 'http://localhost:5000/api-docs' });
});

// Placeholder image cho sản phẩm không có ảnh
app.get('/placeholder.svg', (req, res) => {
  const color = req.query.color || '#dc2626';
  const text = req.query.text || '📦';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
    <rect width="400" height="400" fill="${color}" opacity="0.1"/>
    <text x="200" y="200" text-anchor="middle" dominant-baseline="central" font-size="80">${text}</text>
    <text x="200" y="320" text-anchor="middle" fill="#999" font-size="16" font-family="sans-serif">No Image</text>
  </svg>`;
  res.setHeader('Content-Type', 'image/svg+xml');
  res.setHeader('Cache-Control', 'public, max-age=86400');
  res.send(svg);
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/sellers', sellerRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin/users', adminUsersRoutes);
app.use('/api/membership', membershipRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/favorites', favoritesRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/disputes', disputeRoutes);
app.use('/api/settlements', settlementRoutes);

// ─── Socket.IO – Real-time Chat & Notifications ─────────────────────────────
const connectedUsers = new Map(); // userId → socketId

io.on('connection', (socket) => {
  console.log('🔌 Socket connected:', socket.id);

  // User join với userId để nhận thông báo cá nhân
  socket.on('authenticate', (userId) => {
    connectedUsers.set(parseInt(userId), socket.id);
    socket.userId = parseInt(userId);
    console.log(`👤 User ${userId} authenticated via socket`);
  });

  // Tham gia phòng chat
  socket.on('join_chat', (data) => {
    socket.join(`chat_${data.roomId}`);
    console.log(`💬 Socket joined chat room: ${data.roomId}`);
  });

  // Gửi tin nhắn real-time
  socket.on('send_message', (data) => {
    io.to(`chat_${data.roomId}`).emit('receive_message', {
      ...data,
      timestamp: new Date()
    });
  });

  // Đang nhập
  socket.on('typing', (data) => {
    socket.to(`chat_${data.roomId}`).emit('user_typing', {
      roomId: data.roomId,
      isTyping: data.isTyping
    });
  });

  socket.on('disconnect', () => {
    if (socket.userId) {
      connectedUsers.delete(socket.userId);
    }
    console.log('🔌 Socket disconnected:', socket.id);
  });
});

// Helper gửi thông báo realtime – export để dùng ở routes
app.locals.sendNotification = (userId, notification) => {
  const socketId = connectedUsers.get(parseInt(userId));
  if (socketId) {
    io.to(socketId).emit('notification', notification);
  }
};

// ─── Error Handling ──────────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('❌ Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.path} not found`
  });
});

// ─── Start Server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await getPool();
    console.log('✅ Database connected successfully');

    server.listen(PORT, () => {
      console.log(`\n🚀 Server running on http://localhost:${PORT}`);
      console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`   Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
      console.log(`   Swagger docs: http://localhost:${PORT}/api-docs\n`);
    });
  } catch (error) {
    console.error('❌ Failed to connect to database:', error.message);
    console.warn('⚠️  Starting server WITHOUT database (limited functionality)');
    server.listen(PORT, () => {
      console.log(`\n🚀 Server running on http://localhost:${PORT} (NO DB)`);
    });
  }
}


startServer();

module.exports = { app, io };
