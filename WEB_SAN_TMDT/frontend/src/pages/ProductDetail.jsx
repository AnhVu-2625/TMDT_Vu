import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaStar, FaShoppingCart, FaHeart, FaRegHeart, FaShare, FaStore, FaCheckCircle, FaArrowLeft, FaTruck, FaShieldAlt, FaUndo } from 'react-icons/fa';
import { toast } from 'react-toastify';
import axios from 'axios';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import ProductCard from '../components/ProductCard';

const API = 'http://localhost:5000/api';

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
  images: [], reviews: [
    { MaDanhGia: 1, HoTen: 'Nguyễn Văn A', DiemDanhGia: 5, BinhLuan: 'Sản phẩm tuyệt vời, đúng như mô tả!', NgayTao: '2026-05-01' },
    { MaDanhGia: 2, HoTen: 'Trần Thị B', DiemDanhGia: 4, BinhLuan: 'Hàng chất lượng, giao hàng nhanh.', NgayTao: '2026-04-28' },
  ],
};

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const { addItem } = useCartStore();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [isFav, setIsFav] = useState(false);
  const [activeTab, setActiveTab] = useState('description');
  const [activeImg, setActiveImg] = useState(0);
  const [related, setRelated] = useState([]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${API}/products/${id}`);
        const p = res.data.data;
        setProduct(p);
        setSelectedVariant(p.variants?.[0] || null);
      } catch {
        setProduct(mockProduct);
        setSelectedVariant(mockProduct.variants[0]);
      } finally { setLoading(false); }
    };
    load();
  }, [id]);

  const handleAddToCart = async () => {
    if (!isAuthenticated) { toast.info('Vui lòng đăng nhập'); return navigate('/login'); }
    if (!selectedVariant) { toast.warning('Chọn phiên bản sản phẩm'); return; }
    try {
      await addItem(selectedVariant.MaPhienBan, quantity);
      toast.success('Đã thêm vào giỏ hàng!');
    } catch { toast.error('Lỗi thêm vào giỏ hàng'); }
  };

  const handleBuyNow = async () => {
    await handleAddToCart();
    navigate('/cart');
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
            {p.images?.[activeImg]?.DuongDanAnh
              ? <img src={p.images[activeImg].DuongDanAnh} alt={p.TenSanPham} className="w-full h-full object-cover" />
              : '📦'}
          </motion.div>
          {p.images?.length > 1 && (
            <div className="flex gap-2">
              {p.images.map((img, i) => (
                <button key={i} onClick={() => setActiveImg(i)}
                  className={`w-16 h-16 rounded-lg border overflow-hidden ${activeImg === i ? 'border-red-500' : 'border-slate-700/50'}`}>
                  <img src={img.DuongDanAnh} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          {/* Shop */}
          <Link to={`/shop/${p.MaCuaHang}`}
            className="inline-flex items-center gap-1.5 text-sm text-red-400 hover:text-red-300 mb-3 transition">
            <FaStore size={12} /> {p.TenCuaHang}
          </Link>

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
              onClick={() => setIsFav(!isFav)}
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
              {(p.reviews || []).length === 0
                ? <p className="text-center text-slate-400 py-8">Chưa có đánh giá nào</p>
                : (p.reviews || []).map(r => (
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
                  </div>
                ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
