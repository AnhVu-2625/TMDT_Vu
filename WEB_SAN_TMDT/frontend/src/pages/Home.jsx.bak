import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination } from 'swiper/modules';
import { Link, useNavigate } from 'react-router-dom';
import { FaArrowRight, FaFire, FaStar, FaChevronRight } from 'react-icons/fa';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { useProductStore } from '../store/productStore';
import ProductCard from '../components/ProductCard';

const bannerSlides = [
  {
    id: 1, tag: 'FLASH SALE', title: 'Siêu Sale\nMùa Hè', subtitle: 'Giảm đến 70% hàng ngàn sản phẩm',
    cta: 'Mua ngay', ctaLink: '/products?sale=true', emoji: '⚡',
    bg: 'from-red-950 via-red-900 to-slate-900', accent: 'from-red-500 to-orange-500',
  },
  {
    id: 2, tag: 'MỚI RA MẮT', title: 'Điện Tử\nCao Cấp', subtitle: 'Smartphone, Laptop, Tablet chính hãng',
    cta: 'Khám phá', ctaLink: '/products?category=dien-tu', emoji: '📱',
    bg: 'from-slate-950 via-blue-950 to-slate-900', accent: 'from-blue-500 to-cyan-500',
  },
  {
    id: 3, tag: 'VIP MEMBER', title: 'Ưu Đãi\nThành Viên', subtitle: 'Tích điểm, nhận quà, hưởng đặc quyền',
    cta: 'Tham gia VIP', ctaLink: '/vip', emoji: '👑',
    bg: 'from-slate-950 via-yellow-950 to-slate-900', accent: 'from-yellow-500 to-amber-500',
  },
];

const categoryItems = [
  { emoji: '📱', label: 'Điện tử', path: '/products?category=dien-tu', count: '2.5k+' },
  { emoji: '👗', label: 'Thời trang', path: '/products?category=thoi-trang', count: '10k+' },
  { emoji: '🏠', label: 'Gia dụng', path: '/products?category=gia-dung', count: '5k+' },
  { emoji: '📚', label: 'Sách', path: '/products?category=sach', count: '8k+' },
  { emoji: '💄', label: 'Mỹ phẩm', path: '/products?category=my-pham', count: '3k+' },
  { emoji: '🎮', label: 'Gaming', path: '/products?category=gaming', count: '1.5k+' },
  { emoji: '🍔', label: 'Thực phẩm', path: '/products?category=thuc-pham', count: '4k+' },
  { emoji: '🏋️', label: 'Thể thao', path: '/products?category=the-thao', count: '2k+' },
];

