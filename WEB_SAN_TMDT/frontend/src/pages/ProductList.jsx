import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaFilter, FaSearch, FaSlidersH, FaTimes, FaChevronDown, FaStar, FaThLarge, FaList, FaArrowRight, FaTags, FaSortAmountDown, FaMobileAlt, FaTshirt, FaHome, FaBook, FaPaintBrush, FaGamepad, FaHamburger, FaDumbbell } from 'react-icons/fa';
import { useProductStore } from '../store/productStore';
import ProductCard from '../components/ProductCard';

const sortOptions = [
  { value: 'newest', label: 'Mới nhất' },
  { value: 'bestseller', label: 'Bán chạy nhất' },
  { value: 'price_asc', label: 'Giá thấp → cao' },
  { value: 'price_desc', label: 'Giá cao → thấp' },
  { value: 'rating', label: 'Đánh giá cao nhất' },
];

const categoryList = [
  { value: '', label: 'Tất cả', icon: FaTags },
  { value: 'dien-tu', label: 'Điện tử', icon: FaMobileAlt },
  { value: 'thoi-trang', label: 'Thời trang', icon: FaTshirt },
  { value: 'gia-dung', label: 'Gia dụng', icon: FaHome },
  { value: 'sach', label: 'Sách', icon: FaBook },
  { value: 'my-pham', label: 'Mỹ phẩm', icon: FaPaintBrush },
  { value: 'gaming', label: 'Gaming', icon: FaGamepad },
  { value: 'thuc-pham', label: 'Thực phẩm', icon: FaHamburger },
  { value: 'the-thao', label: 'Thể thao', icon: FaDumbbell },
];

const priceRanges = [
  { label: 'Tất cả', min: 0, max: 0 },
  { label: 'Dưới 100K', min: 0, max: 100000 },
  { label: '100K - 500K', min: 100000, max: 500000 },
  { label: '500K - 1M', min: 500000, max: 1000000 },
  { label: '1M - 5M', min: 1000000, max: 5000000 },
  { label: 'Trên 5M', min: 5000000, max: 0 },
];

