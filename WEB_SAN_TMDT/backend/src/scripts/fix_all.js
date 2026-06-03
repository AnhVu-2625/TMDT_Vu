require('dotenv').config({ path: require('path').join(__dirname, "../../.env") });
var { getPool, sql, closePool } = require("../config/database");

var catImages = {
    "dien-thoai": ["https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=640&h=640&fit=crop", "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=640&h=640&fit=crop", "https://images.unsplash.com/photo-1616348436168-de43ad0db179?w=640&h=640&fit=crop"],
    "laptop": ["https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=640&h=640&fit=crop", "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=640&h=640&fit=crop"],
    "tai-nghe": ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=640&h=640&fit=crop", "https://images.unsplash.com/photo-1606841837239-c5a1a4a07af7?w=640&h=640&fit=crop"],
    "gaming": ["https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=640&h=640&fit=crop", "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=640&h=640&fit=crop"],
    "sach": ["https://images.unsplash.com/photo-1532012197267-da84d127e765?w=640&h=640&fit=crop", "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=640&h=640&fit=crop"],
    "dien-tu": ["https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=640&h=640&fit=crop", "https://images.unsplash.com/photo-1550009158-9ebf691452e1?w=640&h=640&fit=crop"]
};

var productFixes = [
    { id: 1, name: "Samsung Galaxy S24 Ultra", desc: "\u0110i\u1EC7n tho\u1EA1i cao c\u1EA5p, m\u00E0n h\u00ECnh Dynamic AMOLED 2X, chip Snapdragon 8 Gen 3", img: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=640&h=640&fit=crop" },
    { id: 2, name: "iPhone 15 Pro Max", desc: "iPhone cao c\u1EA5p, chip A17 Pro, camera 48MP, Dynamic Island", img: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=640&h=640&fit=crop" },
    { id: 3, name: "MacBook Pro 14 M3 Pro", desc: "Laptop chuy\u00EAn nghi\u1EC7p, chip M3 Pro, RAM 18GB, m\u00E0n h\u00ECnh Liquid Retina XDR", img: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=640&h=640&fit=crop" },
    { id: 4, name: "Sony WH-1000XM5", desc: "Tai nghe ch\u1ED1ng \u1ED3n h\u00E0ng \u0111\u1EA7u, \u00E2m thanh Hi-Res, pin 30 gi\u1EDD", img: "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=640&h=640&fit=crop" },
];

async function fixAll() {
    var pool = await getPool();
    
    // 1. Fix specific original products
    for (var i = 0; i < productFixes.length; i++) {
        var p = productFixes[i];
        await pool.request()
            .input("id", sql.Int, p.id)
            .input("name", sql.NVarChar, p.name)
            .input("desc", sql.NVarChar, p.desc)
            .query("UPDATE SanPham SET TenSanPham = @name, MoTa = @desc WHERE MaSanPham = @id");
        var img = await pool.request()
            .input("id", sql.Int, p.id)
            .query("SELECT MaHinhAnh FROM HinhAnhSanPham WHERE MaSanPham = @id");
        if (img.recordset.length === 0) {
            await pool.request()
                .input("id", sql.Int, p.id)
                .input("img", sql.NVarChar, p.img)
                .query("INSERT INTO HinhAnhSanPham (MaSanPham, DuongDanAnh, LaAnhChinh) VALUES (@id, @img, 1)");
        }
        console.log("Fixed #" + p.id + ": " + p.name);
    }
    
    // 2. Get ALL products missing images
    var missing = await pool.request()
        .query("SELECT sp.MaSanPham, sp.TenSanPham, sp.MaDanhMuc FROM SanPham sp WHERE sp.MaSanPham NOT IN (SELECT DISTINCT MaSanPham FROM HinhAnhSanPham)");
    console.log("Products missing images: " + missing.recordset.length);
    
    // Build category map
    var catRows = await pool.request().query("SELECT MaDanhMuc, DuongDan FROM DanhMucSanPham");
    var catMap = {};
    for (var c of catRows.recordset) { catMap[c.MaDanhMuc] = c.DuongDan; }
    
    var imgIdx = {};
    for (var p2 of missing.recordset) {
        var cat = catMap[p2.MaDanhMuc] || "dien-tu";
        if (!imgIdx[cat]) imgIdx[cat] = 0;
        var imgs = catImages[cat] || catImages["dien-tu"];
        var url = imgs[imgIdx[cat] % imgs.length];
        imgIdx[cat] = (imgIdx[cat] + 1) % imgs.length;
        await pool.request()
            .input("id", sql.Int, p2.MaSanPham)
            .input("img", sql.NVarChar, url)
            .query("INSERT INTO HinhAnhSanPham (MaSanPham, DuongDanAnh, LaAnhChinh) VALUES (@id, @img, 1)");
    }
    console.log("Added " + missing.recordset.length + " images");
    
    // 3. Fix corrupted text - remove ? and restore
    var bad = await pool.request()
        .query("SELECT MaSanPham, TenSanPham FROM SanPham WHERE TenSanPham LIKE '%?%'");
    console.log("Products with corrupted names: " + bad.recordset.length);
    
    for (var p3 of bad.recordset) {
        var clean = p3.TenSanPham.split("?").join("").trim();
        // Fix common patterns
        clean = clean.split("ch?t").join("ch\u1EA5t");
        clean = clean.split("ch?n").join("ch\u1EAFn");
        clean = clean.split("d?n").join("d\u1EABn");
        clean = clean.split("b?ng").join("b\u1EA3ng");
        clean = clean.split("l?i").join("l\u1ED7i");
        clean = clean.split("n?i").join("n\u1ED5i");
        if (clean.length > 0 && clean !== p3.TenSanPham) {
            await pool.request()
                .input("id", sql.Int, p3.MaSanPham)
                .input("name", sql.NVarChar, clean)
                .query("UPDATE SanPham SET TenSanPham = @name WHERE MaSanPham = @id");
            console.log("Fixed name: " + p3.TenSanPham + " -> " + clean);
        }
    }
    
    await closePool();
    console.log("ALL DONE!");
}

fixAll().catch(function(e) { console.error(e.message); });