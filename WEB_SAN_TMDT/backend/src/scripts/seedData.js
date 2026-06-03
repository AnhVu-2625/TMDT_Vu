require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const { getPool, sql, closePool } = require('../config/database');

const shops = [
  {
    email: 'shop1@marthub.vn', name: 'Fashion House', desc: 'Th?i trang nam n? cao c?p - Hàng chính hãng, xu h??ng m?i nh?t',
    products: [
      { name: 'Áo Thun Cotton Cao C?p', slug: 'ao-thun-cotton-cao-cap', desc: 'Áo thun nam ch?t cotton 100% cao c?p, m?m m?i, th?m hút t?t', price: 299000, cat: 'thoi-trang', variants: [{ color: 'Tr?ng', size: 'M', qty: 200 }, { color: '?en', size: 'L', qty: 180 }], img: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=640&h=640&fit=crop' },
      { name: 'Qu?n Jean Nam Slim Fit', slug: 'quan-jean-nam-slim-fit', desc: 'Qu?n jean nam ch?t denim cao c?p, co giãn 4 chi?u', price: 499000, cat: 'thoi-trang', variants: [{ color: 'Xanh', size: '30', qty: 100 }, { color: '?en', size: '32', qty: 120 }], img: 'https://images.unsplash.com/photo-1542272454315-4c01d7abdf4a?w=640&h=640&fit=crop' },
      { name: 'Áo Khoác Bomber Nam', slug: 'ao-khoac-bomber-nam', desc: 'Áo khoác bomber ch?t dù bóng cao c?p, lót ?m', price: 699000, cat: 'thoi-trang', variants: [{ color: '?en', size: 'L', qty: 80 }, { color: 'Xanh olive', size: 'XL', qty: 60 }], img: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=640&h=640&fit=crop' },
      { name: 'Váy ?en N? Th?i Trang', slug: 'vay-den-nu-thoi-trang', desc: 'Váy ?en n? li?n th?i trang, ch?t li?u cao c?p', price: 549000, cat: 'thoi-trang', variants: [{ color: '?en', size: 'M', qty: 90 }], img: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=640&h=640&fit=crop' },
      { name: 'S? Mi Tr?ng Nam Công S?', slug: 'so-mi-trang-nam-cong-so', desc: 'Áo s? mi tr?ng nam cotton-poly, không nhàu', price: 350000, cat: 'thoi-trang', variants: [{ color: 'Tr?ng', size: 'L', qty: 300 }], img: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=640&h=640&fit=crop' },
    ]
  },
  {
    email: 'shop2@marthub.vn', name: 'Home Living', desc: 'N?i th?t và ?? dùng gia ?ình - ?ep, b?n, giá t?t',
    products: [
      { name: 'B? ?n Gia ??nh Cao C?p', slug: 'bo-an-gia-dinh-cao-cap', desc: 'B? ?n 6 ng??i g?m bát, ?a, thìa - g?m s? Bát Tràng', price: 890000, cat: 'gia-dung', variants: [{ color: 'Tr?ng', size: null, qty: 100 }], img: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=640&h=640&fit=crop' },
      { name: 'N?i Chiên Không D?u 5.5L', slug: 'noi-chien-khong-dau-55l', desc: 'N?i chiên không d?u 5.5L, 1700W, 8 ch??ng trình', price: 1690000, cat: 'gia-dung', variants: [{ color: '?en', size: null, qty: 60 }], img: 'https://images.unsplash.com/photo-1584990347449-a6f0eae1b06f?w=640&h=640&fit=crop' },
      { name: 'Máy L?c N??c RO 8 Lõi', slug: 'may-loc-nuoc-ro-8-loi', desc: 'Máy l?c n??c RO 8 lõi, 10L/h, bình ch?a 8L', price: 3590000, cat: 'gia-dung', variants: [{ color: 'Tr?ng', size: null, qty: 30 }], img: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=640&h=640&fit=crop' },
      { name: '?èn Bàn LED Ch?ng M?i', slug: 'den-ban-led-chong-moi', desc: '?èn bàn LED 5 ch? ?? sáng, s?c USB', price: 390000, cat: 'gia-dung', variants: [{ color: '?en', size: null, qty: 200 }], img: 'https://images.unsplash.com/photo-1507473885765-e6ed057ab6fe?w=640&h=640&fit=crop' },
      { name: 'B? Ch?n Ga G?i Cao Su', slug: 'bo-chan-ga-goi-cao-su', desc: 'B? ch?n ga g?i cao su non 8cm, cotton thoáng mát', price: 2490000, cat: 'gia-dung', variants: [{ color: 'Tr?ng', size: null, qty: 40 }], img: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=640&h=640&fit=crop' },
    ]
  },
  {
    email: 'shop3@marthub.vn', name: 'Book Worm', desc: 'Nhà sách online - Sách hay m?i ngày',
    products: [
      { name: '??c Nh?n Gian - T?p 1', slug: 'doc-nhan-gian-tap-1', desc: 'Ti?u thuy?t ki?m hi?p c?a Huy?n Huy?n T?', price: 189000, cat: 'sach', variants: [{ color: null, size: null, qty: 500 }], img: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=640&h=640&fit=crop' },
      { name: 'Nhà Gi? Kim', slug: 'nha-gia-kim', desc: 'Ti?u thuy?t tri?t h?c c?a Paulo Coelho', price: 79000, cat: 'sach', variants: [{ color: null, size: null, qty: 800 }], img: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=640&h=640&fit=crop' },
      { name: 'Harry Potter B? 7 T?p', slug: 'harry-potter-bo-7-tap', desc: 'B? Harry Potter ??y ?? 7 t?p, bìa c?ng ?p kim', price: 1250000, cat: 'sach', variants: [{ color: null, size: null, qty: 100 }], img: 'https://images.unsplash.com/photo-1621351183012-e2f9972dd9bf?w=640&h=640&fit=crop' },
      { name: 'Tôi Th?y Hoa Vàng Trên C? Xanh', slug: 'toi-thay-hoa-vang-tren-co-xanh', desc: 'Truy?n dài c?a Nguy?n Nh?t Ánh', price: 95000, cat: 'sach', variants: [{ color: null, size: null, qty: 600 }], img: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=640&h=640&fit=crop' },
      { name: 'Atomic Habits', slug: 'atomic-habits', desc: 'Thói quen nguyên t? - sách phát tri?n b?n thân', price: 129000, cat: 'sach', variants: [{ color: null, size: null, qty: 400 }], img: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=640&h=640&fit=crop' },
    ]
  },
  {
    email: 'shop4@marthub.vn', name: 'Beauty Care', desc: 'M? ph?m chính hãng - Ch?m sóc da toàn di?n',
    products: [
      { name: 'Serum Vitamin C Nh?t Hàn', slug: 'serum-vitamin-c-nhat-han', desc: 'Serum Vitamin C 15% + EGF, tái t?o da, m? th?m nám', price: 450000, cat: 'my-pham', variants: [{ color: null, size: '30ml', qty: 200 }], img: 'https://images.unsplash.com/photo-1570194065650-d99fb4ee8e39?w=640&h=640&fit=crop' },
      { name: 'Kem Ch?ng N?ng SPF50+', slug: 'kem-chong-nang-spf50', desc: 'Kem ch?ng n?ng v?t lý SPF50+ PA+++, lành tính', price: 320000, cat: 'my-pham', variants: [{ color: null, size: '50ml', qty: 300 }], img: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=640&h=640&fit=crop' },
      { name: 'S?a R?a M?t Trà Xanh', slug: 'sua-rua-mat-tra-xanh', desc: 'S?a r?a m?t trà xanh Nh?t B?n, s?ch sâu, se khít l? chân lông', price: 185000, cat: 'my-pham', variants: [{ color: null, size: '150ml', qty: 400 }], img: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=640&h=640&fit=crop' },
      { name: 'Son Môi ??t Lì Cao C?p', slug: 'son-moi-dot-li-cao-cap', desc: 'Son môi d?ng th?i lì, lên màu chu?n, ?n môi ??m', price: 280000, cat: 'my-pham', variants: [{ color: '?? ??', size: null, qty: 250 }], img: 'https://images.unsplash.com/photo-1631214524020-7e18db9a8f92?w=640&h=640&fit=crop' },
      { name: 'Kem D??ng Th? Body 400ml', slug: 'kem-duong-the-body-400ml', desc: 'Kem d??ng th? tinh d?t d?a, d??ng ?m 24h', price: 235000, cat: 'my-pham', variants: [{ color: null, size: '400ml', qty: 180 }], img: 'https://images.unsplash.com/photo-1612817288484-6f916006741a?w=640&h=640&fit=crop' },
    ]
  },
  {
    email: 'shop5@marthub.vn', name: 'Gear Zone', desc: 'Gaming gear và ph? ki?n công ngh?',
    products: [
      { name: 'Bàn Phím C? Logitech G Pro', slug: 'ban-phim-co-logitech-g-pro', desc: 'Bàn phím c? Logitech G Pro X, switch GX Blue, RGB, Tenkeyless', price: 2590000, cat: 'gaming', variants: [{ color: '?en', size: null, qty: 50 }], img: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=640&h=640&fit=crop' },
      { name: 'Chu?t Gaming Razer DeathAdder', slug: 'chuot-gaming-razer-deathadder', desc: 'Razer DeathAdder V3, sensor 30K DPI, siêu nh? 59g', price: 2190000, cat: 'gaming', variants: [{ color: '?en', size: null, qty: 70 }], img: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=640&h=640&fit=crop' },
      { name: 'Tai Nghe Gaming SteelSeries', slug: 'tai-nghe-gaming-steelseries', desc: 'SteelSeries Arctis 7+, 7.1 ?o, pin 30h, không dây', price: 3290000, cat: 'gaming', variants: [{ color: '?en', size: null, qty: 40 }], img: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=640&h=640&fit=crop' },
      { name: 'Gh? Gaming Công Thái H?c', slug: 'ghe-gaming-cong-thai-hoc', desc: 'Gh? gaming t?a l??i, tay v?n 4D, ng?a 180 ??', price: 5290000, cat: 'gaming', variants: [{ color: '?en', size: null, qty: 25 }], img: 'https://images.unsplash.com/photo-1586105251261-72a756497a11?w=640&h=640&fit=crop' },
      { name: 'Lót Chu?t XXL Siêu L?n', slug: 'lot-chuot-xxl-sieu-lon', desc: 'Lót chu?t gaming 900x400mm, v?i m?n, khâu vi?n ch?ng t?a', price: 390000, cat: 'gaming', variants: [{ color: '?en', size: null, qty: 200 }], img: 'https://images.unsplash.com/photo-1587778080078-5ad9cb51d19e?w=640&h=640&fit=crop' },
    ]
  },
  {
    email: 'shop6@marthub.vn', name: 'Food Market', desc: 'Th?c ph?m s?ch - Organic - ??c s?n vùng mi?n',
    products: [
      { name: 'M?t Ong Nguyên Ch?t 500g', slug: 'mat-ong-nguyen-chat-500g', desc: 'M?t ong r?ng nguyên ch?t t? Cúc Ph??ng, giàu d??ng ch?t', price: 350000, cat: 'thuc-pham', variants: [{ color: null, size: '500g', qty: 100 }], img: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=640&h=640&fit=crop' },
      { name: 'Cà Phê Arabica ?à L?t', slug: 'ca-phe-arabica-da-lat', desc: 'Cà phê Arabica s?ch 100% t? ?à L?t, rang m?c v?a', price: 120000, cat: 'thuc-pham', variants: [{ color: null, size: '500g', qty: 200 }], img: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=640&h=640&fit=crop' },
      { name: 'H?t ?i?u Rang Mu?i 1kg', slug: 'hat-dieu-rang-muoi-1kg', desc: 'H?t ?i?u nhân rang mu?i Bình Ph??c, giòn th?m', price: 250000, cat: 'thuc-pham', variants: [{ color: null, size: '1kg', qty: 150 }], img: 'https://images.unsplash.com/photo-1565981222-14e6b6a6b0f0?w=640&h=640&fit=crop' },
      { name: 'Y?n M?ch Nguyên H?t 1kg', slug: 'yen-mach-nguyen-hat-1kg', desc: 'Y?n m?ch Úc nguyên h?t 100%, giàu ch?t x?', price: 85000, cat: 'thuc-pham', variants: [{ color: null, size: '1kg', qty: 300 }], img: 'https://images.unsplash.com/photo-1588516903720-8ceb67f9ef84?w=640&h=640&fit=crop' },
      { name: 'Trà Oolong ?ào Tân C??ng 250g', slug: 'tra-oolong-dao-tan-cuong-250g', desc: 'Trà Oolong Thái Nguyên cao c?p, h??ng hoa t? nhiên', price: 200000, cat: 'thuc-pham', variants: [{ color: null, size: '250g', qty: 120 }], img: 'https://images.unsplash.com/photo-1563911892437-1feda0179e1b?w=640&h=640&fit=crop' },
    ]
  },
  {
    email: 'shop7@marthub.vn', name: 'Sports Plus', desc: 'D?ng c? th? thao chính hãng - Nike, Adidas, Puma',
    products: [
      { name: 'Giày Ch?y B? Nike Air Max', slug: 'giay-chay-bo-nike-air-max', desc: 'Nike Air Max 2024, ?m êm Air Sole, breathable mesh', price: 3590000, cat: 'the-thao', variants: [{ color: 'Tr?ng', size: '42', qty: 60 }, { color: '?en', size: '43', qty: 40 }], img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=640&h=640&fit=crop' },
      { name: 'Áo Thun Th? Thao Adidas', slug: 'ao-thun-the-thao-adidas', desc: 'Áo thun Adidas AEROREADY, th?m hút m? hôi', price: 650000, cat: 'the-thao', variants: [{ color: '?en', size: 'L', qty: 200 }], img: 'https://images.unsplash.com/photo-1572495641004-28421a5c1f6c?w=640&h=640&fit=crop' },
      { name: 'T? T?ng Gym 20kg', slug: 'ta-tap-gym-20kg', desc: 'T? t?ng cao su không mùi, b? 2 qu? 10kg + thanh ?n', price: 890000, cat: 'the-thao', variants: [{ color: '?en', size: '20kg', qty: 80 }], img: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=640&h=640&fit=crop' },
      { name: 'Bóng ?á Nike Premier League', slug: 'bong-da-nike-premier-league', desc: 'Bóng ?á Nike Flight 2024, size 5, chu?n b?n kích th??c', price: 1650000, cat: 'the-thao', variants: [{ color: 'Tr?ng', size: '5', qty: 100 }], img: 'https://images.unsplash.com/photo-1614632537423-0e1c2a5a8e06?w=640&h=640&fit=crop' },
      { name: 'Th?m T?p Yoga Cao C?p', slug: 'tham-tap-yoga-cao-cap', desc: 'Th?m t?p yoga TPE ch?ng tr??t, dày 6mm, kháng khu?n', price: 420000, cat: 'the-thao', variants: [{ color: 'Xanh', size: null, qty: 150 }], img: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=640&h=640&fit=crop' },
    ]
  },
  {
    email: 'shop8@marthub.vn', name: 'Digital World', desc: '?i?n máy - Gia d?ng chính hãng',
    products: [
      { name: 'T? L?nh LG Inverter 300L', slug: 'tu-lanh-lg-inverter-300l', desc: 'T? l?nh LG Inverter 300L, Door-In-Door, kháng khu?n', price: 11900000, cat: 'gia-dung', variants: [{ color: 'B?c', size: null, qty: 20 }], img: 'https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=640&h=640&fit=crop' },
      { name: 'Máy Gi?t LG Inverter 9kg', slug: 'may-giat-lg-inverter-9kg', desc: 'Máy gi?t c?a ngang LG Inverter 9kg, gi?t h?i n??c', price: 8990000, cat: 'gia-dung', variants: [{ color: 'Tr?ng', size: null, qty: 15 }], img: 'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=640&h=640&fit=crop' },
      { name: 'TV Samsung QLED 65 inch 4K', slug: 'tv-samsung-qled-65-inch-4k', desc: 'TV Samsung QLED 4K 65 inch, HDR10+, Smart Hub', price: 25990000, cat: 'gia-dung', variants: [{ color: '?en', size: null, qty: 10 }], img: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=640&h=640&fit=crop' },
      { name: 'Máy L?nh Inverter 12000BTU', slug: 'may-lanh-inverter-12000btu', desc: 'Máy l?nh Daikin Inverter 12000BTU, ti?t ki?m ?i?n', price: 12490000, cat: 'gia-dung', variants: [{ color: 'Tr?ng', size: null, qty: 25 }], img: 'https://images.unsplash.com/photo-1631635589499-afdea35b45b8?w=640&h=640&fit=crop' },
      { name: 'Máy Hút B?i Robot', slug: 'may-hut-bui-robot', desc: 'Robot hút b?i Xiaomi, LiDAR, hút 4000Pa, t? ?ng rác', price: 6990000, cat: 'gia-dung', variants: [{ color: 'Tr?ng', size: null, qty: 35 }], img: 'https://images.unsplash.com/photo-1585155770447-2f66e2a397b5?w=640&h=640&fit=crop' },
    ]
  },
  {
    email: 'shop9@marthub.vn', name: 'Pet Love', desc: 'Ph? ki?n thú c?ng - Th?c ?n, ?? ch?i cho chó mèo',
    products: [
      { name: 'Th?c ?n Chó Royal Canin 7.5kg', slug: 'thuc-an-cho-royal-canin-75kg', desc: 'Th?c ?n cao c?p cho chó Royal Canin, ?y ?? d??ng ch?t', price: 750000, cat: 'thuc-pham', variants: [{ color: null, size: '7.5kg', qty: 60 }], img: 'https://images.unsplash.com/photo-1565708098709-5c0e4e42b63e?w=640&h=640&fit=crop' },
      { name: 'Cát V? Sinh Cho Mèo 10L', slug: 'cat-ve-sinh-cho-meo-10l', desc: 'Cát v? sinh Bentonite Nh?t B?n, kh?u mùi t?t, vón c?c', price: 120000, cat: 'thuc-pham', variants: [{ color: null, size: '10L', qty: 200 }], img: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=640&h=640&fit=crop' },
      { name: 'Nhà V? Sinh Cho Chó Mèo', slug: 'nha-ve-sinh-cho-cho-meo', desc: 'Nhà v? sinh thông minh, khay ?áy kín, d? v? sinh', price: 350000, cat: 'gia-dung', variants: [{ color: 'Xanh', size: null, qty: 80 }], img: 'https://images.unsplash.com/photo-1592194996308-7b43878e84a6?w=640&h=640&fit=crop' },
      { name: 'Dây D?t Chó Ch?ng C?n', slug: 'day-dat-cho-chong-can', desc: 'Dây d?t chó v?i nylon ch?c ch?n 1.5m, khóa xoay 360', price: 180000, cat: 'the-thao', variants: [{ color: '??', size: '1.5m', qty: 150 }], img: 'https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=640&h=640&fit=crop' },
      { name: '? Cho Mèo Cao C?p 3 T?ng', slug: 'o-cho-meo-cao-cap-3-tang', desc: '? mèo 3 t?ng, khung g?, n?m êm, có tr?u cào móng', price: 890000, cat: 'gia-dung', variants: [{ color: 'Xám', size: null, qty: 30 }], img: 'https://images.unsplash.com/photo-1595246140625-573b715d11c8?w=640&h=640&fit=crop' },
    ]
  },
  {
    email: 'seller@marthub.vn', name: 'Tech Store Official', extra: true,
    products: [
      { name: 'Xiaomi 14 Ultra', slug: 'xiaomi-14-ultra-2', desc: 'Flagship Xiaomi, Snapdragon 8 Gen 3, camera Leica 1 inch', price: 21990000, cat: 'dien-thoai', variants: [{ color: '?en', size: '256GB', qty: 40 }, { color: 'Tr?ng', size: '512GB', qty: 25 }], img: 'https://images.unsplash.com/photo-1616348436168-de43ad0db179?w=640&h=640&fit=crop' },
      { name: 'Samsung Galaxy Tab S9', slug: 'samsung-galaxy-tab-s9-2', desc: 'Máy tính b?ng, màn hình Dynamic AMOLED 11 inch, S Pen', price: 19990000, cat: 'dien-thoai', variants: [{ color: 'Grey', size: '128GB', qty: 30 }, { color: 'Beige', size: '256GB', qty: 20 }], img: 'https://images.unsplash.com/photo-1624705002806-5d72df19c3ad?w=640&h=640&fit=crop' },
      { name: 'Google Pixel 8 Pro', slug: 'google-pixel-8-pro-2', desc: 'Google Pixel 8 Pro, Tensor G3, camera tính toán', price: 18990000, cat: 'dien-thoai', variants: [{ color: 'Bay', size: '128GB', qty: 20 }, { color: 'Porcelain', size: '256GB', qty: 15 }], img: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=640&h=640&fit=crop' },
      { name: 'AirPods Pro 2 USB-C', slug: 'airpods-pro-2-usbc-2', desc: 'Tai nghe Apple, ch?ng ?n ch? ??ng, chip H2', price: 6790000, cat: 'tai-nghe', variants: [{ color: 'Tr?ng', size: null, qty: 100 }], img: 'https://images.unsplash.com/photo-1606841837239-c5a1a4a07af7?w=640&h=640&fit=crop' },
      { name: 'Dell XPS 15 9530', slug: 'dell-xps-15-9530-2', desc: 'Dell XPS 15, i7-13700H, OLED 3.5K touch', price: 38990000, cat: 'laptop', variants: [{ color: 'B?c', size: 'i7/16GB/512GB', qty: 15 }, { color: 'B?c', size: 'i9/32GB/1TB', qty: 10 }], img: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=640&h=640&fit=crop' },
    ]
  },
];

const reviews = [
  { text: 'S?n ph?m r?t t?t, ?óng gói c?n th?n, giao hàng nhanh! S? ?ng h? d?i.', score: 5 },
  { text: 'Hàng ?úng mô t?, ch?t l??ng t?t. S? mua l?n sau.', score: 4 },
  { text: 'S?n ph?m t?m ?n nh?ng giá h?i cao so v?i th? tr??ng.', score: 3 },
  { text: 'R?t hài lòng! Shop nhi?t tình, hàng t??i ?ep ?úng nh? hình.', score: 5 },
  { text: 'Ch?t l??ng khá t?t, s? d?ng ?n ??nh. S? gi?i thi?u b?n bè.', score: 4 },
  { text: 'C?n c?i thi?n khâu ?óng gói, nh?ng s?n ph?m thì t?t.', score: 4 },
  { text: 'Tuy?t v?i! S?n ph?m ch?t l??ng cao, x?ng ?áng t?ng ti?n.', score: 5 },
  { text: 'Bình th??ng, không có gì ??c bi?t so v?i giá ti?n.', score: 3 },
  { text: 'Shop giao hàng siêu nhanh, hàng ch?t l??ng, ?úng cam k?t!', score: 5 },
  { text: 'Mua l?n 2 r?i, v?n r?t hài lòng. Shop uy tín!', score: 5 },
  { text: 'S?n ph?m t?t nh?ng màu s?c h?i khác so v?i hình.', score: 4 },
  { text: 'Giá c? h?p lý, ch?t l??ng ?m b?o. S? ?ng h? dài lâu.', score: 4 },
  { text: 'R?t ?áng ti?n, s? d?ng th?y hi?u qu? ngay sau vài ngày.', score: 5 },
  { text: 'S?n ph?m t?m ??c, không có nhi?u ?i?m n?i b?t.', score: 3 },
  { text: 'Hàng chính hãng, bao bì ?p. Shop t? v?n nhi?t tình.', score: 5 },
  { text: 'Giao hàng h?i ch?m nh?ng s?n ph?m t?t nên c?ng ok.', score: 4 },
  { text: 'S?n ph?m quá tuy?t, s? d?ng m??t mà, không có l?i gì.', score: 5 },
  { text: 'Ch?t l??ng ?m b?o so v?i giá ti?n. C?m ?n shop!', score: 4 },
  { text: 'Không ?úng nh? qu?ng cáo, h?i th?t v?ng.', score: 2 },
  { text: 'L?n ?u mua hàng t?i shop, r?t hài lòng v?i s?n ph?m.', score: 4 },
];

async function seed() {
  try {
    const pool = await getPool();

    // Get category IDs
    const catResult = await pool.request().query('SELECT MaDanhMuc, DuongDan FROM DanhMucSanPham');
    const catMap = {};
    catResult.recordset.forEach(r => { catMap[r.DuongDan] = r.MaDanhMuc; });
    console.log('Categories:', Object.keys(catMap).join(', '));

    // Get and create users
    for (const shop of shops) {
      let userResult = await pool.request()
        .input('email', sql.NVarChar, shop.email)
        .query('SELECT MaNguoiDung FROM NguoiDung WHERE Email = @email');

      if (userResult.recordset.length === 0 && !shop.extra) {
        const name = shop.email.replace('@marthub.vn', '');
        const phone = '0901' + (100000 + Math.floor(Math.random() * 900000));
        await pool.request()
          .input('hoten', sql.NVarChar, name)
          .input('email', sql.NVarChar, shop.email)
          .input('sdt', sql.NVarChar, phone)
          .input('matkhau', sql.NVarChar, '$2a$10$iz4bXmeMJhuhA30ZuP0wb./KJCcvcvtbkSSZBELL2k.mN1YNQ/bwq')
          .query(`INSERT INTO NguoiDung (HoTen, Email, SoDienThoai, MatKhau, VaiTro, TrangThai, DiemTichLuy, MaHang)
                  VALUES (@hoten, @email, @sdt, @matkhau, N'NGUOI_DUNG', N'HOAT_DONG', 200, 1)`);
        userResult = await pool.request()
          .input('email', sql.NVarChar, shop.email)
          .query('SELECT MaNguoiDung FROM NguoiDung WHERE Email = @email');
        console.log(`  Created user: ${shop.email}`);
      }

      const userId = userResult.recordset[0]?.MaNguoiDung;
      if (!userId) {
        console.log(`  User ${shop.email} not found, skipping`);
        continue;
      }

      // Create shop
      let shopResult = await pool.request()
        .input('maND', sql.Int, userId)
        .query('SELECT MaCuaHang FROM CuaHang WHERE MaNguoiDung = @maND');

      if (shopResult.recordset.length === 0 && !shop.extra) {
        await pool.request()
          .input('maND', sql.Int, userId)
          .input('ten', sql.NVarChar, shop.name)
          .input('mota', sql.NVarChar, shop.desc || '')
          .input('sodu', sql.Decimal(15, 2), 5000000)
          .query(`INSERT INTO CuaHang (MaNguoiDung, TenCuaHang, MoTa, TrangThai, SoDuVi)
                  VALUES (@maND, @ten, @mota, N'HOAT_DONG', @sodu)`);
        shopResult = await pool.request()
          .input('maND', sql.Int, userId)
          .query('SELECT MaCuaHang FROM CuaHang WHERE MaNguoiDung = @maND');
        console.log(`  Created shop: ${shop.name}`);
      }

      const shopId = shopResult.recordset[0]?.MaCuaHang;
      if (!shopId) {
        console.log(`  Shop for ${shop.email} not found, skipping`);
        continue;
      }

      // Create products
      for (const prod of shop.products) {
        const exist = await pool.request()
          .input('slug', sql.NVarChar, prod.slug)
          .query('SELECT MaSanPham FROM SanPham WHERE DuongDan = @slug');
        if (exist.recordset.length > 0) {
          console.log(`  Product ${prod.name} already exists, skipping`);
          continue;
        }

        const categoryId = catMap[prod.cat];
        if (!categoryId) {
          console.log(`  Category ${prod.cat} not found for ${prod.name}`);
          continue;
        }

        const result = await pool.request()
          .input('shopId', sql.Int, shopId)
          .input('catId', sql.Int, categoryId)
          .input('name', sql.NVarChar, prod.name)
          .input('slug', sql.NVarChar, prod.slug)
          .input('desc', sql.NVarChar, prod.desc || '')
          .input('price', sql.Decimal(15, 2), prod.price)
          .input('rating', sql.Decimal(3, 2), (3 + Math.random() * 2).toFixed(1))
          .query(`INSERT INTO SanPham (MaCuaHang, MaDanhMuc, TenSanPham, DuongDan, MoTa, GiaGoc, DanhGiaTrungBinh)
                  VALUES (@shopId, @catId, @name, @slug, @desc, @price, @rating);
                  SELECT SCOPE_IDENTITY() AS id`);

        const productId = result.recordset[0].id;
        console.log(`  Created product: ${prod.name} (ID: ${productId})`);

        // Variants
        if (prod.variants) {
          for (const v of prod.variants) {
            await pool.request()
              .input('prodId', sql.Int, productId)
              .input('color', sql.NVarChar, v.color || '')
              .input('size', sql.NVarChar, v.size || 'Standard')
              .input('price', sql.Decimal(15, 2), prod.price)
              .input('qty', sql.Int, v.qty || 100)
              .query(`INSERT INTO PhienBanSanPham (MaSanPham, MauSac, KichThuoc, GiaBan, SoLuongTonKho)
                      VALUES (@prodId, @color, @size, @price, @qty)`);
          }
        }

        // Image
        if (prod.img) {
          await pool.request()
            .input('prodId', sql.Int, productId)
            .input('img', sql.NVarChar, prod.img)
            .query(`INSERT INTO HinhAnhSanPham (MaSanPham, DuongDanAnh, LaAnhChinh)
                    VALUES (@prodId, @img, 1)`);
        }
      }
    }

    // ============ REVIEWS ============
    console.log('\n=== Creating reviews ===');

    // Get all active products
    const products = await pool.request()
      .query('SELECT MaSanPham, MaCuaHang FROM SanPham WHERE TrangThai = N\'HOAT_DONG\'');
    const productList = products.recordset;

    // Get or create reviewer users
    const reviewerEmails = [];
    for (let i = 1; i <= 10; i++) {
      reviewerEmails.push(`reviewer${i}@marthub.vn`);
    }

    for (const email of reviewerEmails) {
      const exist = await pool.request()
        .input('email', sql.NVarChar, email)
        .query('SELECT MaNguoiDung FROM NguoiDung WHERE Email = @email');
      if (exist.recordset.length === 0) {
        const name = ['Nguy?n V?n', 'Tr?n Th?', 'Lê V?n', 'Ph?m Th?', 'Hoàng V?n', '??ng Th?', 'Võ V?n', 'Bùi Th?', 'Lý V?n', 'Ngô Th?'][reviewerEmails.indexOf(email) % 10]
          + ' ' + ['Anh', 'Bình', 'C??ng', 'Dung', 'Em', 'Phúc', 'Giang', 'H?i', 'H?ng', 'Vy'][reviewerEmails.indexOf(email) % 10];
        await pool.request()
          .input('hoten', sql.NVarChar, name)
          .input('email', sql.NVarChar, email)
          .input('sdt', sql.NVarChar, '0902' + String(100000 + Math.floor(Math.random() * 900000)))
          .input('matkhau', sql.NVarChar, '$2a$10$iz4bXmeMJhuhA30ZuP0wb./KJCcvcvtbkSSZBELL2k.mN1YNQ/bwq')
          .query(`INSERT INTO NguoiDung (HoTen, Email, SoDienThoai, MatKhau, VaiTro, TrangThai, DiemTichLuy, MaHang)
                  VALUES (@hoten, @email, @sdt, @matkhau, N'NGUOI_DUNG', N'HOAT_DONG', 100, 1)`);
      }

      // Ensure address exists
      const addr = await pool.request()
        .input('email', sql.NVarChar, email)
        .query(`SELECT nd.MaNguoiDung FROM NguoiDung nd WHERE nd.Email = @email`);
      const uid = addr.recordset[0]?.MaNguoiDung;
      if (uid) {
        const hasAddr = await pool.request()
          .input('uid', sql.Int, uid)
          .query('SELECT MaDiaChi FROM DiaChiGiaoHang WHERE MaNguoiDung = @uid');
        if (hasAddr.recordset.length === 0) {
          await pool.request()
            .input('uid', sql.Int, uid)
            .input('ten', sql.NVarChar, name || email)
            .input('sdt', sql.NVarChar, '0902000000')
            .query(`INSERT INTO DiaChiGiaoHang (MaNguoiDung, TenNguoiNhan, SDTNguoiNhan, DiaChiCuThe, PhuongXa, QuanHuyen, TinhThanh, LaMacDinh)
                    VALUES (@uid, @ten, @sdt, N'123 ???ng Test', N'Ph??ng 1', N'Qu?n 1', N'TP. H? Chí Minh', 0)`);
        }
      }
    }

    // Collect reviewer user IDs
    const reviewerResult = await pool.request()
      .query(`SELECT MaNguoiDung FROM NguoiDung WHERE Email LIKE 'reviewer%@marthub.vn'`);
    const reviewerIds = reviewerResult.recordset.map(r => r.MaNguoiDung);

    if (reviewerIds.length === 0 || productList.length === 0) {
      console.log('No reviewers or products found for reviews');
      return;
    }

    // Create reviews for each product
    let reviewCount = 0;
    for (const product of productList) {
      const numReviews = 3 + Math.floor(Math.random() * 3); // 3-5 reviews
      const shuffled = [...reviewerIds].sort(() => Math.random() - 0.5).slice(0, numReviews);

      for (const reviewerId of shuffled) {
        // Check if already reviewed by this user
        const existingReview = await pool.request()
          .input('uid', sql.Int, reviewerId)
          .input('pid', sql.Int, product.MaSanPham)
          .query('SELECT MaDanhGia FROM DanhGiaSanPham WHERE MaNguoiDung = @uid AND MaSanPham = @pid');

        if (existingReview.recordset.length > 0) continue;

        // Get address
        const addrResult = await pool.request()
          .input('uid', sql.Int, reviewerId)
          .query('SELECT TOP 1 MaDiaChi FROM DiaChiGiaoHang WHERE MaNguoiDung = @uid');
        const addrId = addrResult.recordset[0]?.MaDiaChi;
        if (!addrId) continue;

        // Get variant for product
        const variantResult = await pool.request()
          .input('pid', sql.Int, product.MaSanPham)
          .query('SELECT TOP 1 MaPhienBan, GiaBan FROM PhienBanSanPham WHERE MaSanPham = @pid');
        const variant = variantResult.recordset[0];
        if (!variant) continue;

        const daysAgo = Math.floor(Math.random() * 30);
        const review = reviews[Math.floor(Math.random() * reviews.length)];
        const orderDate = new Date(Date.now() - (daysAgo + 10) * 86400000);
        const reviewDate = new Date(Date.now() - daysAgo * 86400000);

        // Create order
        const orderResult = await pool.request()
          .input('uid', sql.Int, reviewerId)
          .input('shopId', sql.Int, product.MaCuaHang)
          .input('addrId', sql.Int, addrId)
          .input('total', sql.Decimal(15, 2), variant.GiaBan)
          .input('orderDate', sql.DateTime, orderDate)
          .query(`INSERT INTO DonHang (MaNguoiDung, MaCuaHang, MaDiaChi, TongTien, TienGiamGia, TienThanhToan, PhuongThucThanhToan, TrangThaiThanhToan, TrangThaiDonHang, PhiVanChuyen, NgayTao)
                  VALUES (@uid, @shopId, @addrId, @total, 0, @total, N'CHUYEN_KHOAN', N'DA_THANH_TOAN', N'DA_GIAO', 15000, @orderDate);
                  SELECT SCOPE_IDENTITY() AS id`);

        const orderId = orderResult.recordset[0]?.id;
        if (!orderId) continue;

        // Order detail
        await pool.request()
          .input('orderId', sql.Int, orderId)
          .input('variantId', sql.Int, variant.MaPhienBan)
          .input('price', sql.Decimal(15, 2), variant.GiaBan)
          .query(`INSERT INTO ChiTietDonHang (MaDonHang, MaPhienBan, SoLuong, GiaLucMua)
                  VALUES (@orderId, @variantId, 1, @price)`);

        // Review
        await pool.request()
          .input('uid', sql.Int, reviewerId)
          .input('pid', sql.Int, product.MaSanPham)
          .input('orderId', sql.Int, orderId)
          .input('score', sql.Int, review.score)
          .input('text', sql.NVarChar, review.text)
          .input('reviewDate', sql.DateTime, reviewDate)
          .query(`INSERT INTO DanhGiaSanPham (MaNguoiDung, MaSanPham, MaDonHang, DiemDanhGia, BinhLuan, NgayTao)
                  VALUES (@uid, @pid, @orderId, @score, @text, @reviewDate)`);

        reviewCount++;
      }
    }
    console.log(`Created ${reviewCount} reviews`);

    // Update average ratings
    await pool.request().query(`
      UPDATE SanPham SET DanhGiaTrungBinh = (
        SELECT ISNULL(AVG(CAST(DiemDanhGia AS DECIMAL(3,2))), 0)
        FROM DanhGiaSanPham WHERE MaSanPham = SanPham.MaSanPham
      )
      WHERE MaSanPham IN (SELECT DISTINCT MaSanPham FROM DanhGiaSanPham)
    `);
    console.log('Updated average ratings');

    // Summary
    const counts = await pool.request().query(`
      SELECT 'NguoiDung' AS [Table], COUNT(*) AS [Count] FROM NguoiDung
      UNION ALL SELECT 'CuaHang', COUNT(*) FROM CuaHang
      UNION ALL SELECT 'SanPham', COUNT(*) FROM SanPham
      UNION ALL SELECT 'DanhGiaSanPham', COUNT(*) FROM DanhGiaSanPham
      UNION ALL SELECT 'HinhAnhSanPham', COUNT(*) FROM HinhAnhSanPham
    `);
    console.log('\n=== Summary ===');
    counts.recordset.forEach(r => console.log(`${r.Table}: ${r.Count}`));

    console.log('\n=== Done! ===');
  } catch (error) {
    console.error('Seed error:', error);
  } finally {
    await closePool();
  }
}

seed();
