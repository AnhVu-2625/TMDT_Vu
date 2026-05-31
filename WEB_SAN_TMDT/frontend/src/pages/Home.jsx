import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination, EffectFade } from 'swiper/modules';
import { Link, useNavigate } from 'react-router-dom';
import { FaArrowRight, FaFire, FaStar, FaChevronRight, FaGem, FaCrown, FaBolt } from 'react-icons/fa';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';
import { useProductStore } from '../store/productStore';
import ProductCard from '../components/ProductCard';

const bannerSlides = [
  {
    id: 1, tag: 'FLASH SALE', title: 'Siêu Sale\nMùa Hè', subtitle: 'Giảm đến 70% hàng ngàn sản phẩm cao cấp',
    cta: 'Mua ngay', ctaLink: '/products?sale=true', emoji: '⚡',
    bg: 'from-red-950 via-black to-red-950', accent: 'from-red-900 to-red-700',
  },
  {
    id: 2, tag: 'LUXURY COLLECTION', title: 'Bộ Sưu Tập\nCao Cấp', subtitle: 'Sản phẩm độc quyền từ các thương hiệu hàng đầu',
    cta: 'Khám phá', ctaLink: '/products?category=dien-tu', emoji: '💎',
    bg: 'from-black via-gray-950 to-black', accent: 'from-gold-700 to-gold-600',
  },
  {
    id: 3, tag: 'VIP EXCLUSIVE', title: 'Đặc Quyền\nThành Viên', subtitle: 'Tích điểm, nhận quà, hưởng ưu đãi độc quyền',
    cta: 'Tham gia VIP', ctaLink: '/vip', emoji: '👑',
    bg: 'from-red-950 via-gray-950 to-black', accent: 'from-gold-700 to-red-800',
  },
];

const categoryItems = [
  { emoji: '📱', label: 'Điện tử', path: '/products?category=dien-tu', count: '2.5k+', gradient: 'from-blue-900 to-blue-950' },
  { emoji: '👗', label: 'Thời trang', path: '/products?category=thoi-trang', count: '10k+', gradient: 'from-pink-900 to-pink-950' },
  { emoji: '🏠', label: 'Gia dụng', path: '/products?category=gia-dung', count: '5k+', gradient: 'from-green-900 to-green-950' },
  { emoji: '📚', label: 'Sách', path: '/products?category=sach', count: '8k+', gradient: 'from-orange-900 to-orange-950' },
  { emoji: '💄', label: 'Mỹ phẩm', path: '/products?category=my-pham', count: '3k+', gradient: 'from-purple-900 to-purple-950' },
  { emoji: '🎮', label: 'Gaming', path: '/products?category=gaming', count: '1.5k+', gradient: 'from-red-900 to-red-950' },
  { emoji: '🍔', label: 'Thực phẩm', path: '/products?category=thuc-pham', count: '4k+', gradient: 'from-yellow-900 to-yellow-950' },
  { emoji: '🏋️', label: 'Thể thao', path: '/products?category=the-thao', count: '2k+', gradient: 'from-cyan-900 to-cyan-950' },
];

const mockProducts = Array.from({ length: 8 }, (_, i) => ({
  MaSanPham: i + 1, TenSanPham: `Sản phẩm cao cấp ${i + 1}`, GiaGoc: (i + 1) * 150000 + 50000,
  DanhGiaTrungBinh: 4 + (i % 2) * 0.5, TenCuaHang: `Shop ${['Premium', 'Luxury', 'Elite', 'Royal'][i % 4]}`,
  isNew: i < 3, isHot: i >= 3 && i < 6,
  variants: [{ MaPhienBan: i + 1, GiaBan: (i + 1) * 130000 + 50000 }],
  images: [],
}));