const productCatalog = [
  // Điện tử (MaDanhMuc: 1)
  { name: 'Samsung Galaxy S24 Ultra', image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=400&q=80', category: 1, store: 'Tech Store', rating: 4.5,
    MoTa: 'Điện thoại flagship Galaxy S24 Ultra sở hữu màn hình Dynamic AMOLED 2X 6.8 inch, chip Snapdragon 8 Gen 3 mạnh mẽ, camera 200MP với khả năng zoom quang học 10x. Bút S-Pen tích hợp, pin 5000mAh, sạc nhanh 45W. Khung titan sang trọng, kháng nước IP68.' },
  { name: 'Laptop ASUS VivoBook 15', image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&q=80', category: 1, store: 'Tech Store', rating: 4.0,
    MoTa: 'ASUS VivoBook 15 trang bị Intel Core i5 thế hệ 13, RAM 8GB, SSD 512GB, màn hình 15.6 inch Full HD. Thiết kế mỏng nhẹ 1.7kg, bản lề 180°, bàn phím có đèn nền. Pin liên tục 8 giờ, đáp ứng tốt nhu cầu học tập và làm việc văn phòng.' },
  { name: 'Tai nghe Sony WH-1000XM5', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80', category: 1, store: 'Tech Store', rating: 4.5,
    MoTa: 'Tai nghe chống ồn chủ động hàng đầu Sony WH-1000XM5 với công nghệ HD Noise Cancelling QN1. Âm thanh Hi-Res 30mm, hỗ trợ LDAC và DSEE Extreme. Thời gian pin 30 giờ, sạc nhanh 3 phút nghe 3 giờ. Thiết kế gập gọn, kết nối đa thiết bị.' },
  { name: 'Apple Watch Series 9', image: 'https://images.unsplash.com/photo-1546868871-af0de0ae72bf?w=400&q=80', category: 1, store: 'Tech Store', rating: 4.0,
    MoTa: 'Apple Watch Series 9 với chip S9 tốc độ cao, màn hình Retina LTPO OLED 1.9 inch luôn sáng. Cảm biến đo nhịp tim, SpO2, nhiệt độ cơ thể. Tích hợp GPS, kháng nước 50m, hỗ trợ tập luyện đa môn thể thao. watchOS 10 với nhiều tính năng sức khỏe mới.' },
  { name: 'Máy ảnh Canon EOS R50', image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400&q=80', category: 1, store: 'Tech Store', rating: 4.5,
    MoTa: 'Máy ảnh mirrorless Canon EOS R50 cảm biến APS-C 24.2MP, xử lý DIGIC X. Quay video 4K 30fps, lấy nét tự động Dual Pixel CMOS AF II. Màn hình cảm ứng xoay lật, ngắm điện tử OLED. Kết nối WiFi/Bluetooth, phù hợp cho người mới và vlogger.' },
  { name: 'Loa bluetooth JBL Flip 6', image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&q=80', category: 1, store: 'Tech Store', rating: 4.0,
    MoTa: 'Loa di động JBL Flip 6 với công suất 30W, âm trầm mạnh mẽ từ driver hình chữ nhật. Chống nước IP67, pin 12 giờ, có thể ghép đôi stereo. Thiết kế nhỏ gọn dễ mang theo, kết nối Bluetooth 5.1 ổn định. Phù hợp cho tiệc tùng và dã ngoại.' },
  // Thời trang (MaDanhMuc: 2)
  { name: 'Áo thun nam cổ tròn', image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&q=80', category: 2, store: 'Fashion Hub', rating: 4.0,
    MoTa: 'Áo thun nam cổ tròn chất liệu cotton 100% mềm mại, thấm hút mồ hôi tốt. Đường may chắc chắn, form regular fit thoải mái. Có sẵn nhiều màu sắc: trắng, đen, xám, navy. Phù hợp mặc hàng ngày, đi làm, đi chơi. Giặt không phai màu, co rút tối thiểu.' },
  { name: 'Giày thể thao Nike Air Max', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80', category: 2, store: 'Fashion Hub', rating: 4.5,
    MoTa: 'Giày Nike Air Max với đế Air-Sole ở gót chân cho cảm giác êm ái tối đa. Upper lưới thoáng khí, đệm dày, form chuẩn. Phù hợp chạy bộ, tập gym và đi hàng ngày. Đế cao su chống trượt, độ bền cao. Thiết kế thời trang, nhiều phối màu.' },
  { name: 'Balo du lịch Swissgear', image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&q=80', category: 2, store: 'Fashion Hub', rating: 4.0,
    MoTa: 'Balo Swissgear 1900 ScanSmart với ngăn laptop riêng chống sốc lên tới 15.6 inch. Chất liệu polyester chống thấm, khóa kéo YKK bền bỉ. Nhiều ngăn: chính, phụ, đựng chai nước, USB sạc ngoài. Quai đeo chỉnh lưng thoáng khí.' },
  { name: 'Áo khoác bomber nam', image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400&q=80', category: 2, store: 'Fashion Hub', rating: 3.5,
    MoTa: 'Áo khoác bomber nam phong cách Hàn Quốc, chất liệu vải dù dày dặn chống gió nhẹ. Lớp lót trong mềm mại giữ ấm. Cổ bẻ, tay bo, gấu bo. Có khóa kéo và túi hai bên. Phù hợp mùa thu đông, dễ phối đồ.' },
  // Gia dụng (MaDanhMuc: 3)
  { name: 'Máy lọc không khí Xiaomi', image: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=400&q=80', category: 3, store: 'Home Mart', rating: 4.0,
    MoTa: 'Máy lọc không khí Xiaomi Smart Air Purifier 4 với lọc HEPA H13, loại bỏ 99.97% bụi mịn PM2.5, phấn hoa, vi khuẩn. Diện tích phòng lên tới 48m². Kết nối Mi Home app, điều khiển bằng giọng nói. Màn hình OLED hiển thị chất lượng không khí realtime.' },
  { name: 'Nồi chiên không dầu Philips', image: 'https://images.unsplash.com/photo-1584992236310-6edddc08acff?w=400&q=80', category: 3, store: 'Home Mart', rating: 4.5,
    MoTa: 'Nồi chiên không dầu Philips Airfryer XXL 6.2L công suất 2000W. Công nghệ Rapid Air chiên giòn đều không cần dầu. 8 chế độ nấu tự động: khoai tây, gà, cá, bánh, nướng, sấy. Giỏ chống dính dễ vệ sinh, điều khiển cảm ứng.' },
  // Sách (MaDanhMuc: 4)
  { name: 'Sách "Nhà giả kim" - Paulo Coelho', image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&q=80', category: 4, store: 'Book Store', rating: 5.0,
    MoTa: 'Cuốn sách bán chạy nhất mọi thời đại của Paulo Coelho. Hành trình của chàng chăn cừu Santiago đi tìm kho báu, khám phá ra những bài học sâu sắc về cuộc sống, ước mơ và định mệnh. Ngôn từ giản dị mà triết lý sâu xa. Bản dịch tiếng Việt của Lê Chu Cầu.' },
  { name: 'Sách "Đắc nhân tâm" - Dale Carnegie', image: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=400&q=80', category: 4, store: 'Book Store', rating: 4.5,
    MoTa: 'Đắc nhân tâm - cuốn sách self-help kinh điển của Dale Carnegie dạy nghệ thuật ứng xử và giao tiếp. Bí quyết tạo thiện cảm, thuyết phục người khác, trở thành người lãnh đạo giỏi. Đã được dịch ra hơn 30 ngôn ngữ với hàng chục triệu bản.' },
  // Mỹ phẩm (MaDanhMuc: 5)
  { name: 'Nước hoa Chanel No5', image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=400&q=80', category: 5, store: 'Beauty Shop', rating: 4.5,
    MoTa: 'Chanel N°5 Eau de Parfum huyền thoại, biểu tượng của sự sang trọng. Hương thơm chủ đạo: aldehyd, hoa nhài, hoa hồng, gỗ đàn hương. Lưu hương 6-8 giờ. Thiết kế chai thủy tinh tối giản đặc trưng. Dung tích 50ml.' },
  { name: 'Kem dưỡng da L\'Oréal Revitalift', image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&q=80', category: 5, store: 'Beauty Shop', rating: 4.0,
    MoTa: 'Kem dưỡng da L\'Oréal Revitalift Laser Renew với thành phần Pro-Xylane và Collagen. Chống lão hóa, làm đầy nếp nhăn, tăng độ đàn hồi cho da. Kết cấu mỏng nhẹ thấm nhanh, không nhờn. Phù hợp da từ 30 tuổi trở lên. Hộp 50ml.' },
  // Gaming (MaDanhMuc: 6)
  { name: 'Chuột gaming Logitech G Pro', image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400&q=80', category: 6, store: 'Gaming Zone', rating: 4.5,
    MoTa: 'Chuột gaming Logitech G Pro X Superlight 2 với cảm biến HERO 2 lên tới 44,000 DPI. Siêu nhẹ chỉ 60g, kết nối Lightspeed không dây. Switch quang học LIGHTFORCE, pin 95 giờ. Thiết kế đối xứng phù hợp mọi grip. Phụ kiện eSports chuyên nghiệp.' },
  { name: 'Bàn phím cơ Razer BlackWidow', image: 'https://images.unsplash.com/photo-1541140532154-b024d1c0a78b?w=400&q=80', category: 6, store: 'Gaming Zone', rating: 4.0,
    MoTa: 'Bàn phím cơ Razer BlackWidow V4 với switch Razer Green clicky, độ nảy 50g. Đèn nền Chroma RGB từng phím. Aluminium top plate, wrist rest bằng memory foam. Phím macro lập trình được. Kết nối USB-C, N-key rollover.' },
  // Thực phẩm (MaDanhMuc: 7)
  { name: 'Hạt điều rang muối 500g', image: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=400&q=80', category: 7, store: 'Food Market', rating: 4.0,
    MoTa: 'Hạt điều rang muối nhập khẩu từ Bình Phước, hạt to tròn tự nhiên. Rang giòn nhẹ muối biển, không phẩm màu, không chất bảo quản. Đóng gói hút chân không 500g giữ trọn vị thơm béo. Giàu protein và khoáng chất, ăn vặt lành mạnh.' },
  { name: 'Trà xanh matcha Nhật Bản', image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&q=80', category: 7, store: 'Food Market', rating: 4.5,
    MoTa: 'Bột trà xanh matcha Nhật Bản loại ceremonial grade từ vùng Uji, Kyoto. Xay từ đá nghiền granite, màu xanh tươi, vị umami thanh ngọt. Giàu chất chống oxy hóa và L-theanine. Hũ 100g, pha được 50 tách, thích hợp pha trà và làm bánh.' },
  { name: 'Socola Bỉ Leonidas 250g', image: 'https://images.unsplash.com/photo-1606312619070-d48b4c652a52?w=400&q=80', category: 7, store: 'Food Market', rating: 4.5,
    MoTa: 'Socola Bỉ Leonidas hộp 250g với 12 viên nhân đa dạng: praliné, ganache, caramel, nougat. Công thức gia truyền từ năm 1913. Socola đen 53% cacao, bơ cacao tự nhiên. Không chất bảo quản, giữ lạnh khi vận chuyển. Quà tặng cao cấp.' },
  { name: 'Cà phê Arabica Đà Lạt 1kg', image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400&q=80', category: 7, store: 'Food Market', rating: 4.0,
    MoTa: 'Cà phê Arabica Đà Lạt nguyên chất 100%, độ cao 1500m. Hạt cà phê rang vừa, xay mịn, hương vị: chocolate, caramel, hạnh nhân. Đóng gói hút chân không 1kg giữ hương tươi. Pha phin hoặc máy espresso. Sản xuất từ nông trại hữu cơ tại Lâm Đồng.' },
  // Thể thao (MaDanhMuc: 8)
  { name: 'Bóng đá Adidas Champions League', image: 'https://images.unsplash.com/photo-1614632537423-0adaf5f5e2b1?w=400&q=80', category: 8, store: 'Sport Center', rating: 4.5,
    MoTa: 'Bóng đá Adidas UCL Pro chính hãng, kích thước size 5. Công nghệ Thermal Bonded giúp bóng tròn hoàn hảo, ít thấm nước. Mặt vỏ PU mềm, độ nảy ổn định. Thiết kế sao Champions League với các chấm sao đặc trưng. FIFA Quality Pro.' },
  { name: 'Máy chạy bộ điện Elipsport', image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&q=80', category: 8, store: 'Sport Center', rating: 4.0,
    MoTa: 'Máy chạy bộ điện Elipsport E30 với motor 2.5HP, tốc độ 1-16 km/h. Màn hình LCD hiển thị thời gian, quãng đường, calo. Có 12 chương trình tập, độ dốc điện 0-12%. Gập gọn tiết kiệm không gian. Tải trọng tối đa 120kg.' },
  { name: 'Vợt cầu lông Yonex Nanoray', image: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=400&q=80', category: 8, store: 'Sport Center', rating: 4.5,
    MoTa: 'Vợt cầu lông Yonex Nanoray 800 với khung H.M. Graphite siêu nhẹ 83g. Kỹ thuật Nanocell giúp khung cứng chắc mà linh hoạt. Điểm cân bằng đầu nặng, phù hợp đánh công lực. Căng lưới 24-28 lbs. Có bao vợt kèm theo.' },
];