const mockProducts = Array.from({ length: 8 }, (_, i) => ({
  MaSanPham: i + 1, TenSanPham: `Sản phẩm mẫu ${i + 1}`, GiaGoc: (i + 1) * 150000 + 50000,
  DanhGiaTrungBinh: 4 + (i % 2) * 0.5, TenCuaHang: `Shop ${['Alpha', 'Beta', 'Gamma', 'Delta'][i % 4]}`,
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
    <div className="space-y-16 pb-16">
      {/* Hero Banner Slider */}
      <section className="relative">
        <Swiper
          modules={[Autoplay, Navigation, Pagination]}
          autoplay={{ delay: 5000, disableOnInteraction: false }}
          navigation pagination={{ clickable: true }}
          loop className="w-full"
        >
          {bannerSlides.map((slide) => (
            <SwiperSlide key={slide.id}>
              <div className={`relative h-[480px] md:h-[560px] bg-gradient-to-br ${slide.bg} overflow-hidden flex items-center`}>
                {/* BG Effects */}
                <div className="absolute inset-0">
                  <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full opacity-10"
                    style={{ background: `radial-gradient(circle, rgba(220,38,38,0.4) 0%, transparent 70%)` }} />
                  <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full opacity-5"
                    style={{ background: `radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 70%)` }} />
                  {/* Grid lines */}
                  <div className="absolute inset-0 opacity-5"
                    style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.1) 1px,transparent 1px)', backgroundSize: '60px 60px' }} />
                </div>

                <div className="relative max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between w-full">
                  <motion.div
                    initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.7 }} className="max-w-xl"
                  >
                    <span className={`inline-block text-xs font-black tracking-widest px-3 py-1.5 rounded-full bg-gradient-to-r ${slide.accent} text-white mb-4`}>
                      {slide.tag}
                    </span>
                    <h1 className="text-5xl md:text-7xl font-black text-white leading-none mb-4 whitespace-pre-line">
                      {slide.title}
                    </h1>
                    <p className="text-lg text-slate-300 mb-8">{slide.subtitle}</p>
                    <div className="flex gap-4">
                      <Link to={slide.ctaLink}>
                        <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                          className={`px-8 py-3.5 bg-gradient-to-r ${slide.accent} text-white font-bold rounded-xl shadow-2xl flex items-center gap-2`}>
                          {slide.cta} <FaArrowRight size={14} />
                        </motion.button>
                      </Link>
                      <Link to="/products">
                        <button className="px-8 py-3.5 border border-white/20 text-white hover:bg-white/10 font-semibold rounded-xl transition">
                          Xem tất cả
                        </button>
                      </Link>
                    </div>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.7, delay: 0.2 }}
                    className="hidden md:flex text-[180px] items-center justify-center select-none"
                    style={{ filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.5))' }}
                  >
                    {slide.emoji}
                  </motion.div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </section>

      {/* Category Grid */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <span className="w-1 h-6 bg-red-500 rounded-full" /> Danh mục nổi bật
          </h2>
          <Link to="/products" className="text-sm text-red-400 hover:text-red-300 flex items-center gap-1 transition">
            Xem tất cả <FaChevronRight size={10} />
          </Link>
        </div>
        <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
          {categoryItems.map((cat, i) => (
            <motion.div
              key={cat.label} initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
            >
              <Link to={cat.path}
                className="flex flex-col items-center gap-2 p-3 rounded-xl bg-slate-900/60 border border-slate-800/50 hover:border-red-500/40 hover:bg-red-500/5 transition-all group">
                <span className="text-3xl group-hover:scale-110 transition-transform">{cat.emoji}</span>
                <span className="text-xs font-medium text-slate-300 group-hover:text-white text-center">{cat.label}</span>
                <span className="text-xs text-slate-500">{cat.count}</span>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Flash Sale Banner */}
      <section className="max-w-7xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }} whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative bg-gradient-to-r from-red-900 via-red-800 to-red-900 rounded-2xl p-6 md:p-8 overflow-hidden"
        >
          <div className="absolute right-0 top-0 text-[200px] opacity-5 select-none">⚡</div>
          <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <FaFire className="text-orange-400 text-2xl" />
                <span className="text-orange-400 font-black text-lg tracking-wider">FLASH SALE</span>
              </div>
              <h3 className="text-3xl md:text-4xl font-black text-white mb-2">Giảm đến 70%</h3>
              <p className="text-red-200">Ưu đãi chỉ trong hôm nay — Số lượng có hạn!</p>
            </div>
            <Link to="/products?sale=true">
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}
                className="px-10 py-4 bg-white text-red-700 font-black text-lg rounded-xl shadow-2xl hover:shadow-white/20 transition-all">
                Xem ngay →
              </motion.button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Product Carousel - Mới nhất */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <span className="w-1 h-6 bg-red-500 rounded-full" /> Sản phẩm mới nhất
          </h2>
          <Link to="/products?sort=newest" className="text-sm text-red-400 hover:text-red-300 flex items-center gap-1 transition">
            Xem thêm <FaChevronRight size={10} />
          </Link>
        </div>
        <Swiper
          modules={[Navigation]} navigation spaceBetween={16}
          slidesPerView={2} breakpoints={{ 640: { slidesPerView: 3 }, 1024: { slidesPerView: 4 }, 1280: { slidesPerView: 5 } }}
        >
          {displayProducts.slice(0, 10).map((p, i) => (
            <SwiperSlide key={p.MaSanPham}>
              <ProductCard product={p} index={i} />
            </SwiperSlide>
          ))}
        </Swiper>
      </section>

      {/* Product Carousel - Bán chạy */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <FaFire className="text-orange-400" /> Bán chạy nhất
          </h2>
          <Link to="/products?sort=bestseller" className="text-sm text-red-400 hover:text-red-300 flex items-center gap-1 transition">
            Xem thêm <FaChevronRight size={10} />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {displayProducts.slice(0, 8).map((p, i) => (
            <ProductCard key={p.MaSanPham} product={{ ...p, isHot: true }} index={i} />
          ))}
        </div>
      </section>

      {/* Stats section */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { num: '10M+', label: 'Sản phẩm', icon: '📦' },
            { num: '500K+', label: 'Người bán', icon: '🏪' },
            { num: '5M+', label: 'Khách hàng', icon: '👥' },
            { num: '99.8%', label: 'Hài lòng', icon: '⭐' },
          ].map(({ num, label, icon }) => (
            <motion.div
              key={label} initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="bg-slate-900/60 border border-slate-800/50 rounded-xl p-6 text-center"
            >
              <div className="text-4xl mb-3">{icon}</div>
              <div className="text-3xl font-black gradient-text">{num}</div>
              <div className="text-sm text-slate-400 mt-1">{label}</div>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default Home;
