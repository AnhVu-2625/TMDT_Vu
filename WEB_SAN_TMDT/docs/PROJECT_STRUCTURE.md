<!-- PROJECT STRUCTURE VISUALIZATION -->

# MartHub - Project Structure

```
WEB_SAN_TMDT/
│
├── 📂 backend/                          # Node.js + Express Backend
│   ├── 📂 src/
│   │   ├── 📂 config/
│   │   │   └── database.js              # SQL Server connection
│   │   ├── 📂 middleware/
│   │   │   └── auth.js                  # JWT validation
│   │   ├── 📂 routes/                   # API endpoints
│   │   │   ├── auth.js                  # Auth routes
│   │   │   ├── user.js                  # User profile
│   │   │   ├── product.js               # Product listing
│   │   │   ├── cart.js                  # Shopping cart
│   │   │   ├── order.js                 # Orders
│   │   │   ├── favorites.js             # Wishlist
│   │   │   ├── chat.js                  # Messaging
│   │   │   ├── seller.js                # Seller dashboard
│   │   │   ├── admin.js                 # Admin panel
│   │   │   └── notification.js          # Notifications
│   │   ├── 📂 utils/
│   │   │   └── validators.js            # Input validation
│   │   └── server.js                    # Entry point
│   ├── .env.example
│   ├── package.json
│   └── README.md
│
├── 📂 frontend/                         # React + Tailwind Frontend
│   ├── 📂 src/
│   │   ├── 📂 components/
│   │   │   ├── Header.jsx               # Navigation
│   │   │   ├── Footer.jsx               # Footer
│   │   │   ├── ProductCard.jsx          # Product card
│   │   │   └── ...
│   │   ├── 📂 pages/
│   │   │   ├── 📂 auth/
│   │   │   │   ├── Login.jsx
│   │   │   │   ├── Register.jsx
│   │   │   │   └── VerifyOTP.jsx
│   │   │   ├── 📂 user/
│   │   │   │   ├── Profile.jsx
│   │   │   │   ├── Cart.jsx
│   │   │   │   ├── Orders.jsx
│   │   │   │   ├── Checkout.jsx
│   │   │   │   └── Addresses.jsx
│   │   │   ├── 📂 seller/
│   │   │   │   ├── Dashboard.jsx
│   │   │   │   ├── Products.jsx
│   │   │   │   └── Orders.jsx
│   │   │   ├── 📂 admin/
│   │   │   │   ├── Dashboard.jsx
│   │   │   │   ├── Users.jsx
│   │   │   │   └── Reports.jsx
│   │   │   ├── Home.jsx                 # Homepage
│   │   │   ├── ProductList.jsx
│   │   │   ├── ProductDetail.jsx
│   │   │   └── NotFound.jsx
│   │   ├── 📂 store/                    # Zustand stores
│   │   │   ├── authStore.js
│   │   │   ├── productStore.js
│   │   │   └── cartStore.js
│   │   ├── 📂 layouts/
│   │   │   ├── MainLayout.jsx
│   │   │   └── AuthLayout.jsx
│   │   ├── App.jsx                      # Main app
│   │   ├── main.jsx                     # Entry point
│   │   └── index.css                    # Global styles
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   ├── vite.config.js
│   ├── tsconfig.json
│   └── README.md
│
├── 📂 database/
│   └── schema.sql                       # SQL Server schema
│
├── 📂 docs/
│   ├── API.md                           # API documentation
│   ├── DEPLOYMENT.md                    # Deployment guide
│   ├── USER_STORIES.md                  # Use cases
│   └── ARCHITECTURE.md                  # System design
│
├── 📂 .github/
│   └── 📂 workflows/
│       ├── deploy.yml                   # CD pipeline
│       └── tests.yml                    # CI pipeline
│
├── .gitignore
├── README.md                            # Main documentation
├── CONTRIBUTING.md                      # Contribution guide
├── setup.sh                             # Setup script (Linux/Mac)
├── setup.bat                            # Setup script (Windows)
└── LICENSE

```

## File Statistics

| Component | Files | Lines |
|-----------|-------|-------|
| Backend | 15 | ~1000 |
| Frontend | 30 | ~2000 |
| Database | 1 | ~300 |
| Docs | 4 | ~500 |
| **Total** | **50+** | **~3800+** |

## Key Technologies

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, Tailwind CSS, Framer Motion |
| **State Management** | Zustand |
| **API Client** | Axios |
| **Backend** | Express.js |
| **Database** | SQL Server 2019+ |
| **Real-time** | Socket.IO |
| **Auth** | JWT |
| **Styling** | Dark Mode (Premium) |
| **CI/CD** | GitHub Actions |

---

**Generated**: May 2026
**Version**: 1.0
