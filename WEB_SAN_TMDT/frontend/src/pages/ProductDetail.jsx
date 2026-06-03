import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaStar, FaShoppingCart, FaHeart, FaRegHeart, FaShare, FaStore, FaCheckCircle, FaArrowLeft, FaTruck, FaShieldAlt, FaUndo, FaComments } from 'react-icons/fa';
import { toast } from 'react-toastify';
import axios from 'axios';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import ProductCard from '../components/ProductCard';

const API = 'http://localhost:5000/api';

const getImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return `http://localhost:5000${path.startsWith('/') ? '' : '/'}${path}`;
};

const mockProduct = {
  MaSanPham: 1, TenSanPham: 'Điện thoại Samsung Galaxy S24 Ultra 5G', GiaGoc: 31990000,
  MoTa: 'Điện thoại cao cấp với camera 200MP, chip Snapdragon 8 Gen 3, pin 5000mAh. Màn hình Dynamic AMOLED 2X 6.8 inch, tần số quét 120Hz. Thiết kế sang trọng, khung titan bền bỉ.',
  DanhGiaTrungBinh: 4.7, TenCuaHang: 'Samsung Official Store', MaCuaHang: 1,
  TrangThai: 'HOAT_DONG',
  variants: [
    { MaPhienBan: 1, MauSac: 'Titanium Black', KichThuoc: '256GB', GiaBan: 29990000, SoLuongTonKho: 50 },
    { MaPhienBan: 2, MauSac: 'Titanium Gray', KichThuoc: '256GB', GiaBan: 29990000, SoLuongTonKho: 30 },
    { MaPhienBan: 3, MauSac: 'Titanium Black', KichThuoc: '512GB', GiaBan: 34990000, SoLuongTonKho: 20 },
  ],
  images: [{ DuongDanAnh: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800&q=80' }], reviews: [
    { MaDanhGia: 1, HoTen: 'Nguyễn Hoàng Anh', DiemDanhGia: 5, BinhLuan: 'Máy đẹp xuất sắc, camera chụp đêm quá tốt. Pin trâu cả ngày dùng thoải mái. Màn hình siêu mượt!', NgayTao: '2026-05-15' },
    { MaDanhGia: 2, HoTen: 'Trần Minh Quân', DiemDanhGia: 5, BinhLuan: 'Lên đời từ S23 Ultra, cảm giác khác biệt rõ rệt. Sạc nhanh, chip mượt, chơi game không giật lag.', NgayTao: '2026-05-12' },
    { MaDanhGia: 3, HoTen: 'Lê Thị Phương', DiemDanhGia: 4, BinhLuan: 'Hàng chính hãng, đầy đủ phụ kiện. Giao hàng nhanh, đóng gói cẩn thận. Trừ 1 sao vì màu hồng không có sẵn.', NgayTao: '2026-05-10' },
    { MaDanhGia: 4, HoTen: 'Phạm Đức Trung', DiemDanhGia: 5, BinhLuan: 'Quá ngon so với tầm giá. Mua con này xài 3-4 năm không phải thay. Chụp ảnh đẹp, quay video 8K siêu nét.', NgayTao: '2026-05-08' },
    { MaDanhGia: 5, HoTen: 'Hoàng Thị Lan', DiemDanhGia: 4, BinhLuan: 'Samsung bền, đẹp, pin khỏe. Mua tặng chồng, ổng rất thích. Shop giao hàng siêu tốc!', NgayTao: '2026-05-06' },
    { MaDanhGia: 6, HoTen: 'Đặng Văn Hải', DiemDanhGia: 5, BinhLuan: 'Máy flagship đáng mua nhất 2026. S Pen viết rất sướng, camera zoom 100x thần thánh. 5 sao!', NgayTao: '2026-05-04' },
    { MaDanhGia: 7, HoTen: 'Vũ Thị Hồng', DiemDanhGia: 3, BinhLuan: 'Hàng tốt nhưng giá vẫn hơi cao so với thu nhập. Máy nặng tay, nữ cầm hơi mỏi.', NgayTao: '2026-05-02' },
    { MaDanhGia: 8, HoTen: 'Ngô Quốc Bảo', DiemDanhGia: 5, BinhLuan: 'Điện thoại xuất sắc! Màn hình đẹp nhất thị trường, 120Hz mượt mà. Pin dùng 2 ngày mới sạc.', NgayTao: '2026-04-30' },
    { MaDanhGia: 9, HoTen: 'Đỗ Minh Tuấn', DiemDanhGia: 4, BinhLuan: 'Cấu hình mạnh, chơi game max setting không lag. Máy hơi nóng khi chơi lâu nhưng chấp nhận được.', NgayTao: '2026-04-28' },
    { MaDanhGia: 10, HoTen: 'Bùi Thanh Hà', DiemDanhGia: 5, BinhLuan: 'Lần đầu mua hàng online mà yên tâm thế này. Máy mới nguyên seal, đúng mô tả. Sẽ ủng hộ shop dài dài!', NgayTao: '2026-04-25' },
    { MaDanhGia: 11, HoTen: 'Dương Văn Hoàng', DiemDanhGia: 4, BinhLuan: 'Máy đẹp, chụp hình đẹp. Giao diện One UI mượt. Chỉ tiếc là không có sạc kèm hộp.', NgayTao: '2026-04-22' },
    { MaDanhGia: 12, HoTen: 'Trịnh Thị Ngọc', DiemDanhGia: 5, BinhLuan: 'Máy ảnh chụp đẹp xuất sắc, đặc biệt là zoom xa. Pin từ sáng đến tối còn 30%. Rất đáng đồng tiền!', NgayTao: '2026-04-20' },
    { MaDanhGia: 13, HoTen: 'Lâm Hoàng Phúc', DiemDanhGia: 5, BinhLuan: 'Mua hàng tại shop rất yên tâm. Samsung chính hãng, có bảo hành đầy đủ. Máy xài mượt, đẹp lung linh!', NgayTao: '2026-04-18' },
    { MaDanhGia: 14, HoTen: 'Huỳnh Thị Mỹ', DiemDanhGia: 4, BinhLuan: 'Ngoại hình sang trọng, màn hình sắc nét. Giao hàng đúng hẹn, nhân viên hỗ trợ nhiệt tình.', NgayTao: '2026-04-15' },
    { MaDanhGia: 15, HoTen: 'Phan Văn Tài', DiemDanhGia: 5, BinhLuan: 'Đây là con flagship mình từng xài. Camera chụp ảnh, quay phim đỉnh. AI xóa phông siêu ảo. Recommend!', NgayTao: '2026-04-12' },
    { MaDanhGia: 16, HoTen: 'Nguyễn Thị Kim', DiemDanhGia: 3, BinhLuan: 'Máy tốt nhưng màu sắc trong thực tế khác với hình trên web. Dùng quen rồi cũng thấy ổn.', NgayTao: '2026-04-10' },
  ],
};

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, token } = useAuthStore();
  const { addItem } = useCartStore();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [isFav, setIsFav] = useState(false);
  const [favLoading, setFavLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('description');
  const [activeImg, setActiveImg] = useState(0);
  const [related, setRelated] = useState([]);
  const [filterStar, setFilterStar] = useState(0);
  const [userReviewed, setUserReviewed] = useState(null);


  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${API}/products/${id}`);
        const p = res.data.data;
        setProduct({ ...p, variants: p.phienBan || [], images: p.hinhAnh || [], reviews: p.danhGia || [] });
        setSelectedVariant((p.phienBan || [])[0] || null);
      } catch {
        const localReviews = JSON.parse(localStorage.getItem('demo_reviews') || '[]');
        const productReviews = localReviews.filter(r => r.MaSanPham === Number(id));
        const merged = {
          ...mockProduct,
          MaSanPham: Number(id),
          reviews: [...mockProduct.reviews, ...productReviews],
        };
        setProduct(merged);
        setSelectedVariant(mockProduct.variants[0]);
      } finally { setLoading(false); }
    };
    load();
  }, [id]);

  useEffect(() => {
    if (!isAuthenticated || !id) return;
    axios.get(`${API}/reviews/check/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => {
      setUserReviewed(res.data.data || null);
    }).catch(() => {});
    axios.get(`${API}/favorites`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => {
      const favs = res.data.data || [];
      setIsFav(favs.some(f => f.MaSanPham === Number(id)));
    }).catch(() => {});
  }, [isAuthenticated, id, token]);

  const handleAddToCart = async () => {
    if (!isAuthenticated) { toast.info('Vui lòng đăng nhập'); navigate('/login'); return false; }
    if (!selectedVariant) { toast.warning('Chọn phiên bản sản phẩm'); return false; }
    try {
      await addItem(selectedVariant.MaPhienBan, quantity);
      toast.success('Đã thêm vào giỏ hàng!');
      return true;
    } catch (err) {
      toast.error(err?.message || 'Lỗi thêm vào giỏ hàng');
      return false;
    }
  };

  const handleBuyNow = async () => {
    const ok = await handleAddToCart();
    if (ok) navigate('/cart');
  };

  const handleChatWithShop = async (maCuaHang, tenSanPham) => {
    if (!isAuthenticated) { toast.info('Vui long dang nhap'); navigate('/login'); return; }
    try {
      const price = selectedVariant?.Gia || p.GiaGoc || 0;
      const res = await axios.post(`${API}/chat/shop/start`, {
        maCuaHang,
        maSanPham: p.MaSanPham,
        loiNhan: `Xin chao, toi quan tam den san pham: ${tenSanPham}`
      }, { headers: { Authorization: `Bearer ${token}` } });
      navigate(`/chat?room=${res.data.data.MaPhongChat}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Loi');
    }
  };

  const colors = [...new Set(product?.variants?.map(v => v.MauSac).filter(Boolean))];
  const sizes = [...new Set(product?.variants?.map(v => v.KichThuoc).filter(Boolean))];
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');

  useEffect(() => {
    if (product) {
      setSelectedColor(colors[0] || '');
      setSelectedSize(sizes[0] || '');
    }
  }, [product]);

  useEffect(() => {
    if (product && (selectedColor || selectedSize)) {
      const v = product.variants?.find(v =>
        (!selectedColor || v.MauSac === selectedColor) &&
        (!selectedSize || v.KichThuoc === selectedSize)
      ) || product.variants?.[0];
      setSelectedVariant(v || null);
    }
  }, [selectedColor, selectedSize, product]);

  if (loading) return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid md:grid-cols-2 gap-8">
        <div className="aspect-square bg-slate-800 rounded-xl shimmer" />
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => <div key={i} className="h-10 bg-slate-800 rounded shimmer" />)}
        </div>
      </div>
    </div>
  );

  const p = product || mockProduct;
  const price = selectedVariant?.GiaBan || p.GiaGoc;
  const stock = selectedVariant?.SoLuongTonKho ?? 99;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-400 mb-6">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1 hover:text-white transition">
          <FaArrowLeft size={12} /> Quay lại
        </button>
        <span>/</span>
        <Link to="/products" className="hover:text-white transition">Sản phẩm</Link>
        <span>/</span>
        <span className="text-white truncate max-w-xs">{p.TenSanPham}</span>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-12">
        {/* Images */}
        <div>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="aspect-square rounded-xl overflow-hidden bg-slate-800/50 mb-3 border border-slate-700/50 flex items-center justify-center text-8xl"
          >
            {getImageUrl(p.images?.[activeImg]?.DuongDanAnh)
              ? <img src={getImageUrl(p.images[activeImg].DuongDanAnh)} alt={p.TenSanPham} className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; e.target.parentElement.innerHTML = '📦'; }} />
              : '📦'}
          </motion.div>
          {p.images?.length > 1 && (
            <div className="flex gap-2">
              {p.images.map((img, i) => (
                <button key={i} onClick={() => setActiveImg(i)}
                  className={`w-16 h-16 rounded-lg border overflow-hidden ${activeImg === i ? 'border-red-500' : 'border-slate-700/50'}`}>
                  <img src={getImageUrl(img.DuongDanAnh)} alt="" className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; e.target.parentElement.innerHTML = '📦'; }} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          {/* Shop */}
          <div className="flex items-center gap-3 mb-3">
            <Link to={`/shop/${p.MaCuaHang}`}
              className="inline-flex items-center gap-1.5 text-sm text-red-400 hover:text-red-300 transition">
              <FaStore size={12} /> {p.TenCuaHang}
            </Link>
            {isAuthenticated && (
              <button onClick={() => handleChatWithShop(p.MaCuaHang, p.TenSanPham)}
                className="inline-flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 transition bg-blue-500/10 hover:bg-blue-500/20 px-2.5 py-1 rounded-lg border border-blue-500/20">
                <FaComments size={12} /> Chat voi shop
              </button>
            )}
          </div>

          <h1 className="text-2xl font-bold text-white mb-4 leading-snug">{p.TenSanPham}</h1>

          {/* Rating */}
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <FaStar key={i} size={16} className={i < Math.round(p.DanhGiaTrungBinh) ? 'text-yellow-400' : 'text-slate-700'} />
              ))}
              <span className="text-sm text-slate-300 ml-1">{p.DanhGiaTrungBinh?.toFixed(1)}</span>
            </div>
            <span className="text-sm text-slate-400">({p.reviews?.length || 0} đánh giá)</span>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-3 mb-6 p-4 bg-red-950/20 border border-red-900/30 rounded-xl">
            <span className="text-4xl font-black text-red-400">₫{price.toLocaleString('vi-VN')}</span>
            {price < p.GiaGoc && (
              <>
                <span className="text-lg text-slate-500 line-through">₫{p.GiaGoc.toLocaleString('vi-VN')}</span>
                <span className="badge-red">-{Math.round((p.GiaGoc - price) / p.GiaGoc * 100)}%</span>
              </>
            )}
          </div>

          {/* Colors */}
          {colors.length > 0 && (
            <div className="mb-4">
              <p className="text-sm font-semibold text-slate-300 mb-2">Màu sắc: <span className="text-white">{selectedColor}</span></p>
              <div className="flex gap-2 flex-wrap">
                {colors.map(c => (
                  <button key={c} onClick={() => setSelectedColor(c)}
                    className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${selectedColor === c ? 'border-red-500 bg-red-500/10 text-red-400' : 'border-slate-700 text-slate-400 hover:border-slate-500'}`}>
                    {c}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Sizes */}
          {sizes.length > 0 && (
            <div className="mb-4">
              <p className="text-sm font-semibold text-slate-300 mb-2">Kích thước: <span className="text-white">{selectedSize}</span></p>
              <div className="flex gap-2 flex-wrap">
                {sizes.map(s => (
                  <button key={s} onClick={() => setSelectedSize(s)}
                    className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${selectedSize === s ? 'border-red-500 bg-red-500/10 text-red-400' : 'border-slate-700 text-slate-400 hover:border-slate-500'}`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div className="mb-6">
            <p className="text-sm font-semibold text-slate-300 mb-2">Số lượng ({stock} còn lại)</p>
            <div className="flex items-center gap-3">
              <div className="flex items-center border border-slate-700 rounded-lg overflow-hidden">
                <button onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="w-10 h-10 flex items-center justify-center text-slate-300 hover:bg-slate-700 transition text-xl font-bold">−</button>
                <span className="w-12 text-center text-white font-semibold">{quantity}</span>
                <button onClick={() => setQuantity(q => Math.min(stock, q + 1))}
                  className="w-10 h-10 flex items-center justify-center text-slate-300 hover:bg-slate-700 transition text-xl font-bold">+</button>
              </div>
              {stock <= 10 && stock > 0 && <span className="text-orange-400 text-sm">Sắp hết hàng!</span>}
              {stock === 0 && <span className="text-red-400 text-sm">Hết hàng</span>}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 mb-6">
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
              onClick={handleAddToCart} disabled={stock === 0}
              className="flex-1 btn-secondary flex items-center justify-center gap-2 py-3.5">
              <FaShoppingCart /> Thêm vào giỏ
            </motion.button>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
              onClick={handleBuyNow} disabled={stock === 0}
              className="flex-1 btn-primary flex items-center justify-center gap-2 py-3.5">
              Mua ngay
            </motion.button>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={async () => {
                if (favLoading || !id) return;
                if (!isAuthenticated) { toast.info('Vui lòng đăng nhập'); navigate('/login'); return; }
                setFavLoading(true);
                try {
                  if (isFav) {
                    await axios.delete(`${API}/favorites/${id}`, {
                      headers: { Authorization: `Bearer ${token}` }
                    });
                    setIsFav(false);
                    toast.success('Đã xóa khỏi yêu thích');
                  } else {
                    await axios.post(`${API}/favorites/add`, { maSanPham: Number(id) }, {
                      headers: { Authorization: `Bearer ${token}` }
                    });
                    setIsFav(true);
                    toast.success('Đã thêm vào yêu thích');
                  }
                } catch (err) {
                  toast.error(err.response?.data?.message || 'Không thể cập nhật yêu thích');
                } finally { setFavLoading(false); }
              }}
              className={`w-12 h-12 rounded-xl border flex items-center justify-center transition-all ${isFav ? 'bg-red-600/20 border-red-500 text-red-400' : 'border-slate-700 text-slate-400 hover:border-red-500/50'}`}>
              {isFav ? <FaHeart /> : <FaRegHeart />}
            </motion.button>
          </div>

          {/* Policies */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: FaTruck, title: 'Miễn phí ship', desc: 'Đơn từ 500K' },
              { icon: FaShieldAlt, title: 'Bảo hành', desc: '12 tháng' },
              { icon: FaUndo, title: 'Đổi trả', desc: '30 ngày' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex flex-col items-center gap-1 p-3 bg-slate-900/50 rounded-xl border border-slate-800/50 text-center">
                <Icon className="text-green-400" size={16} />
                <p className="text-xs font-semibold text-white">{title}</p>
                <p className="text-xs text-slate-400">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-8">
        <div className="flex border-b border-slate-800/50 mb-6">
          {[
            { id: 'description', label: 'Mô tả sản phẩm' },
            { id: 'reviews', label: `Đánh giá (${p.reviews?.length || 0})` },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 text-sm font-semibold border-b-2 transition-all ${activeTab === tab.id ? 'border-red-500 text-red-400' : 'border-transparent text-slate-400 hover:text-white'}`}>
              {tab.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'description' && (
            <motion.div key="desc" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="text-slate-300 leading-relaxed bg-slate-900/50 rounded-xl p-6 border border-slate-800/50">
              {p.MoTa || 'Chưa có mô tả sản phẩm.'}
            </motion.div>
          )}
          {activeTab === 'reviews' && (
            <motion.div key="reviews" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
              {/* Star filter */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-slate-400 font-medium">Lọc theo sao:</span>
                {[0, 5, 4, 3, 2, 1].map(star => (
                  <button key={star} onClick={() => setFilterStar(filterStar === star ? 0 : star)}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                      filterStar === star
                        ? 'bg-yellow-400/10 border-yellow-400/40 text-yellow-400'
                        : 'border-slate-700/50 text-slate-400 hover:border-slate-500'
                    }`}>
                    {star === 0 ? 'Tất cả' : `${star} ⭐`}
                  </button>
                ))}
              </div>
              {/* Reviews list */}
              {(p.reviews || []).filter(r => filterStar === 0 || r.DiemDanhGia === filterStar).length === 0
                ? <p className="text-center text-slate-400 py-8">Chưa có đánh giá nào</p>
                : (p.reviews || []).filter(r => filterStar === 0 || r.DiemDanhGia === filterStar).slice().reverse().map(r => (
                  <div key={r.MaDanhGia} className="bg-slate-900/50 rounded-xl p-5 border border-slate-800/50">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-red-500 to-red-800 flex items-center justify-center font-bold text-sm">{r.HoTen?.[0]}</div>
                      <div>
                        <p className="text-sm font-semibold text-white">{r.HoTen}</p>
                        <div className="flex gap-0.5">{[...Array(5)].map((_, i) => <FaStar key={i} size={11} className={i < r.DiemDanhGia ? 'text-yellow-400' : 'text-slate-700'} />)}</div>
                      </div>
                      <span className="ml-auto text-xs text-slate-500">{new Date(r.NgayTao).toLocaleDateString('vi-VN')}</span>
                    </div>
                    <p className="text-sm text-slate-300">{r.BinhLuan}</p>
                    {r.media && r.media.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {r.media.map(m => (
                          m.Loai === 'video' ? (
                            <video key={m.MaHinhAnh} controls className="w-32 h-24 rounded-lg object-cover border border-slate-700 bg-black">
                              <source src={'http://localhost:5000' + m.DuongDan} />
                            </video>
                          ) : (
                            <img key={m.MaHinhAnh} src={'http://localhost:5000' + m.DuongDan}
                              className="w-16 h-16 rounded-lg object-cover border border-slate-700 cursor-pointer hover:opacity-80 transition"
                              onClick={() => window.open('http://localhost:5000' + m.DuongDan, '_blank')} />
                          )
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              {/* User's review status */}
              <div className="bg-gradient-to-b from-slate-900/70 to-slate-900/40 rounded-xl p-6 border border-slate-700/50 text-center">
                {userReviewed ? (
                  <>
                    <FaStar className="text-yellow-400 mx-auto mb-3" size={32} />
                    <h4 className="text-sm font-bold text-green-400 mb-2">✅ Bạn đã đánh giá sản phẩm này</h4>
                    <div className="flex justify-center gap-1 mb-2">
                      {[...Array(5)].map((_, i) => <FaStar key={i} size={16} className={i < userReviewed.DiemDanhGia ? 'text-yellow-400' : 'text-slate-700'} />)}
                    </div>
                    <p className="text-xs text-slate-400 mb-1 italic">"{userReviewed.BinhLuan}"</p>
                    <p className="text-xs text-slate-500">{new Date(userReviewed.NgayTao).toLocaleDateString('vi-VN')}</p>
                  </>
                ) : (
                  <>
                    <FaStar className="text-yellow-400/50 mx-auto mb-3" size={32} />
                    <h4 className="text-sm font-bold text-white mb-2">Bạn muốn đánh giá sản phẩm này?</h4>
                    <p className="text-xs text-slate-400 mb-4">Chỉ khách hàng đã mua sản phẩm mới có thể gửi đánh giá.</p>
                    <Link to={isAuthenticated ? '/orders' : '/login'}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-red-600 to-orange-600 text-white text-xs font-bold rounded-xl hover:shadow-lg hover:shadow-red-600/20 transition-all">
                      <FaShoppingCart size={11} /> {isAuthenticated ? 'Đến đơn hàng của tôi' : 'Đăng nhập để đánh giá'}
                    </Link>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