const mockProducts = Array.from({ length: 36 }, (_, i) => {
  const base = productCatalog[i % productCatalog.length];
  return {
    MaSanPham: i + 1,
    TenSanPham: base.name,
    MaDanhMuc: base.category,
    GiaGoc: (i + 2) * 200000 + 50000,
    DanhGiaTrungBinh: base.rating,
    SoLuongDaBan: 50 + Math.floor(Math.random() * 500),
    TenCuaHang: base.store,
    isNew: i < 8, isHot: i >= 8 && i < 20,
    variants: [{ MaPhienBan: i + 1, GiaBan: (i + 2) * 175000 + 50000 }],
    AnhChinh: base.image,
    images: [{ DuongDanAnh: base.image }],
    MoTa: base.MoTa || `${base.name} — sản phẩm chất lượng cao đến từ ${base.store}. Đảm bảo chính hãng, giá tốt nhất thị trường, giao hàng toàn quốc.`,
  };
});

export default function ProductList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [localSearch, setLocalSearch] = useState(searchParams.get('search') || '');
  const [localShopSearch, setLocalShopSearch] = useState(searchParams.get('shop') || '');
  const [selectedPriceRange, setSelectedPriceRange] = useState(0);
  const [minRating, setMinRating] = useState(0);

  const currentSearch = searchParams.get('search') || '';
  const currentShop = searchParams.get('shop') || '';
  const currentCategory = searchParams.get('category') || '';
  const currentSort = searchParams.get('sort') || 'newest';

  const categorySlugToId = {
    'dien-tu': 1, 'thoi-trang': 2, 'gia-dung': 3,
    'sach': 4, 'my-pham': 5, 'gaming': 6,
    'thuc-pham': 7, 'the-thao': 8,
  };
  const currentCategoryId = categorySlugToId[currentCategory] || currentCategory;

  const { products, fetchProducts, loading } = useProductStore();
  const displayProducts = products.length > 0 ? products : mockProducts;

  useEffect(() => {
<<<<<<< HEAD
    fetchProducts({ search: currentSearch, shop: currentShop, category: currentCategory, sort: currentSort, limit: 20 });
  }, [currentSearch, currentShop, currentCategory, currentSort, fetchProducts]);
