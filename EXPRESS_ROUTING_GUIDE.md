# 🎯 EXPRESS.JS ROUTING BEST PRACTICES - Quick Reference

> This document is created after fixing 2 critical routing bugs in the project. Use this as a reference when adding new routes.

---

## ⚡ Golden Rule

> **Specific routes MUST come BEFORE routes with parameters**

```javascript
// ✅ CORRECT
router.get("/admin/dashboard"); // Specific
router.get("/users/:id/settings"); // Nested with param
router.get("/users/:id"); // Generic with param
router.get("/:username"); // Most generic

// ❌ WRONG
router.get("/:username"); // This catches EVERYTHING first!
router.get("/admin/dashboard"); // Never reached
router.get("/users/:id"); // Never reached
```

---

## 📋 Route Priority Order

From **highest priority** (first) to **lowest priority** (last):

### 1️⃣ Static/Exact Paths

```javascript
router.get("/config/system"); // ← Check this first
router.get("/config/settings");
router.get("/api/health");
```

### 2️⃣ Specific Sub-paths

```javascript
router.get("/users/me"); // ← Current user (before /users/:id)
router.get("/users/search"); // ← Search function (before /users/:id)
```

### 3️⃣ Parameterized Paths

```javascript
router.get("/users/:id"); // ← ID-based lookup (catches everything after)
```

### 4️⃣ Deeply Nested Specifics (with parent param)

```javascript
router.get("/users/:id/posts/:postId"); // ← More specific nesting
router.post("/users/:id/posts"); // ← Different method, OK
```

---

## 🔍 Pattern Matching Examples

### Example 1: Product Routes (FIXED)

```javascript
✅ CORRECT ORDER:
1. router.get('/categories/all')    // Static path
2. router.get('/seller')            // Authenticated specific endpoint
3. router.get('/:id')               // Dynamic ID - LAST

❌ WRONG ORDER:
1. router.get('/:id')               // This catches "seller" and "categories" too!
2. router.get('/categories/all')    // Never reached
3. router.get('/seller')            // Never reached
```

### Example 2: Settlement Routes (FIXED)

```javascript
✅ CORRECT ORDER:
1. router.get('/eligible-orders')   // Static
2. router.get('/config/system')     // Static - CONFIG BEFORE :id
3. router.get('/:id')               // Dynamic - LAST
4. router.post('/:id/execute')      // Nested under :id - OK

❌ WRONG ORDER:
1. router.get('/:id')               // WRONG POSITION!
2. router.get('/config/system')     // Never reached - "config" caught by :id
```

### Example 3: User Routes (Common Pattern)

```javascript
✅ CORRECT:
router.get('/profile')              // Current user profile
router.get('/settings')             // Current user settings
router.get('/favorites')            // Current user data
router.get('/:id')                  // Other users by ID
router.get('/:id/posts')            // Other user's posts

❌ WRONG:
router.get('/:id')                  // CATCHES /profile, /settings, /favorites!
router.get('/profile')              // Never reached
router.get('/settings')             // Never reached
```

---

## 🚦 Decision Tree: Route Ordering

```
Does the route have a :parameter?
└─ YES
   └─ Move to BOTTOM of GET routes
   └─ Example: /:id, /search?query=X (query params OK)

└─ NO (it's a static path)
   └─ Is it more specific than other routes?
   └─ YES → Place HIGHER in the file
   └─ Example: /categories/all before /categories/:id
```

---

## 🛠️ Practical Guidelines

### DO ✅

- Put all `/static/paths` at the TOP
- Put all `/:parameterized` routes at the BOTTOM
- Group related routes together
- Use comments to separate sections
- Test with curl/Postman after ordering

### DON'T ❌