function Home() {
  const { products, fetchProducts } = useProductStore();
  const navigate = useNavigate();
  const displayProducts = products.length > 0 ? products : mockProducts;

  useEffect(() => { fetchProducts({ limit: 16, sort: 'newest' }); }, [fetchProducts]);

  return (
    <div className="space-y-20 pb-20">
      {/* Hero Banner Slider - Luxury */}
      <section className="relative -mt-1">
        <Swiper
          modules={[Autoplay, Navigation, Pagination, EffectFade]}
          autoplay={{ delay: 5000, disableOnInteraction: false }}
          navigation pagination={{ clickable: true }}
          effect="fade"
          loop className="w-full"
        >
          {bannerSlides.map((slide) => (
            <SwiperSlide key={slide.id}>
              <div className={`relative h-[500px] md:h-[600px] bg-gradient-to-br ${slide.bg} overflow-hidden flex items-center`}>
                {/* Luxury BG Effects */}
                <div className="absolute inset-0">
                  <div className="absolute top-0 right-0 w-[700px] h-[700px] rounded-full opacity-10 blur-3xl"
                    style={{ background: `radial-gradient(circle, rgba(139,0,0,0.6) 0%, transparent 70%)` }} />
                  <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full opacity-5 blur-3xl"
                    style={{ background: `radial-gradient(circle, rgba(212,175,55,0.4) 0%, transparent 70%)` }} />
                  {/* Luxury grid pattern */}
                  <div className="absolute inset-0 opacity-[0.03]"
                    style={{
                      backgroundImage: 'linear-gradient(rgba(212,175,55,0.5) 1px,transparent 1px),linear-gradient(90deg,rgba(212,175,55,0.5) 1px,transparent 1px)',
                      backgroundSize: '80px 80px'
                    }} />
                  {/* Diagonal lines */}
                  <div className="absolute inset-0 opacity-[0.02]"
                    style={{
                      backgroundImage: 'repeating-linear-gradient(45deg, rgba(255,255,255,0.1) 0px, rgba(255,255,255,0.1) 2px, transparent 2px, transparent 10px)',
                    }} />
                </div>

                <div className="relative max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between w-full">
                  <motion.div
                    initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }} className="max-w-2xl"
                  >
                    <motion.span
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className={`inline-flex items-center gap-2 text-xs font-black tracking-widest px-4 py-2 rounded-full bg-gradient-to-r ${slide.accent} text-white mb-6 shadow-lg`}
                    >
                      <FaGem size={12} />
                      {slide.tag}
                    </motion.span>
                    <h1 className="text-6xl md:text-8xl font-display font-black text-white leading-none mb-6 whitespace-pre-line">
                      {slide.title}
                    </h1>
                    <p className="text-xl text-gray-300 mb-10 font-medium">{slide.subtitle}</p>
                    <div className="flex gap-4">
                      <Link to={slide.ctaLink}>
                        <motion.button
                          whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(139,0,0,0.4)" }}
                          whileTap={{ scale: 0.98 }}
                          className={`px-10 py-4 bg-gradient-to-r ${slide.accent} text-white font-black text-lg rounded-xl shadow-2xl flex items-center gap-3 border border-white/20`}
                        >
                          {slide.cta} <FaArrowRight size={16} />
                        </motion.button>
                      </Link>
                      <Link to="/products">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.98 }}
                          className="px-10 py-4 border-2 border-white/30 text-white hover:bg-white/10 font-bold text-lg rounded-xl transition backdrop-blur-sm"
                        >
                          Xem tất cả
                        </motion.button>
                      </Link>
                    </div>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.6, rotate: -10 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                    className="hidden lg:flex text-[220px] items-center justify-center select-none animate-float"
                    style={{ filter: 'drop-shadow(0 30px 60px rgba(0,0,0,0.7))' }}
                  >
                    {slide.emoji}
                  </motion.div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </section>

      {/* Category Grid - Luxury */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-display font-bold text-white flex items-center gap-3">
              <span className="w-1.5 h-8 bg-gradient-to-b from-red-900 to-gold-700 rounded-full" />
              Danh mục nổi bật
            </h2>
            <p className="text-gray-400 text-sm mt-2 ml-6">Khám phá bộ sưu tập cao cấp</p>
          </div>
          <Link to="/products" className="text-sm text-gold-700 hover:text-gold-600 flex items-center gap-2 transition font-semibold">
            Xem tất cả <FaChevronRight size={10} />
          </Link>
        </div>
        <div className="grid grid-cols-4 md:grid-cols-8 gap-4">
          {categoryItems.map((cat, i) => (
            <motion.div
              key={cat.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05, duration: 0.4 }}
            >
              <Link to={cat.path}
                className={`flex flex-col items-center gap-3 p-4 rounded-2xl bg-gradient-to-br ${cat.gradient} border border-red-900/30 hover:border-gold-700/50 hover:shadow-xl hover:shadow-red-900/30 transition-all group relative overflow-hidden`}>
                <div className="absolute inset-0 bg-gradient-to-br from-gold-700/0 to-gold-700/0 group-hover:from-gold-700/10 group-hover:to-transparent transition-all" />
                <span className="text-4xl group-hover:scale-125 transition-transform duration-300 relative z-10">{cat.emoji}</span>
                <span className="text-xs font-bold text-white text-center relative z-10">{cat.label}</span>
                <span className="text-xs text-gray-400 font-semibold relative z-10">{cat.count}</span>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Flash Sale Banner - Luxury */}
      <section className="max-w-7xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative bg-gradient-to-r from-red-950 via-red-900 to-red-950 rounded-3xl p-8 md:p-12 overflow-hidden border border-red-800/50 shadow-2xl shadow-red-900/50"
        >
          <div className="absolute right-0 top-0 text-[250px] opacity-5 select-none">⚡</div>
          <div className="absolute left-0 bottom-0 w-64 h-64 bg-gold-700/10 rounded-full blur-3xl" />
          <div className="relative flex flex-col md:flex-row items-center justify-between gap-8">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <FaBolt className="text-gold-700 text-3xl animate-pulse" />
                <span className="text-gold-700 font-black text-2xl tracking-wider">FLASH SALE</span>
              </div>
              <h3 className="text-4xl md:text-5xl font-display font-black text-white mb-3">Giảm đến 70%</h3>
              <p className="text-red-200 text-lg font-medium">Ưu đãi chỉ trong hôm nay — Số lượng có hạn!</p>
              <div className="flex items-center gap-4 mt-6">
                <div className="text-center">
                  <div className="text-3xl font-black text-white">12</div>
                  <div className="text-xs text-gray-400">Giờ</div>
                </div>
                <div className="text-2xl text-gray-600">:</div>
                <div className="text-center">
                  <div className="text-3xl font-black text-white">34</div>
                  <div className="text-xs text-gray-400">Phút</div>
                </div>
                <div className="text-2xl text-gray-600">:</div>
                <div className="text-center">
                  <div className="text-3xl font-black text-white">56</div>
                  <div className="text-xs text-gray-400">Giây</div>
                </div>
              </div>
            </div>
            <Link to="/products?sale=true">
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(212,175,55,0.4)" }}
                whileTap={{ scale: 0.97 }}
                className="px-12 py-5 bg-gradient-to-r from-gold-700 to-gold-600 text-black font-black text-xl rounded-xl shadow-2xl hover:shadow-gold-700/40 transition-all border border-gold-600"
              >
                Xem ngay →
              </motion.button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Product Carousel - Mới nhất */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-display font-bold text-white flex items-center gap-3">
              <span className="w-1.5 h-8 bg-gradient-to-b from-red-900 to-gold-700 rounded-full" />
              Sản phẩm mới nhất
            </h2>
            <p className="text-gray-400 text-sm mt-2 ml-6">Bộ sưu tập độc quyền vừa ra mắt</p>
          </div>
          <Link to="/products?sort=newest" className="text-sm text-gold-700 hover:text-gold-600 flex items-center gap-2 transition font-semibold">
            Xem thêm <FaChevronRight size={10} />
          </Link>
        </div>
        <Swiper
          modules={[Navigation]}
          navigation
          spaceBetween={20}
          slidesPerView={2}
          breakpoints={{ 640: { slidesPerView: 3 }, 1024: { slidesPerView: 4 }, 1280: { slidesPerView: 5 } }}
        >
          {displayProducts.slice(0, 10).map((p, i) => (
            <SwiperSlide key={p.MaSanPham}>
              <ProductCard product={p} index={i} />
            </SwiperSlide>
          ))}
        </Swiper>
      </section>

      {/* Product Grid - Bán chạy */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-display font-bold text-white flex items-center gap-3">
              <FaFire className="text-orange-500 text-3xl" />
              Bán chạy nhất
            </h2>
            <p className="text-gray-400 text-sm mt-2 ml-11">Được yêu thích nhất tháng này</p>
          </div>
          <Link to="/products?sort=bestseller" className="text-sm text-gold-700 hover:text-gold-600 flex items-center gap-2 transition font-semibold">
            Xem thêm <FaChevronRight size={10} />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
          {displayProducts.slice(0, 8).map((p, i) => (
            <ProductCard key={p.MaSanPham} product={{ ...p, isHot: true }} index={i} />
          ))}
        </div>
      </section>

      {/* Stats section - Luxury */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {[
            { num: '10M+', label: 'Sản phẩm', icon: '📦', gradient: 'from-blue-900 to-blue-950' },
            { num: '500K+', label: 'Người bán', icon: '🏪', gradient: 'from-green-900 to-green-950' },
            { num: '5M+', label: 'Khách hàng', icon: '👥', gradient: 'from-purple-900 to-purple-950' },
            { num: '99.8%', label: 'Hài lòng', icon: '⭐', gradient: 'from-gold-900 to-gold-950' },
          ].map(({ num, label, icon, gradient }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`bg-gradient-to-br ${gradient} border border-red-900/30 rounded-2xl p-8 text-center hover:border-gold-700/50 hover:shadow-xl hover:shadow-red-900/30 transition-all group`}
            >
              <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">{icon}</div>
              <div className="text-4xl font-black gradient-text-luxury mb-2">{num}</div>
              <div className="text-sm text-gray-400 font-semibold">{label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* VIP Banner */}
      <section className="max-w-7xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative bg-gradient-to-r from-gold-950 via-black to-gold-950 rounded-3xl p-12 overflow-hidden border border-gold-900/50 shadow-2xl shadow-gold-900/30"
        >
          <div className="absolute right-0 top-0 text-[200px] opacity-5 select-none">👑</div>
          <div className="relative text-center max-w-2xl mx-auto">
            <FaCrown className="text-gold-700 text-5xl mx-auto mb-4 animate-pulse" />
            <h3 className="text-4xl font-display font-black gradient-text-gold mb-4">Trở thành thành viên VIP</h3>
            <p className="text-gray-300 text-lg mb-8">Tận hưởng ưu đãi độc quyền, tích điểm đổi quà và nhiều đặc quyền khác</p>
            <Link to="/vip">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                className="px-10 py-4 bg-gradient-to-r from-gold-700 to-gold-600 text-black font-black text-lg rounded-xl shadow-2xl hover:shadow-gold-700/40 transition-all border border-gold-600"
              >
                Tìm hiểu thêm
              </motion.button>
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
}

export default Home;
