# Quick Reference - Admin & User API Endpoints

## Authentication
```
POST /api/auth/login
- Email: admin@marthub.vn | admin@marthub.vn
- Password: Admin@123
```

---

## ADMIN ENDPOINTS (/api/admin)

### Account Management
```
GET /users                               - List users
PUT /users/:userId/lock                  - Lock account
PUT /users/:userId/unlock                - Unlock account
```

### Reports & Moderation
```
GET /reports                             - List reports
PUT /reports/:reportId/resolve           - Resolve report (APPROVED/REJECTED)
```

### Statistics
```
GET /statistics                          - Dashboard stats
```

### Disputes
```
GET /disputes                            - List disputes
PUT /disputes/:disputeId/resolve         - Resolve dispute
```

### Policies
```
GET /policies                            - List policies
POST /policies                           - Create policy
```

### Withdrawals
```
GET /withdrawals                         - List withdrawal requests
PUT /withdrawals/:withdrawalId/approve   - Approve withdrawal
PUT /withdrawals/:withdrawalId/reject    - Reject withdrawal
```

### Notifications
```
POST /send-notification                  - Send system notification
```

---

## USER ENDPOINTS (/api/users)

### VIP Management
```
GET /vip-packages                        - Get VIP packages
GET /vip-status                          - Check VIP status
POST /vip/subscribe                      - Subscribe to VIP
POST /vip/unsubscribe                    - Cancel VIP
```

### Points
```
GET /points                              - Get current points
GET /points/history                      - Get points history
```

### Ranks
```
GET /rank                                - Get user rank
GET /ranks/all                           - Get all ranks
```

### Saved Filters
```
GET /filters                             - Get saved filters
POST /filters                            - Save new filter
DELETE /filters/:filterId                - Delete filter
```

### Promotions
```
GET /promotions                          - Get available promotions
POST /promotions/:promotionId/receive    - Receive promotion
GET /my-promotions                       - Get my promotions
```

---

## NOTIFICATION ENDPOINTS (/api/notifications)

```
GET /                                    - Get notifications
PUT /:notificationId/read                - Mark as read
GET /unread/count                        - Get unread count
POST /report                             - Submit report
POST /dispute                            - Create dispute
```

---

## VIP PACKAGES

| Package | Price | Duration | Discount | Bonus Points |
|---------|-------|----------|----------|--------------|
| VIP Bạc | 99K | 30 days | 5% | 100 |
| VIP Vàng | 199K | 30 days | 10% | 200 |
| VIP Bạch Kim | 399K | 30 days | 15% | 500 |
| VIP Ngàn Sao | 999K | 30 days | 20% | 1000 |

---

## MEMBER RANKS

| Rank | Min Points | Discount |
|------|-----------|----------|
| Thường | 0 | 0% |
| Bạc | 500 | 5% |
| Vàng | 1000 | 10% |
| Bạch Kim | 2000 | 15% |

---

## REPORT TYPES (for /notifications/report)
- SAN_PHAM_KHONG_HOP_LE
- HANH_VI_KHONG_HOP_LE
- GIAN_LAN
- KHAC

---

## PROMOTION TYPES (for /notifications/dispute)
- Sản phẩm không đúng mô tả
- Hàng giao bị lỗi
- Người bán không giao hàng
- Gian lận

---

## TEST ACCOUNTS

```
ADMIN:
  Email: admin@marthub.vn
  Password: Admin@123

USER:
  Email: user@marthub.vn
  Password: User@123

SELLER:
  Email: seller@marthub.vn
  Password: Seller@123
```

---

## CURL EXAMPLES

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@marthub.vn","password":"Admin@123"}'
```

### Get Users (Admin)
```bash
curl -X GET "http://localhost:5000/api/admin/users?page=1&limit=20" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Lock User (Admin)
```bash
curl -X PUT http://localhost:5000/api/admin/users/5/lock \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"lyDo":"Vi phạm"}'
```

### Get VIP Status (User)
```bash
curl -X GET http://localhost:5000/api/users/vip-status \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Subscribe VIP (User)
```bash
curl -X POST http://localhost:5000/api/users/vip/subscribe \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"maGiaDichVu":2}'
```

### Get Points (User)
```bash
curl -X GET http://localhost:5000/api/users/points \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Save Filter (User)
```bash
curl -X POST http://localhost:5000/api/users/filters \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "tenBoLoc":"Điện thoại Samsung",
    "danhMucId":2,
    "giaToiThieu":5000000,
    "giaToiDa":10000000,
    "diemDanhGiaToiThieu":4.5
  }'
```

---

## HTTP STATUS CODES

```
200 - Success
201 - Created
400 - Bad Request
401 - Unauthorized
403 - Forbidden (Not Admin)
404 - Not Found
500 - Server Error
```

---

## DATABASE TABLES ADDED

1. **BaoCao** - Reports
2. **GiaiQuyetTrancChap** - Disputes
3. **GiaDichVuVIP** - VIP Packages
4. **DichVuVIPNguoiDung** - User VIP Subscriptions
5. **LichSuThayDoiDiem** - Points History
6. **BoLocDaLuu** - Saved Filters
7. **KhuyenMaiNguoiDung** - User Promotions
8. **ChinhSachHeThong** - System Policies

---

## SETUP COMMANDS

```bash
# Update database
sqlcmd -S server_name -d ThuongMaiDienTu -i database/schema.sql
sqlcmd -S server_name -d ThuongMaiDienTu -i database/seed.sql

# Start backend
cd backend
npm install
npm start

# Test API
npm test
```

---

## FEATURES MATRIX

| Feature | Admin | User | Endpoint Count |
|---------|-------|------|-----------------|
| Account Management | ✅ | - | 3 |
| Reports | ✅ | ✅ | 3 |
| Moderation | ✅ | - | 2 |
| Statistics | ✅ | - | 1 |
| Disputes | ✅ | ✅ | 3 |
| Policies | ✅ | - | 2 |
| Withdrawals | ✅ | - | 3 |
| Notifications | ✅ | ✅ | 4 |
| VIP Management | - | ✅ | 4 |
| Points | - | ✅ | 2 |
| Ranks | - | ✅ | 2 |
| Filters | - | ✅ | 3 |
| Promotions | - | ✅ | 3 |
| **TOTAL** | **15** | **20** | **40+** |

---

**Last Updated:** 2024-01-15  
**API Version:** 2.0  
**Status:** ✅ Ready for Production