- Mix specific and parameterized randomly
- Assume Express will figure it out (it won't!)
- Put parameter routes in the middle
- Forget to test after reordering
- Commit without testing

---

## 📝 Template: Correct Route Structure

```javascript
const router = express.Router();

// ─── PUBLIC ENDPOINTS (no auth) ───
router.get('/public/static-info', ...)
router.get('/categories/all', ...)        // ✅ Before /:id
router.get('/search', ...)

// ─── AUTHENTICATED ENDPOINTS ───
router.get('/profile', auth, ...)         // ✅ Before /:id
router.get('/seller', auth, seller, ...)  // ✅ Before /:id
router.get('/:id', ...)                   // ✅ Parameter routes LAST

// ─── CREATE ENDPOINTS ───
router.post('/', auth, ...)

// ─── UPDATE ENDPOINTS ───
router.put('/:id', auth, ...)
router.put('/:id/status', auth, ...)      // ✅ Nested, OK

// ─── DELETE ENDPOINTS ───
router.delete('/:id', auth, ...)

module.exports = router;
```

---

## 🧪 How to Test Route Order

### Method 1: Manual Testing

```bash
# Test static path
curl http://localhost:5000/api/products/seller
# Should return 200, not 404

# Test dynamic path
curl http://localhost:5000/api/products/123
# Should return product 123 or 404 if not found

# Test invalid static (should not match dynamic)
curl http://localhost:5000/api/products/invalid-slug
# Depends on DB, might be 404 if slug not found
```

### Method 2: Debug Logging

```javascript
// Add logging to see which route matches:
router.get("/:id", (req, res) => {
  console.log("/:id route - params:", req.params);
  // This should NOT log when accessing /seller
});

router.get("/seller", (req, res) => {
  console.log("/seller route hit");
  // This SHOULD log when accessing /seller
});
```

### Method 3: Check Route Registration Order

```bash
# Some frameworks let you list all routes:
# Express doesn't have built-in, but you can trace manually
```

---

## 🎓 Understanding Express Matching

Express matches routes in the **exact order they are registered**:

```javascript
// Simplified matching algorithm:
For each incoming request:
  For each registered route (in order):
    Does request path match route pattern?
    YES → Call that route handler
    NO → Try next route

// This is why ORDER MATTERS!
```

### Route Pattern Examples

| Pattern            | Matches                    | Doesn't Match                  |
| ------------------ | -------------------------- | ------------------------------ |
| `/users/me`        | `/users/me` exactly        | `/users/123`, `/users/test/me` |
| `/users/:id`       | `/users/123`, `/users/abc` | `/users`, `/users/123/posts`   |
| `/users/:id/posts` | `/users/123/posts`         | `/users/posts`, `/users/123`   |

---

## 🔗 Files Following This Pattern

After fixes, these files follow best practices:

✅ `backend/src/routes/product.js` - Fixed Apr 2026

- Categories/Seller specific routes BEFORE /:id

✅ `backend/src/routes/settlement.js` - Fixed May 2026

- Config/Eligible specific routes BEFORE /:id

---

## ⚠️ Common Mistakes to Avoid

### Mistake #1: Parameter Routes Too Early

```javascript
❌ WRONG:
router.get('/:anything')           // Catches everything!
router.get('/special-case')        // Never reached

✅ CORRECT:
router.get('/special-case')        // Check specific first
router.get('/:anything')           // Check generic last
```

### Mistake #2: Forgetting Query Parameters

```javascript
// Query params (?key=value) are OK at end
// Because they use "?" separator

router.get('/:id')                 // OK to have at end
  → GET /123?search=text           // Separate from path

// But path segments must be ordered:
router.get('/:id')                 // /123
router.get('/:id/posts/:postId')   // /123/posts/456
```

### Mistake #3: Different Methods = Different Rules

```javascript
// Different methods operate independently
router.get("/:id"); // GET /123
router.post("/"); // POST / (different path)
router.put("/:id"); // PUT /123 (same path, different method - OK)

// But GET ordering still matters:
router.get("/specific"); // Must be before...
router.get("/:id"); // ...this
```

---

## 📊 Summary Table

| Priority | Type                   | Example              | Position |
| -------- | ---------------------- | -------------------- | -------- |
| 1        | Static paths           | `/config`, `/search` | ↑ TOP    |
| 2        | Static + nested        | `/user/profile`      | ↑        |
| 3        | Parameterized          | `/:id`               | ↓        |
| 4        | Parameterized + nested | `/:id/posts/:postId` | ↓ BOTTOM |

---

## 🚀 Modern Alternative: Route Merging

Some teams use route grouping for clarity:

```javascript
// Product routes (in routes/product.js)
router.get('/categories/all', ...)    // Put specials first
router.get('/seller', auth, seller, ...)
router.get('/:id', ...)               // Parameterized last

// User routes (in routes/user.js)
router.get('/me', auth, ...)          // Current user special
router.get('/:id', ...)               // Other users

// Server mounts them:
app.use('/api/products', productRouter)    // Routes are within files
app.use('/api/users', userRouter)
```

This way, each file maintains its own ordering.

---

## ✅ Checklist for New Routes

When adding a new route:

- [ ] Is it more specific than existing routes?
- [ ] Should it come before parameterized routes?
- [ ] Does it have a `:parameter`?
- [ ] Tested after reordering? (using curl/Postman)
- [ ] Did I break any existing routes?
- [ ] Is documentation updated?

---

## 📚 References

- Express.js Official Routing Guide: https://expressjs.com/en/guide/routing.html
- Built-in Issues This Fixes: Route ordering priority in Express
- Best Practices: Order specific routes before generic patterns

---

**Last Updated:** May 31, 2026  
**Created After Fixing:** 2 critical routing bugs  
**Use Case:** Reference for all Express.js route development