=======
    fetchProducts({ search: currentSearch, category: currentCategoryId, sort: currentSort, limit: 20 });
  }, [currentSearch, currentCategory, currentSort, fetchProducts]);
>>>>>>> 6b22ddd7f1495a754e75169ea503240ad3039d09


  const handleSearch = (e) => {
    e.preventDefault();
    const p = new URLSearchParams(searchParams);
    if (localSearch) p.set('search', localSearch); else p.delete('search');
    if (localShopSearch) p.set('shop', localShopSearch); else p.delete('shop');
    setSearchParams(p);
  };

  const updateParam = (key, value) => {
    const p = new URLSearchParams(searchParams);
    if (value) p.set(key, value); else p.delete(key);
    setSearchParams(p);
  };

  const filtered = displayProducts.filter(p => {
    const pr = priceRanges[selectedPriceRange];
    const price = p.variants?.[0]?.GiaBan || p.GiaGoc;
    if (pr.min > 0 && price < pr.min) return false;
    if (pr.max > 0 && price > pr.max) return false;
    if (minRating > 0 && (p.DanhGiaTrungBinh || 0) < minRating) return false;
    if (currentCategory && p.MaDanhMuc) {
      const catId = categorySlugToId[currentCategory];
      if (catId && p.MaDanhMuc !== catId) return false;
    }
    return true;
  });

  const FilterPanel = () => (
    <div className="space-y-6">
      {/* Shop Search */}
      <div>
        <h3 className="text-sm font-bold text-white mb-3 uppercase tracking-wider">Tìm cửa hàng</h3>
        <input 
          type="text"
          value={localShopSearch}
          onChange={(e) => setLocalShopSearch(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              const p = new URLSearchParams(searchParams);
              if (localShopSearch) p.set('shop', localShopSearch); else p.delete('shop');
              setSearchParams(p);
            }
          }}
          placeholder="Nhập tên cửa hàng..."
          className="w-full px-3 py-2 rounded-lg bg-slate-700 border border-slate-600 text-white text-sm placeholder-slate-400 focus:border-red-500 focus:outline-none transition"
        />
        {localShopSearch && (
          <button
            onClick={() => {
              setLocalShopSearch('');
              const p = new URLSearchParams(searchParams);
              p.delete('shop');
              setSearchParams(p);
            }}
            className="w-full mt-2 text-left px-3 py-2 rounded-lg text-sm text-slate-400 hover:bg-white/5 hover:text-white transition-all"
          >
            Xóa bộ lọc cửa hàng
          </button>
        )}
      </div>

      {/* Category */}
      <div>
        <h3 className="flex items-center gap-2 text-xs font-bold text-white/60 uppercase tracking-[0.15em] mb-3">
          <span className="w-3.5 h-px bg-red-500/50" /> Danh mục
        </h3>
        <div className="space-y-0.5">
          {categoryList.map(cat => {
            const Icon = cat.icon;
            return (
              <button key={cat.value}
                onClick={() => updateParam('category', cat.value)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${currentCategory === cat.value ? 'bg-gradient-to-r from-red-600/20 to-orange-600/10 text-red-400 border border-red-500/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]' : 'text-slate-400 hover:bg-white/[0.03] hover:text-white border border-transparent'}`}>
                <Icon size={13} className={currentCategory === cat.value ? 'text-red-400' : 'text-slate-600'} />
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h3 className="flex items-center gap-2 text-xs font-bold text-white/60 uppercase tracking-[0.15em] mb-3">
          <span className="w-3.5 h-px bg-red-500/50" /> Khoảng giá
        </h3>
        <div className="space-y-0.5">
          {priceRanges.map((range, i) => (
            <button key={range.label} onClick={() => setSelectedPriceRange(i)}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-all ${selectedPriceRange === i ? 'bg-gradient-to-r from-red-600/20 to-orange-600/10 text-red-400 border border-red-500/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]' : 'text-slate-400 hover:bg-white/[0.03] hover:text-white border border-transparent'}`}>
              {range.label}
            </button>
          ))}
        </div>
      </div>

      {/* Rating */}
      <div>
        <h3 className="flex items-center gap-2 text-xs font-bold text-white/60 uppercase tracking-[0.15em] mb-3">
          <span className="w-3.5 h-px bg-red-500/50" /> Đánh giá
        </h3>
        <div className="space-y-0.5">
          {[0, 3, 4, 4.5].map(r => (
            <button key={r} onClick={() => setMinRating(r)}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-sm flex items-center gap-2 transition-all ${minRating === r ? 'bg-gradient-to-r from-red-600/20 to-orange-600/10 text-red-400 border border-red-500/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]' : 'text-slate-400 hover:bg-white/[0.03] hover:text-white border border-transparent'}`}>
              {r === 0 ? 'Tất cả' : (
                <><div className="flex">{[...Array(5)].map((_, i) => <FaStar key={i} size={10} className={i < r ? 'text-yellow-400' : 'text-slate-700'} />)}</div> <span className="text-slate-500">trở lên</span></>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Clear filters */}
      {(currentCategory || selectedPriceRange > 0 || minRating > 0 || currentSearch) && (
        <button onClick={() => { setSearchParams({}); setSelectedPriceRange(0); setMinRating(0); }}
          className="w-full py-2.5 text-xs font-semibold text-red-400 bg-red-500/10 hover:bg-red-500/20 rounded-lg transition-all border border-red-500/10">
          Xóa tất cả bộ lọc
        </button>
      )}
    </div>
  );

  return (
    <div className="relative min-h-screen">
      {/* Background decorative elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-red-500/[0.03] blur-[120px]" />
        <div className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] rounded-full bg-orange-500/[0.03] blur-[120px]" />
        <div className="absolute top-2/3 left-1/2 w-[300px] h-[300px] rounded-full bg-blue-500/[0.02] blur-[100px]" />
      </div>

      {/* Page Header Banner */}
      <div className="relative bg-gradient-to-b from-slate-900/80 via-slate-900/40 to-transparent border-b border-slate-800/50 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-60 h-px bg-gradient-to-r from-transparent via-red-500/30 to-transparent" />
          <div className="absolute top-0 right-1/4 w-40 h-px bg-gradient-to-r from-transparent via-orange-500/20 to-transparent" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 py-10 md:py-14">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-3 mb-3">
              <span className="w-1 h-6 bg-gradient-to-b from-red-500 to-orange-500 rounded-full" />
              <h1 className="text-2xl md:text-3xl font-black text-white font-display tracking-tight">
                {currentSearch ? (
                  <>Kết quả cho "<span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400">{currentSearch}</span>"</>
                ) : 'Tất cả sản phẩm'}
              </h1>
            </div>
            <p className="text-slate-500 text-sm ml-4">
              <span className="text-red-400 font-semibold">{filtered.length}</span> sản phẩm được tìm thấy
            </p>
          </motion.div>

          {/* Search bar */}
          <motion.form
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            onSubmit={handleSearch}
            className="mt-6 flex gap-3"
          >
            <div className="relative flex-1 max-w-xl">
              <FaSearch size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
              <input type="text" value={localSearch} onChange={e => setLocalSearch(e.target.value)}
                placeholder="Tìm kiếm sản phẩm..."
                className="w-full bg-slate-900/80 border border-slate-700/60 text-white placeholder-slate-500 rounded-xl pl-11 pr-4 py-3 focus:outline-none focus:border-red-500/40 focus:ring-2 focus:ring-red-500/10 transition-all text-sm" />
              {localSearch && (
                <button type="button" onClick={() => setLocalSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-400">
                  <FaTimes size={13} />
                </button>
              )}
            </div>
            <button type="submit"
              className="px-6 py-3 bg-gradient-to-r from-red-600 to-orange-600 text-white font-semibold rounded-xl text-sm hover:shadow-lg hover:shadow-red-600/20 transition-all flex items-center gap-2">
              Tìm <FaSearch size={13} />
            </button>
            <button type="button" onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="flex items-center gap-2 px-4 py-3 bg-slate-800/80 border border-slate-700/50 hover:border-red-500/30 rounded-xl text-sm text-slate-400 hover:text-white transition-all md:hidden">
              <FaSlidersH size={14} /> Lọc
            </button>
          </motion.form>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Sort + View controls */}
        <div className="flex items-center justify-between mb-6 gap-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <FaSortAmountDown size={12} className="text-slate-500 shrink-0" />
            {sortOptions.map(opt => (
              <button key={opt.value} onClick={() => updateParam('sort', opt.value)}
                className={`whitespace-nowrap px-4 py-2 rounded-lg text-sm font-medium transition-all ${currentSort === opt.value ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-lg shadow-red-600/20' : 'bg-slate-800/40 text-slate-400 hover:text-white border border-slate-700/40 hover:border-slate-600/60'}`}>
                {opt.label}
              </button>
            ))}
          </div>
          <div className="hidden md:flex gap-2 bg-slate-800/40 rounded-lg p-1 border border-slate-700/40">
            {[{ icon: FaThLarge, mode: 'grid' }, { icon: FaList, mode: 'list' }].map(({ icon: Icon, mode }) => (
              <button key={mode} onClick={() => setViewMode(mode)}
                className={`p-2 rounded-lg transition-all ${viewMode === mode ? 'bg-slate-700/60 text-white shadow-sm' : 'text-slate-500 hover:text-white'}`}>
                <Icon size={14} />
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-6">
          {/* Desktop Filter Sidebar */}
          <aside className="hidden md:block w-56 flex-shrink-0">
            <div className="sticky top-24 bg-gradient-to-b from-slate-900/80 to-slate-900/40 backdrop-blur-xl rounded-2xl p-5 border border-slate-800/50 shadow-xl">
              <div className="flex items-center gap-2 mb-5 pb-4 border-b border-slate-800/50">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-red-500/20 to-orange-500/10 flex items-center justify-center">
                  <FaFilter size={12} className="text-red-400" />
                </div>
                <span className="font-bold text-white text-sm">Bộ lọc</span>
              </div>
              <FilterPanel />
            </div>
          </aside>

          {/* Mobile Filter Drawer */}
          <AnimatePresence>
            {isFilterOpen && (
              <motion.div
                initial={{ x: -320, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -320, opacity: 0 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="fixed inset-y-0 left-0 z-50 w-72 bg-slate-900/95 backdrop-blur-xl border-r border-slate-700/50 p-6 overflow-y-auto md:hidden shadow-2xl"
              >
                <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-800/50">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-red-500/20 to-orange-500/10 flex items-center justify-center">
                      <FaFilter size={12} className="text-red-400" />
                    </div>
                    <span className="font-bold text-white text-sm">Bộ lọc</span>
                  </div>
                  <button onClick={() => setIsFilterOpen(false)}
                    className="w-7 h-7 rounded-lg bg-slate-800/60 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700/60 transition-all">
                    <FaTimes size={12} />
                  </button>
                </div>
                <FilterPanel />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Product Grid */}
          <main className="flex-1 min-w-0">
            {loading ? (
              <div className={`grid gap-4 ${viewMode === 'grid' ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4' : 'grid-cols-1'}`}>
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="bg-slate-800/40 rounded-xl h-[340px] shimmer animate-pulse" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-20">
                <div className="relative inline-block mb-6">
                  <div className="w-24 h-24 mx-auto rounded-3xl bg-gradient-to-br from-slate-800/80 to-slate-900/80 flex items-center justify-center text-5xl border border-slate-700/50">
                    🔍
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500/20 animate-ping-slow" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Không tìm thấy sản phẩm</h3>
                <p className="text-slate-400 mb-6 max-w-md mx-auto">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm để có kết quả tốt hơn</p>
                <button onClick={() => { setSearchParams({}); setSelectedPriceRange(0); setMinRating(0); }}
                  className="px-6 py-3 bg-gradient-to-r from-red-600 to-orange-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-red-600/20 transition-all">
                  Xóa bộ lọc
                </button>
              </div>
            ) : (
              <>
                <div className={`grid gap-4 ${viewMode === 'grid' ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4' : 'grid-cols-1 sm:grid-cols-2'}`}>
                  {filtered.map((p, i) => <ProductCard key={p.MaSanPham} product={p} index={i} />)}
                </div>
                {/* Decorative bottom fade */}
                <div className="mt-8 h-px bg-gradient-to-r from-transparent via-slate-800/50 to-transparent" />
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
