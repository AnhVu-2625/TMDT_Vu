require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const { getPool, sql, closePool } = require('../config/database');

const data = [
  // Shop 5 - Fashion House
  { slug: 'ao-thun-cotton-cao-cap', name: '\u00C1o Thun Cotton Cao C\u1EA5p', desc: '\u00C1o thun nam ch\u1EA5t cotton 100% cao c\u1EA5p, m\u1EC1m m\u1EA1i, th\u1EA5m h\u00FAt t\u1ED1t', img: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=640&h=640&fit=crop' },
  { slug: 'quan-jean-nam-slim-fit', name: 'Qu\u1EA7n Jean Nam Slim Fit', desc: 'Qu\u1EA7n jean nam ch\u1EA5t denim cao c\u1EA5p, co gi\u00E3n 4 chi\u1EC1u', img: 'https://images.unsplash.com/photo-1542272454315-4c01d7abdf4a?w=640&h=640&fit=crop' },
  { slug: 'ao-khoac-bomber-nam-moi', name: '\u00C1o Kho\u00E1c Bomber Nam', desc: '\u00C1o kho\u00E1c bomber nam th\u1EDDi trang, ch\u1EA5t d\u00F9 b\u00F3ng cao c\u1EA5p, l\u00F3t \u1EA5m', img: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=640&h=640&fit=crop' },
  { slug: 'vay-den-nu-thoi-trang', name: 'V\u00E1y \u0110en N\u1EEF Th\u1EDDi Trang', desc: 'V\u00E1y \u0111en n\u1EEF li\u1EC1n th\u1EDDi trang, ch\u1EA5t li\u1EC7u cao c\u1EA5p', img: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=640&h=640&fit=crop' },
  { slug: 'so-mi-trang-nam-cong-so', name: 'S\u01A1 Mi Tr\u1EAFng Nam C\u00F4ng S\u1EDF', desc: '\u00C1o s\u01A1 mi tr\u1EAFng nam cotton-poly, kh\u00F4ng nh\u00E0u', img: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=640&h=640&fit=crop' },
  // Shop 6 - Home Living
  { slug: 'bo-an-gia-dinh-cao-cap', name: 'B\u1ED9 \u0102n Gia \u0110\u00ECnh Cao C\u1EA5p', desc: 'B\u1ED9 \u0103n 6 ng\u01B0\u1EDDi g\u1ED3m b\u00E1t, \u0111\u0129a, th\u00ECa - g\u1ED1m s\u1EE9 B\u00E1t Tr\u00E0ng', img: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=640&h=640&fit=crop' },
  { slug: 'noi-chien-khong-dau-55l', name: 'N\u1ED3i Chi\u00EAn Kh\u00F4ng D\u1EA7u 5.5L', desc: 'N\u1ED3i chi\u00EAn kh\u00F4ng d\u1EA7u 5.5L, 1700W, 8 ch\u01B0\u01A1ng tr\u00ECnh', img: 'https://images.unsplash.com/photo-1584990347449-a6f0eae1b06f?w=640&h=640&fit=crop' },
  { slug: 'may-loc-nuoc-ro-8-loi', name: 'M\u00E1y L\u1ECDc N\u01B0\u1EDBc RO 8 L\u00F5i', desc: 'M\u00E1y l\u1ECDc n\u01B0\u1EDBc RO 8 l\u00F5i, 10L/h, b\u00ECnh ch\u1EE9a 8L', img: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=640&h=640&fit=crop' },
  { slug: 'den-ban-led-chong-moi', name: '\u0110\u00E8n B\u00E0n LED Ch\u1ED1ng M\u1ECFi', desc: '\u0110\u00E8n b\u00E0n LED 5 ch\u1EBF \u0111\u1ED9 s\u00E1ng, s\u1EA1c USB', img: 'https://images.unsplash.com/photo-1507473885765-e6ed057ab6fe?w=640&h=640&fit=crop' },
  { slug: 'bo-chan-ga-goi-cao-su', name: 'B\u1ED9 Ch\u0103n Ga G\u1ED1i Cao Su', desc: 'B\u1ED9 ch\u0103n ga g\u1ED1i cao su non 8cm, cotton tho\u00E1ng m\u00E1t', img: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=640&h=640&fit=crop' },
  // Shop 7 - Book Worm
  { slug: 'doc-nhan-gian-tap-1', name: '\u0110\u1ECDc Nh\u1EABn Gian - T\u1EADp 1', desc: 'Ti\u1EC3u thuy\u1EBFt ki\u1EBFm hi\u1EC7p c\u1EE7a Huy\u1EC1n Huy\u1EC1n T\u1EED', img: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=640&h=640&fit=crop' },
  { slug: 'nha-gia-kim', name: 'Nh\u00E0 Gi\u1EA3 Kim', desc: 'Ti\u1EC3u thuy\u1EBFt tri\u1EBFt h\u1ECDc c\u1EE7a Paulo Coelho', img: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=640&h=640&fit=crop' },
  { slug: 'harry-potter-bo-7-tap', name: 'Harry Potter B\u1ED9 7 T\u1EADp', desc: 'B\u1ED9 Harry Potter \u0111\u1EA7y \u0111\u1EE7 7 t\u1EADp, b\u00ECa c\u1EE9ng \u00E1p kim', img: 'https://images.unsplash.com/photo-1621351183012-e2f9972dd9bf?w=640&h=640&fit=crop' },
  { slug: 'toi-thay-hoa-vang-tren-co-xanh', name: 'T\u00F4i Th\u1EA5y Hoa V\u00E0ng Tr\u00EAn C\u1ECF Xanh', desc: 'Truy\u1EC7n d\u00E0i c\u1EE7a Nguy\u1EC5n Nh\u1EADt \u00C1nh', img: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=640&h=640&fit=crop' },
  { slug: 'atomic-habits', name: 'Atomic Habits', desc: 'Th\u00F3i quen nguy\u00EAn t\u1EED - s\u00E1ch ph\u00E1t tri\u1EC3n b\u1EA3n th\u00E2n', img: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=640&h=640&fit=crop' },
  // Shop 8 - Beauty Care
  { slug: 'serum-vitamin-c-nhat-han', name: 'Serum Vitamin C Nh\u1EADt H\u00E0n', desc: 'Serum Vitamin C 15% + EGF, t\u00E1i t\u1EA1o da, m\u1EDD th\u00E2m n\u00E1m', img: 'https://images.unsplash.com/photo-1570194065650-d99fb4ee8e39?w=640&h=640&fit=crop' },
  { slug: 'kem-chong-nang-spf50', name: 'Kem Ch\u1ED1ng N\u1EAFng SPF50+', desc: 'Kem ch\u1ED1ng n\u1EAFng v\u1EADt l\u00FD SPF50+ PA+++, l\u00E0nh t\u00EDnh', img: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=640&h=640&fit=crop' },
  { slug: 'sua-rua-mat-tra-xanh', name: 'S\u1EEFa R\u1EEDa M\u1EB7t Tr\u00E0 Xanh', desc: 'S\u1EEFa r\u1EEDa m\u1EB7t tr\u00E0 xanh Nh\u1EADt B\u1EA3n, s\u1EA1ch s\u00E2u, se kh\u00EDt l\u1ED7 ch\u00E2n l\u00F4ng', img: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=640&h=640&fit=crop' },
  { slug: 'son-moi-dot-li-cao-cap', name: 'Son M\u00F4i \u0110\u1ECF L\u00EC Cao C\u1EA5p', desc: 'Son m\u00F4i d\u1EA1ng th\u1ECFi l\u00EC, l\u00EAn m\u00E0u chu\u1EA9n, \u0103n m\u00F4i \u0111\u1EB9p', img: 'https://images.unsplash.com/photo-1631214524020-7e18db9a8f92?w=640&h=640&fit=crop' },
  { slug: 'kem-duong-the-body-400ml', name: 'Kem D\u01B0\u1EE1ng Th\u1EC3 Body 400ml', desc: 'Kem d\u01B0\u1EE1ng th\u1EC3 tinh d\u1EA7u d\u1EEBa, d\u01B0\u1EE1ng \u1EA9m 24h', img: 'https://images.unsplash.com/photo-1612817288484-6f916006741a?w=640&h=640&fit=crop' },
  // Shop 9 - Gear Zone
  { slug: 'ban-phim-co-logitech-g-pro', name: 'B\u00E0n Ph\u00EDm C\u01A1 Logitech G Pro', desc: 'B\u00E0n ph\u00EDm c\u01A1 Logitech G Pro X, switch GX Blue, RGB, Tenkeyless', img: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=640&h=640&fit=crop' },
  { slug: 'chuot-gaming-razer-deathadder', name: 'Chu\u1ED9t Gaming Razer DeathAdder', desc: 'Razer DeathAdder V3, sensor 30K DPI, si\u00EAu nh\u1EB9 59g', img: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=640&h=640&fit=crop' },
  { slug: 'tai-nghe-gaming-steelseries', name: 'Tai Nghe Gaming SteelSeries', desc: 'SteelSeries Arctis 7+, 7.1 \u1EA3o, pin 30h, kh\u00F4ng d\u00E2y', img: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=640&h=640&fit=crop' },
  { slug: 'ghe-gaming-cong-thai-hoc', name: 'Gh\u1EBF Gaming C\u00F4ng Th\u00E1i H\u1ECDc', desc: 'Gh\u1EBF gaming t\u1EF1a l\u01B0\u1EDBi, tay v\u1ECBn 4D, ng\u1EFFa 180 \u0111\u1ED9', img: 'https://images.unsplash.com/photo-1586105251261-72a756497a11?w=640&h=640&fit=crop' },
  { slug: 'lot-chuot-xxl-sieu-lon', name: 'L\u00F3t Chu\u1ED9t XXL Si\u00EAu L\u1EDBn', desc: 'L\u00F3t chu\u1ED9t gaming 900x400mm, v\u1EA3i m\u1ECBn, kh\u00E2u vi\u1EC1n ch\u1ED1ng t\u01A1', img: 'https://images.unsplash.com/photo-1587778080078-5ad9cb51d19e?w=640&h=640&fit=crop' },
  // Shop 10 - Food Market
  { slug: 'mat-ong-nguyen-chat-500g', name: 'M\u1EADt Ong Nguy\u00EAn Ch\u1EA5t 500g', desc: 'M\u1EADt ong r\u1EEBng nguy\u00EAn ch\u1EA5t t\u1EEB C\u00FAc Ph\u01B0\u01A1ng, gi\u00E0u d\u01B0\u1EE1ng ch\u1EA5t', img: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=640&h=640&fit=crop' },
  { slug: 'ca-phe-arabica-da-lat', name: 'C\u00E0 Ph\u00EA Arabica \u0110\u00E0 L\u1EA1t', desc: 'C\u00E0 ph\u00EA Arabica s\u1EA1ch 100% t\u1EEB \u0110\u00E0 L\u1EA1t, rang m\u1EE9c v\u1EEBa', img: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=640&h=640&fit=crop' },
  { slug: 'hat-dieu-rang-muoi-1kg', name: 'H\u1EA1t \u0110i\u1EC1u Rang Mu\u1ED1i 1kg', desc: 'H\u1EA1t \u0111i\u1EC1u nh\u00E2n rang mu\u1ED1i B\u00ECnh Ph\u01B0\u1EDBc, gi\u00F2n th\u01A1m', img: 'https://images.unsplash.com/photo-1565981222-14e6b6a6b0f0?w=640&h=640&fit=crop' },
  { slug: 'yen-mach-nguyen-hat-1kg', name: 'Y\u1EBFn M\u1EA1ch Nguy\u00EAn H\u1EA1t 1kg', desc: 'Y\u1EBFn m\u1EA1ch \u00DAc nguy\u00EAn h\u1EA1t 100%, gi\u00E0u ch\u1EA5t x\u01A1', img: 'https://images.unsplash.com/photo-1588516903720-8ceb67f9ef84?w=640&h=640&fit=crop' },
  { slug: 'tra-oolong-dao-tan-cuong-250g', name: 'Tr\u00E0 Oolong \u0110\u00E0o T\u00E2n C\u01B0\u01A1ng 250g', desc: 'Tr\u00E0 Oolong Th\u00E1i Nguy\u00EAn cao c\u1EA5p, h\u01B0\u01A1ng hoa t\u1EF1 nhi\u00EAn', img: 'https://images.unsplash.com/photo-1563911892437-1feda0179e1b?w=640&h=640&fit=crop' },
  // Shop 11 - Sports Plus
  { slug: 'giay-chay-bo-nike-air-max', name: 'Gi\u00E0y Ch\u1EA1y B\u1ED9 Nike Air Max', desc: 'Nike Air Max 2024, \u00EAm \u00E1i Air Sole, breathable mesh', img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=640&h=640&fit=crop' },
  { slug: 'ao-thun-the-thao-adidas', name: '\u00C1o Thun Th\u1EC3 Thao Adidas', desc: '\u00C1o thun Adidas AEROREADY, th\u1EA5m h\u00FAt m\u1ED3 h\u00F4i', img: 'https://images.unsplash.com/photo-1572495641004-28421a5c1f6c?w=640&h=640&fit=crop' },
  { slug: 'ta-tap-gym-20kg', name: 'T\u1EA1 T\u1EADp Gym 20kg', desc: 'T\u1EA1 t\u1EADp cao su kh\u00F4ng m\u00F9i, b\u1ED9 2 qu\u1EA3 10kg + thanh \u0111\u00F2n', img: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=640&h=640&fit=crop' },
  { slug: 'bong-da-nike-premier-league', name: 'B\u00F3ng \u0110\u00E1 Nike Premier League', desc: 'B\u00F3ng \u0111\u00E1 Nike Flight 2024, size 5, chu\u1EA9n b\u00F3ng k\u00EDch th\u01B0\u1EDBc', img: 'https://images.unsplash.com/photo-1614632537423-0e1c2a5a8e06?w=640&h=640&fit=crop' },
  { slug: 'tham-tap-yoga-cao-cap', name: 'Th\u1EA3m T\u1EADp Yoga Cao C\u1EA5p', desc: 'Th\u1EA3m t\u1EADp yoga TPE ch\u1ED1ng tr\u01B0\u1EE3t, d\u00E0y 6mm, kh\u00E1ng khu\u1EA9n', img: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=640&h=640&fit=crop' },
  // Shop 12 - Digital World
  { slug: 'tu-lanh-lg-inverter-300l', name: 'T\u1EE7 L\u1EA1nh LG Inverter 300L', desc: 'T\u1EE7 l\u1EA1nh LG Inverter 300L, Door-In-Door, kh\u00E1ng khu\u1EA9n', img: 'https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=640&h=640&fit=crop' },
  { slug: 'may-giat-lg-inverter-9kg', name: 'M\u00E1y Gi\u1EB7t LG Inverter 9kg', desc: 'M\u00E1y gi\u1EB7t c\u1EEDa ngang LG Inverter 9kg, gi\u1EB7t h\u01A1i n\u01B0\u1EDBc', img: 'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=640&h=640&fit=crop' },
  { slug: 'tv-samsung-qled-65-inch-4k', name: 'TV Samsung QLED 65 inch 4K', desc: 'TV Samsung QLED 4K 65 inch, HDR10+, Smart Hub', img: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=640&h=640&fit=crop' },
  { slug: 'may-lanh-inverter-12000btu', name: 'M\u00E1y L\u1EA1nh Inverter 12000BTU', desc: 'M\u00E1y l\u1EA1nh Daikin Inverter 12000BTU, ti\u1EBFt ki\u1EC7m \u0111i\u1EC7n', img: 'https://images.unsplash.com/photo-1631635589499-afdea35b45b8?w=640&h=640&fit=crop' },
  { slug: 'may-hut-bui-robot', name: 'M\u00E1y H\u00FAt B\u1EE5i Robot', desc: 'Robot h\u00FAt b\u1EE5i Xiaomi, LiDAR, h\u00FAt 4000Pa, t\u1EF1 \u0111\u1ED5 r\u00E1c', img: 'https://images.unsplash.com/photo-1585155770447-2f66e2a397b5?w=640&h=640&fit=crop' },
  // Shop 13 - Pet Love
  { slug: 'thuc-an-cho-royal-canin-75kg', name: 'Th\u1EE9c \u0102n Ch\u00F3 Royal Canin 7.5kg', desc: 'Th\u1EE9c \u0103n cao c\u1EA5p cho ch\u00F3 Royal Canin, \u0111\u1EA7y \u0111\u1EE7 d\u01B0\u1EE1ng ch\u1EA5t', img: 'https://images.unsplash.com/photo-1565708098709-5c0e4e42b63e?w=640&h=640&fit=crop' },
  { slug: 'cat-ve-sinh-cho-meo-10l', name: 'C\u00E1t V\u1EC7 Sinh Cho M\u00E8o 10L', desc: 'C\u00E1t v\u1EC7 sinh Bentonite Nh\u1EADt B\u1EA3n, kh\u1EED m\u00F9i t\u1ED1t, v\u00F3n c\u1EE5c', img: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=640&h=640&fit=crop' },
  { slug: 'nha-ve-sinh-cho-cho-meo', name: 'Nh\u00E0 V\u1EC7 Sinh Cho Ch\u00F3 M\u00E8o', desc: 'Nh\u00E0 v\u1EC7 sinh th\u00F4ng minh, khay \u0111\u00E1y k\u00EDn, d\u1EC5 v\u1EC7 sinh', img: 'https://images.unsplash.com/photo-1592194996308-7b43878e84a6?w=640&h=640&fit=crop' },
  { slug: 'day-dat-cho-chong-can', name: 'D\u00E2y D\u1EAFt Ch\u00F3 Ch\u1ED1ng C\u1EAFn', desc: 'D\u00E2y d\u1EAFt ch\u00F3 v\u1EA3i nylon ch\u1EAFc ch\u1EAFn 1.5m, kh\u00F3a xoay 360', img: 'https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=640&h=640&fit=crop' },
  { slug: 'o-cho-meo-cao-cap-3-tang', name: '\u1ED4 Cho M\u00E8o Cao C\u1EA5p 3 T\u1EA7ng', desc: '\u1ED4 m\u00E8o 3 t\u1EA7ng, khung g\u1ED7, n\u1EC7m \u00EAm, c\u00F3 tr\u1EE5 c\u00E0o m\u00F3ng', img: 'https://images.unsplash.com/photo-1595246140625-573b715d11c8?w=640&h=640&fit=crop' },
];

async function fix() {
    const pool = await getPool();
    let fixed = 0;
    for (const item of data) {
        await pool.request()
            .input('slug', sql.NVarChar, item.slug)
            .input('name', sql.NVarChar, item.name)
            .input('desc', sql.NVarChar, item.desc)
            .query('UPDATE SanPham SET TenSanPham = @name, MoTa = @desc WHERE DuongDan = @slug');
        
        // Add image if missing
        const prod = await pool.request()
            .input('slug', sql.NVarChar, item.slug)
            .query('SELECT MaSanPham FROM SanPham WHERE DuongDan = @slug');
        if (prod.recordset.length > 0) {
            const pid = prod.recordset[0].MaSanPham;
            const imgCheck = await pool.request()
                .input('pid', sql.Int, pid)
                .query('SELECT MaHinhAnh FROM HinhAnhSanPham WHERE MaSanPham = @pid');
            if (imgCheck.recordset.length === 0 && item.img) {
                await pool.request()
                    .input('pid', sql.Int, pid)
                    .input('img', sql.NVarChar, item.img)
                    .query('INSERT INTO HinhAnhSanPham (MaSanPham, DuongDanAnh, LaAnhChinh) VALUES (@pid, @img, 1)');
            }
        }
        fixed++;
    }
    console.log('Fixed ' + fixed + ' products');
    
    // Fix shop 12 description
    await pool.request()
        .input('id', sql.Int, 12)
        .input('desc', sql.NVarChar, '\u0110i\u1EC7n m\u00E1y - Gia d\u1EE5ng ch\u00EDnh h\u00E3ng - T\u1EE7 l\u1EA1nh, m\u00E1y gi\u1EB7t, TV')
        .query('UPDATE CuaHang SET MoTa = @desc WHERE MaCuaHang = @id');
    console.log('Fixed shop 12 desc');
    
    await closePool();
    console.log('All done!');
}

fix().catch(console.error);