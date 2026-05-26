# Hướng dẫn Deployment

## Backend Deployment (Windows Server / Azure / AWS)

### Option 1: PM2 (Recommended for production)

```bash
npm install -g pm2

# Start app
pm2 start src/server.js --name "marthub-api"

# Auto restart on reboot
pm2 startup
pm2 save

# Monitor
pm2 monit
```

### Option 2: IIS (Windows)

1. Install Node.js Hosting Bundle
2. Create new site in IIS
3. Point to backend folder
4. Configure web.config

### Environment Variables
```
NODE_ENV=production
DB_SERVER=your-server-ip
DB_USER=your-user
DB_PASSWORD=your-password
PORT=5000
JWT_SECRET=your-secret-key
FRONTEND_URL=https://yourdomain.com
```

## Frontend Deployment (Vercel / Netlify / Azure)

### Vercel (Recommended)

```bash
npm install -g vercel
vercel login
vercel deploy
```

### Netlify

1. Push to GitHub
2. Connect repository to Netlify
3. Set build command: `npm run build`
4. Set publish directory: `build`

### Azure Static Web Apps

1. Create Static Web Apps resource
2. Connect GitHub repository
3. Configure build settings

## Database Migration

```bash
# Backup database
BACKUP DATABASE ThuongMaiDienTu 
TO DISK = 'C:\Backups\ThuongMaiDienTu.bak'

# Restore database
RESTORE DATABASE ThuongMaiDienTu 
FROM DISK = 'C:\Backups\ThuongMaiDienTu.bak'
```

## SSL Certificate Setup

```bash
# For production, use HTTPS
# Option 1: Let's Encrypt (Free)
npm install -g certbot

# Option 2: Azure AppService (Automatic)
# Option 3: Cloudflare (Free with proxy)
```

## Performance Optimization

### Backend
```javascript
// Enable compression
const compression = require('compression');
app.use(compression());

// Enable caching headers
app.use(express.static('public', { maxAge: '1d' }));

// Rate limiting
const rateLimit = require('express-rate-limit');
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));
```

### Frontend
```bash
# Build optimization
npm run build

# Result will be in /build folder
# Deploy to CDN for faster delivery
```

## Monitoring & Logging

```bash
# Backend logging
npm install winston
npm install morgan

# Uptime monitoring
# Use: uptime robot, pingdom, new relic
```

---

**Luôn kiểm tra các cài đặt security trước khi deploy to production!**
