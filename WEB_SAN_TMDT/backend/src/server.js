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
const invoiceRouter = require('./routes/invoice').router;
const shopRoutes = require('./routes/shop');

const app = express();
const server = http.createServer(app);

const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:3000,http://localhost:3001').split(',');

const io = socketIO(server, {
  cors: {
    origin: allowedOrigins,
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
  origin: function(origin, callback) {
    // Allow all origins for now during development
    callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Static files – phục vụ ảnh upload
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// Đảm bảo response API luôn UTF-8 (bỏ qua swagger)
app.use((req, res, next) => {
  if (!req.path.startsWith('/api-docs')) {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
  }
  next();
});

// Không cần fixEncoding nữa - data đã được lưu đúng UTF-8 trong DB

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
app.use('/api/invoices', invoiceRouter);
app.use('/api/shops', shopRoutes);

// ─── Socket.IO – Real-time Chat & Notifications ─────────────────────────────
const connectedUsers = new Map(); // userId → socketId
const userSockets = new Map(); // userId → Set<socketId> (hỗ trợ multi-tab)

io.on('connection', (socket) => {
  console.log('🔌 Socket connected:', socket.id);

  // User join với userId để nhận thông báo cá nhân
  socket.on('authenticate', (userId) => {
    const uid = parseInt(userId);
    connectedUsers.set(uid, socket.id);
    socket.userId = uid;
    socket.join(`user_${uid}`);
    socket.join('online_users');

    // Track multi-tab
    if (!userSockets.has(uid)) userSockets.set(uid, new Set());
    userSockets.get(uid).add(socket.id);

    // Broadcast online trạng thái
    socket.broadcast.emit('user_online', { userId: uid });
    console.log(`👤 User ${userId} authenticated via socket`);
  });

  // Tham gia phòng chat
  socket.on('join_chat', (data) => {
    socket.join(`chat_${data.roomId}`);
    console.log(`💬 Socket joined chat room: ${data.roomId}`);
  });

  // Rời phòng chat
  socket.on('leave_chat', (data) => {
    socket.leave(`chat_${data.roomId}`);
  });

  // Đánh dấu tin nhắn đã đọc
  socket.on('mark_seen', (data) => {
    const { roomId, userId } = data;
    io.to(`chat_${roomId}`).emit('messages_seen', {
      roomId,
      seenBy: userId,
      seenAt: new Date().toISOString()
    });
  });

  // Đang nhập
  socket.on('typing', (data) => {
    socket.to(`chat_${data.roomId}`).emit('user_typing', {
      roomId: data.roomId,
      userId: data.userId,
      isTyping: data.isTyping
    });
  });

  socket.on('disconnect', () => {
    if (socket.userId) {
      const uid = socket.userId;
      // Xóa khỏi multi-tab tracking
      if (userSockets.has(uid)) {
        userSockets.get(uid).delete(socket.id);
        if (userSockets.get(uid).size === 0) {
          userSockets.delete(uid);
          connectedUsers.delete(uid);
          // Chỉ broadcast offline khi không còn tab nào
          socket.broadcast.emit('user_offline', { userId: uid });
        }
      } else {
        connectedUsers.delete(uid);
        socket.broadcast.emit('user_offline', { userId: uid });
      }
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

// Helper kiểm tra online status
app.locals.isUserOnline = (userId) => {
  return connectedUsers.has(parseInt(userId));
};

// Helper lấy danh sách online users
app.locals.getOnlineUsers = () => {
  return Array.from(connectedUsers.keys());
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
