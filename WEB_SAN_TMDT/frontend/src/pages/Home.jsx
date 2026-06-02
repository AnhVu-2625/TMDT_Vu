import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination, EffectFade } from 'swiper/modules';
import { Link, useNavigate } from 'react-router-dom';
import { FaArrowRight, FaFire, FaChevronRight, FaClock, FaGift, FaTruck, FaShieldAlt, FaGem, FaHeadset, FaPaperPlane, FaEnvelope, FaMobileAlt, FaTshirt, FaHome, FaBook, FaPaintBrush, FaGamepad, FaHamburger, FaDumbbell, FaStar, FaBolt, FaCrown } from 'react-icons/fa';
import { toast } from 'react-toastify';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';
import { useProductStore } from '../store/productStore';
import ProductCard from '../components/ProductCard';

const bannerSlides = [
  {
    id: 1, tag: 'FLASH SALE', title: 'SIÊU SALE\nMÙA HÈ', subtitle: 'Giảm đến 70% hàng ngàn sản phẩm',
    cta: 'Mua ngay', ctaLink: '/products?sale=true', emoji: '⚡',
    Icon: FaBolt, productName: 'Tai nghe không dây Pro Max',
    productDesc: 'Chống ồn chủ động · Pin 30 giờ',
    bg: 'from-red-950/95 via-red-900/90 to-slate-950/95',
    accent: 'from-red-500 to-orange-500',
    image: 'https://loremflickr.com/1920/600/sale',
    productImage: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80',
    features: ['Miễn phí vận chuyển toàn quốc', 'Đổi trả trong 30 ngày', 'Bảo hành chính hãng'],
    giaGoc: 2990000, giaSale: 897000, phanTramGiam: 70, tietKiem: 2093000,
  },
  {
    id: 2, tag: 'MỚI RA MẮT', title: 'ĐIỆN TỬ\nCAO CẤP', subtitle: 'Smartphone, Laptop, Tablet chính hãng',
    cta: 'Khám phá', ctaLink: '/products?category=dien-tu', emoji: '📱',
    Icon: FaMobileAlt, productName: 'iPhone 15 Pro Max 256GB',
    productDesc: 'Chip A17 Pro · Camera 48MP',
    bg: 'from-slate-950/95 via-blue-950/90 to-slate-950/95',
    accent: 'from-blue-500 to-cyan-500',
    image: 'https://loremflickr.com/1920/600/technology',
    productImage: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400&q=80',
    features: ['Công nghệ mới nhất 2025', 'Giá tốt nhất thị trường', 'Trả góp 0% lãi suất'],
    giaGoc: 15990000, giaSale: 9990000, phanTramGiam: 38, tietKiem: 6000000,
  },
  {
    id: 3, tag: 'VIP MEMBER', title: 'ƯU ĐÃI\nTHÀNH VIÊN', subtitle: 'Tích điểm, nhận quà, hưởng đặc quyền',
    cta: 'Tham gia VIP', ctaLink: '/vip', emoji: '👑',
    Icon: FaCrown, productName: 'Gói hội viên MartHub VIP',
    productDesc: 'Miễn phí vận chuyển · Quà tặng sinh nhật',
    bg: 'from-slate-950/95 via-yellow-950/90 to-slate-950/95',
    accent: 'from-yellow-500 to-amber-500',
    image: 'https://loremflickr.com/1920/600/vip',
    productImage: 'https://images.unsplash.com/photo-1607082349566-187342175e2f?w=400&q=80',
    features: ['Tích lũy điểm thưởng mỗi ngày', 'Quà tặng sinh nhật giá trị', 'Ưu đãi độc quyền thành viên'],
    giaGoc: 499000, giaSale: 199000, phanTramGiam: 60, tietKiem: 300000,
  },
];

const categoryItems = [
  { icon: FaMobileAlt, label: 'Điện tử', path: '/products?category=dien-tu', count: '2.5k+', colors: 'from-red-500/20 via-orange-500/10 to-rose-600/10 text-red-400 border-red-500/10' },
  { icon: FaTshirt, label: 'Thời trang', path: '/products?category=thoi-trang', count: '10k+', colors: 'from-pink-500/20 via-rose-500/10 to-purple-600/10 text-pink-400 border-pink-500/10' },
  { icon: FaHome, label: 'Gia dụng', path: '/products?category=gia-dung', count: '5k+', colors: 'from-emerald-500/20 via-teal-500/10 to-cyan-600/10 text-emerald-400 border-emerald-500/10' },
  { icon: FaBook, label: 'Sách', path: '/products?category=sach', count: '8k+', colors: 'from-amber-500/20 via-yellow-500/10 to-orange-600/10 text-amber-400 border-amber-500/10' },
  { icon: FaPaintBrush, label: 'Mỹ phẩm', path: '/products?category=my-pham', count: '3k+', colors: 'from-rose-500/20 via-pink-500/10 to-fuchsia-600/10 text-rose-400 border-rose-500/10' },
  { icon: FaGamepad, label: 'Gaming', path: '/products?category=gaming', count: '1.5k+', colors: 'from-violet-500/20 via-purple-500/10 to-indigo-600/10 text-violet-400 border-violet-500/10' },
  { icon: FaHamburger, label: 'Thực phẩm', path: '/products?category=thuc-pham', count: '4k+', colors: 'from-orange-500/20 via-amber-500/10 to-yellow-600/10 text-orange-400 border-orange-500/10' },
  { icon: FaDumbbell, label: 'Thể thao', path: '/products?category=the-thao', count: '2k+', colors: 'from-cyan-500/20 via-blue-500/10 to-indigo-600/10 text-cyan-400 border-cyan-500/10' },
];

const homeProductData = [
  { name: 'Tai nghe Sony WH-1000XM5', desc: 'Tai nghe chống ồn Sony WH-1000XM5 với công nghệ HD Noise Cancelling QN1, âm thanh Hi-Res 30mm, pin 30 giờ, sạc nhanh 3 phút nghe 3 giờ. Thiết kế gập gọn, kết nối đa thiết bị Bluetooth.',
    img: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80' },
  { name: 'Áo thun nam cổ tròn cotton', desc: 'Áo thun nam cổ tròn chất liệu cotton 100%, mềm mại thoáng khí, thấm hút mồ hôi tốt. Form regular fit, đường may chắc chắn. Nhiều màu sắc. Phù hợp mặc hàng ngày.',
    img: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&q=80' },
  { name: 'Laptop ASUS VivoBook 15', desc: 'Laptop ASUS VivoBook 15 Intel Core i5, RAM 8GB, SSD 512GB, màn hình 15.6 inch Full HD. Mỏng nhẹ 1.7kg, bản lề 180°, pin 8 giờ. Đáp ứng tốt học tập, văn phòng.',
    img: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&q=80' },
  { name: 'Giày Nike Air Max', desc: 'Giày Nike Air Max đế Air-Sole êm ái, upper lưới thoáng khí. Phù hợp chạy bộ, tập gym và đi hàng ngày. Đế cao su chống trượt, form chuẩn. Nhiều phối màu.',
    img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80' },
  { name: 'Máy ảnh Canon EOS R50', desc: 'Máy ảnh mirrorless Canon EOS R50 cảm biến 24.2MP, quay 4K 30fps, lấy nét Dual Pixel CMOS AF II. Màn hình cảm ứng xoay lật, WiFi/Bluetooth. Cho người mới và vlogger.',
    img: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400&q=80' },
  { name: 'Balo du lịch Swissgear', desc: 'Balo Swissgear 1900 ScanSmart chống sốc cho laptop 15.6 inch. Chất liệu chống thấm, khóa kéo YKK, nhiều ngăn, USB sạc ngoài, quai lưng thoáng khí.',
    img: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&q=80' },
  { name: 'Apple Watch Series 9', desc: 'Apple Watch Series 9 chip S9, màn hình Retina LTPO OLED luôn sáng. Đo nhịp tim, SpO2, GPS, kháng nước 50m. watchOS 10 nhiều tính năng sức khỏe.',
    img: 'https://images.unsplash.com/photo-1546868871-af0de0ae72bf?w=400&q=80' },
  { name: 'Loa JBL Flip 6', desc: 'Loa bluetooth JBL Flip 6 công suất 30W, âm trầm mạnh, chống nước IP67, pin 12 giờ. Thiết kế nhỏ gọn, ghép đôi stereo. Phù hợp tiệc tùng dã ngoại.',
    img: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&q=80' },
];

const mockProducts = Array.from({ length: 8 }, (_, i) => ({
  MaSanPham: i + 1, TenSanPham: homeProductData[i].name, GiaGoc: (i + 1) * 150000 + 50000,
  DanhGiaTrungBinh: 4 + (i % 2) * 0.5, SoLuongDaBan: 100 + i * 55, TenCuaHang: `Shop ${['Alpha', 'Beta', 'Gamma', 'Delta'][i % 4]}`,
  isNew: i < 3, isHot: i >= 3 && i < 6,
  variants: [{ MaPhienBan: i + 1, GiaBan: (i + 1) * 130000 + 50000 }],
  AnhChinh: homeProductData[i].img,
  images: [{ DuongDanAnh: homeProductData[i].img }],
  MoTa: homeProductData[i].desc,
}));

function Home() {
  const { products, fetchProducts } = useProductStore();
  const navigate = useNavigate();
  const displayProducts = products.length > 0 ? products : mockProducts;
  const formatPrice = (n) => new Intl.NumberFormat('vi-VN').format(n) + '₫';

  useEffect(() => { fetchProducts({ limit: 16, sort: 'newest' }); }, [fetchProducts]);

  const [timeLeft, setTimeLeft] = useState({ hours: 23, minutes: 59, seconds: 59 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.hours === 0 && prev.minutes === 0 && prev.seconds === 0) {
          return { hours: 23, minutes: 59, seconds: 59 };
        }
        const total = prev.hours * 3600 + prev.minutes * 60 + prev.seconds - 1;
        return {
          hours: Math.floor(total / 3600),
          minutes: Math.floor((total % 3600) / 60),
          seconds: total % 60,
        };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const [dealTimer, setDealTimer] = useState({ hours: 8, minutes: 45, seconds: 30 });

  useEffect(() => {
    const timer = setInterval(() => {
      setDealTimer(prev => {
        if (prev.hours === 0 && prev.minutes === 0 && prev.seconds === 0) {
          return { hours: 8, minutes: 0, seconds: 0 };
        }
        const total = prev.hours * 3600 + prev.minutes * 60 + prev.seconds - 1;
        return {
          hours: Math.floor(total / 3600),
          minutes: Math.floor((total % 3600) / 60),
          seconds: total % 60,
        };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const [activeSlide, setActiveSlide] = useState(0);

  const dealProduct = {
    MaSanPham: 99, TenSanPham: 'Tai nghe không dây cao cấp XYZ Pro Max',
    GiaGoc: 2990000, DanhGiaTrungBinh: 4.8, TenCuaHang: 'Shop AudioPro',
    isNew: true, isHot: true,
    MoTa: 'Tai nghe không dây XYZ Pro Max với chip xử lý âm thanh AI, chống ồn chủ động ANC 48dB. Driver 40mm thạch anh, hiệu ứng âm thanh vòm 7.1. Pin 60 giờ, sạc nhanh 15 phút nghe 5 giờ. Bluetooth 5.3, kết nối đa thiết bị, micro kép chống ồn cuộc gọi.',
    variants: [{ MaPhienBan: 99, GiaBan: 1490000 }],
    images: [],
  };

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Banner Slider */}
      <section className="relative">
        <Swiper
          modules={[Autoplay, Navigation, Pagination, EffectFade]}
          effect="fade" fadeEffect={{ crossFade: true }}
          autoplay={{ delay: 6000, disableOnInteraction: false }}
          navigation pagination={{ clickable: true }}
          loop className="w-full"
          onSlideChange={(swiper) => setActiveSlide(swiper.realIndex)}
        >
          {bannerSlides.map((slide) => (
            <SwiperSlide key={slide.id}>
              <div className="relative h-[520px] md:h-[640px] bg-black overflow-hidden flex items-center">
                {/* BG image + overlay */}
                <div className="absolute inset-0">
                  <img src={slide.image} alt="" className="absolute inset-0 w-full h-full object-cover" />
                  <div className={`absolute inset-0 bg-gradient-to-br ${slide.bg}`} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                </div>

                {/* Decorative background glows */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-red-500/10 via-orange-500/10 to-transparent blur-3xl pointer-events-none" />
                <div className="absolute top-[20%] right-[20%] w-[350px] h-[350px] rounded-full bg-gradient-to-br from-blue-500/10 via-cyan-500/10 to-transparent blur-3xl pointer-events-none" />
                <div className="absolute bottom-[15%] left-[45%] w-[250px] h-[250px] rounded-full bg-gradient-to-br from-yellow-500/10 via-amber-500/10 to-transparent blur-3xl pointer-events-none" />

                <div className="relative max-w-[1440px] mx-auto px-6 md:px-12 flex items-center justify-between w-full">
                  <motion.div
                    initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.7 }} className="max-w-xl md:max-w-2xl"
                  >
                    <motion.span
                      initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.1 }}
                      className={`inline-block text-xs font-black tracking-[0.18em] px-4 py-1.5 rounded-full bg-gradient-to-r ${slide.accent} text-white mb-4 shadow-lg font-display`}
                    >
                      {slide.tag}
                    </motion.span>
                    <motion.h1
                      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                      className="text-5xl md:text-7xl lg:text-8xl font-black text-white leading-none mb-3 whitespace-pre-line tracking-wide font-impact"
                    >
                      {slide.title}
                    </motion.h1>
                    <motion.p
                      initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.3 }}
                      className="text-base md:text-lg text-white/80 mb-4 font-medium"
                    >
                      {slide.subtitle}
                    </motion.p>
                    {/* Price highlight */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.32 }}
                      className="flex items-baseline gap-3 mb-5"
                    >
                      <span className="text-3xl md:text-5xl font-black text-red-400 animate-flash-price">{formatPrice(slide.giaSale)}</span>
                      <span className="text-base text-white/40 line-through">{formatPrice(slide.giaGoc)}</span>
                      <span className={`px-2.5 py-0.5 rounded-lg text-xs font-black bg-gradient-to-r ${slide.accent} text-white`}>-{slide.phanTramGiam}%</span>
                    </motion.div>
                    {slide.features && (
                      <motion.div
                        initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.38 }}
                        className="flex flex-col gap-2 mb-6"
                      >
                        {slide.features.map((f, fi) => (
                          <div key={fi} className="flex items-center gap-3 text-sm text-white/80">
                            <span className="text-green-400 font-bold text-base">✓</span>
                            {f}
                          </div>
                        ))}
                      </motion.div>
                    )}
                    <motion.div
                      initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.48 }}
                      className="flex gap-4"
                    >
                      <Link to={slide.ctaLink}>
                        <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                          className={`px-8 py-3.5 bg-gradient-to-r ${slide.accent} text-white font-bold rounded-xl shadow-2xl flex items-center gap-2 relative overflow-hidden`}>
                          <span className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.15)_50%,transparent_100%)] animate-shimmer-slide" />
                          <span className="relative z-10 flex items-center gap-2">{slide.cta} <FaArrowRight size={14} /></span>
                        </motion.button>
                      </Link>
                      <Link to="/products">
                        <button className="px-8 py-3.5 border border-white/20 text-white hover:bg-white/10 font-semibold rounded-xl transition">
                          Xem tất cả
                        </button>
                      </Link>
                    </motion.div>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.7, delay: 0.2 }}
                    className="hidden md:flex flex-col items-center gap-4 w-[280px] lg:w-[320px]"
                  >
                    {/* === PRODUCT SHOWCASE CARD === */}
                    <div className="relative w-full bg-gradient-to-b from-white/[0.07] to-white/[0.03] backdrop-blur-2xl rounded-3xl p-[1px] border border-white/10 shadow-2xl group">
                      {/* Inner glow overlay */}
                      <div className="absolute inset-0 rounded-3xl bg-gradient-to-b from-red-500/5 via-transparent to-transparent pointer-events-none" />
                      
                      <div className="relative p-6 rounded-3xl overflow-hidden">
                        {/* Background icon glow */}
                        <div className="absolute -top-10 -right-10 opacity-20 blur-3xl select-none pointer-events-none group-hover:opacity-30 transition-opacity duration-700">
                          <slide.Icon size={180} className="text-red-400" />
                        </div>
                        
                        {/* Tag + discount badge */}
                        <div className="flex items-center justify-between mb-5">
                          <span className="text-white/50 text-[10px] font-medium tracking-[0.2em] uppercase">{slide.tag}</span>
                          <div className="bg-gradient-to-br from-red-600 to-orange-500 text-white text-xs font-black px-3 py-1.5 rounded-xl shadow-2xl -rotate-3">
                            -{slide.phanTramGian}%
                          </div>
                        </div>

                        {/* Product image with animated ring */}
                        <div className="relative flex justify-center mb-4">
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-28 h-28 rounded-full bg-gradient-to-br from-red-500/20 via-orange-500/10 to-transparent animate-ping-slow" />
                          </div>
                          <div className="relative w-24 h-24 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform duration-500 overflow-hidden">
                            <img src={slide.productImage} alt={slide.productName}
                              className="w-full h-full object-contain p-1.5 drop-shadow-[0_8px_16px_rgba(0,0,0,0.4)]"
                            />
                          </div>
                        </div>

                        {/* Product name + desc */}
                        <div className="text-center mb-4">
                          <div className="text-base font-bold text-white truncate">{slide.productName}</div>
                          <div className="text-[11px] text-white/50 truncate mt-0.5">{slide.productDesc}</div>
                        </div>

                        {/* Stars + rating */}
                        <div className="flex items-center justify-center gap-2 mb-4">
                          <div className="flex gap-0.5">
                            {[...Array(5)].map((_, i) => (
                              <FaStar key={i} size={13} className="text-yellow-400 drop-shadow-[0_0_3px_rgba(250,204,21,0.3)]" />
                            ))}
                          </div>
                          <span className="text-white/60 text-xs">4.9 (2.3k)</span>
                        </div>

                        {/* === LIVE SOCIAL PROOF === */}
                        <div className="flex items-center justify-center gap-2 mb-4">
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                          </span>
                          <span className="text-[10px] text-green-400/80 font-medium animate-pulse-soft">{127 + slide.id * 33} người đang xem</span>
                        </div>

                        {/* === DEAL PROGRESS BAR === */}
                        <div className="mb-4">
                          <div className="flex justify-between text-[10px] text-white/50 mb-1.5">
                            <span>Đã bán: {85 + slide.id * 7}</span>
                            <span>Còn: {200 - (85 + slide.id * 7)}</span>
                          </div>
                          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${42 + slide.id * 3}%` }}
                              transition={{ duration: 1, delay: 0.5 }}
                              className={`h-full rounded-full bg-gradient-to-r ${slide.accent}`}
                            />
                          </div>
                        </div>

                        {/* === PRICE + SAVINGS === */}
                        <div className="text-center mb-5">
                          <div className="text-[11px] text-white/40 line-through mb-0.5">{formatPrice(slide.giaGoc)}</div>
                          <div className="text-2xl lg:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400 drop-shadow-[0_3px_8px_rgba(220,38,38,0.3)]">
                            {formatPrice(slide.giaSale)}
                          </div>
                          {slide.tietKiem && (
                            <div className="text-[10px] text-emerald-400/80 font-semibold mt-1">🤑 Tiết kiệm: {formatPrice(slide.tietKiem)}</div>
                          )}
                        </div>

                        {/* === ACTION BUTTONS === */}
                        <div className="flex gap-2">
                          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                            className={`flex-1 py-2.5 bg-gradient-to-r ${slide.accent} text-white text-xs font-bold rounded-xl shadow-lg relative overflow-hidden`}>
                            <span className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.12)_50%,transparent_100%)] animate-shimmer-slide" />
                            <span className="relative z-10">Mua ngay</span>
                          </motion.button>
                          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                            className="flex-1 py-2.5 border border-white/15 text-white/80 hover:text-white hover:bg-white/10 text-xs font-bold rounded-xl transition-all">
                            Thêm vào giỏ
                          </motion.button>
                        </div>

                        {/* Bottom decorative line */}
                        <div className="absolute bottom-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                      </div>
                    </div>

                    {/* === COUNTDOWN BAR === */}
                    <div className="w-full bg-white/[0.04] backdrop-blur-md rounded-2xl px-4 py-3 border border-white/5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FaClock size={12} className="text-red-400 animate-pulse" />
                          <span className="text-[10px] text-white/50 font-medium">Kết thúc trong</span>
                        </div>
                        <div className="flex gap-1.5">
                          {['giờ', 'phút', 'giây'].map((unit) => (
                            <div key={unit} className="text-center">
                              <div className="w-7 h-7 bg-gradient-to-b from-white/10 to-white/5 rounded-lg flex items-center justify-center text-xs font-black text-white border border-white/10">
                                {unit === 'giờ' ? String(timeLeft.hours).padStart(2, '0') : unit === 'phút' ? String(timeLeft.minutes).padStart(2, '0') : String(timeLeft.seconds).padStart(2, '0')}
                              </div>
                              <div className="text-[8px] text-white/30 mt-0.5 uppercase">{unit}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Progress bar */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/5 z-10">
          <div key={activeSlide} className="h-full bg-gradient-to-r from-red-500 to-orange-500 rounded-full animate-banner-progress" />
        </div>
      </section>

      {/* Category Grid */}
      <section className="relative max-w-[1440px] mx-auto px-4 overflow-hidden">
        {/* Decorative side elements */}
        <div className="absolute -left-20 top-1/2 -translate-y-1/2 w-40 h-40 rounded-full bg-red-500/5 blur-3xl pointer-events-none" />
        <div className="absolute -right-20 top-1/2 -translate-y-1/2 w-40 h-40 rounded-full bg-orange-500/5 blur-3xl pointer-events-none" />
        {/* Top line accent */}
        <div className="absolute top-0 left-24 right-24 h-px bg-gradient-to-r from-transparent via-red-500/20 to-transparent" />

        <div className="relative flex items-center justify-between mb-8">
          <h2 className="text-2xl font-black text-white flex items-center gap-2 font-display">
            <span className="w-1 h-7 bg-gradient-to-b from-red-500 to-orange-500 rounded-full" /> Danh mục nổi bật
          </h2>
          <Link to="/products" className="text-sm text-red-400 hover:text-red-300 flex items-center gap-1 transition">
            Xem tất cả <FaChevronRight size={10} />
          </Link>
        </div>
        <div className="grid grid-cols-4 gap-4 md:gap-6">
          {categoryItems.map(({ icon: Icon, label, path, count, colors }, i) => (
            <motion.div
              key={label} initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
            >
              <Link to={path}
                className="flex flex-col items-center gap-3 p-5 rounded-xl bg-gradient-to-b from-slate-900/80 to-slate-900/40 border border-slate-800/50 hover:border-red-500/40 hover:shadow-[0_0_25px_rgba(220,38,38,0.12)] transition-all duration-300 group"
              >
                <div className="relative">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${colors} flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:shadow-lg transition-all duration-300`}>
                    <Icon size={28} className="drop-shadow-sm group-hover:animate-rotate-on-hover" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-red-500/40 group-hover:bg-red-500/60 transition-all duration-300" />
                </div>
                <span className="text-sm font-semibold text-slate-300 group-hover:text-white group-hover:font-bold text-center transition-all">{label}</span>
                <span className="text-[11px] text-slate-600 -mt-1">{count}</span>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Flash Sale Banner */}
      <section className="max-w-[1440px] mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }} whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative bg-gradient-to-r from-red-900 via-red-800 to-red-900 rounded-2xl p-6 md:p-8 overflow-hidden animate-glow-pulse"
        >
              <div className="absolute right-0 top-0 text-[200px] opacity-5 select-none animate-bounce-gentle">⚡</div>
          <div className="absolute -left-10 -bottom-10 w-40 h-40 rounded-full bg-red-500/5 blur-3xl" />
          <div className="absolute -right-5 -top-5 w-60 h-60 rounded-full bg-orange-500/5 blur-3xl" />
          <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <FaFire className="text-orange-400 text-2xl animate-scale-pulse" />
                <span className="text-orange-400 font-black text-lg tracking-[0.2em] font-display">FLASH SALE</span>
              </div>
              <h3 className="text-3xl md:text-4xl font-black text-white mb-2 font-display">Giảm đến 70%</h3>
              <p className="text-red-200">Ưu đãi chỉ trong hôm nay — Số lượng có hạn!</p>
            </div>
            <Link to="/products?sale=true">
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}
                className="px-10 py-4 bg-gradient-to-r from-white to-slate-100 text-red-700 font-black text-lg rounded-xl shadow-2xl hover:shadow-red-500/20 transition-all">
                Xem ngay →
              </motion.button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Deal of the Day + Product Carousel */}
      <section className="max-w-[1440px] mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-black text-white flex items-center gap-2 font-display">
            <span className="w-1 h-7 bg-gradient-to-b from-red-500 to-orange-500 rounded-full" /> Sản phẩm mới nhất
          </h2>
          <Link to="/products?sort=newest" className="text-sm text-red-400 hover:text-red-300 flex items-center gap-1 transition">
            Xem thêm <FaChevronRight size={10} />
          </Link>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Deal of the Day featured card */}
          <motion.div
            initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }} className="lg:col-span-2"
          >
            <Link to="/products?sale=true" className="block relative h-full bg-gradient-to-br from-red-950 via-red-900 to-slate-900 rounded-2xl overflow-hidden group border border-red-800/30 hover:border-red-500/50 transition-all duration-500">
              <div className="absolute inset-0 dot-pattern-sm opacity-30" />
              <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-red-500/10 blur-3xl" />
              <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-orange-500/10 blur-3xl" />

              <div className="relative p-6 flex flex-col h-full">
                <div className="flex items-center gap-2 mb-3">
                  <FaGift className="text-orange-400 text-lg" />
                  <span className="text-orange-400 font-black text-sm tracking-[0.15em] font-display">DEAL OF THE DAY</span>
                </div>

                <div className="flex items-center gap-3 mb-4">
                  <motion.span
                    initial={{ scale: 0 }} animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 12 }}
                    className="bg-gradient-to-r from-red-600 to-orange-500 text-white text-2xl font-black px-4 py-1 rounded-xl shadow-lg shadow-red-600/30"
                  >
                    -50%
                  </motion.span>
                  <span className="text-xs text-red-300 font-semibold">Giảm sốc<br/>hôm nay</span>
                </div>

                <div className="flex-1 flex items-center justify-center py-4">
                  <div className="w-36 h-36 rounded-2xl bg-gradient-to-br from-slate-800/80 to-slate-900/80 flex items-center justify-center text-7xl border border-slate-700/50 group-hover:scale-105 group-hover:border-red-500/30 transition-all duration-500 shadow-lg shadow-black/20">
                    🎧
                  </div>
                </div>

                <h3 className="text-white font-bold text-lg leading-snug mb-2 line-clamp-2 group-hover:text-red-300 transition-colors font-display">
                  {dealProduct.TenSanPham}
                </h3>

                <div className="flex items-baseline gap-2 mb-3">
                  <span className="text-2xl font-black text-red-400">₫1.490.000</span>
                  <span className="text-sm text-slate-500 line-through">₫2.990.000</span>
                </div>

                <div className="flex items-center gap-3 mb-4 bg-black/20 rounded-xl p-3">
                  <FaClock className="text-red-400" size={14} />
                  <div className="flex gap-2 text-white font-mono font-bold text-sm">
                    <div className="timer-glow bg-slate-900/80 px-2 py-1 rounded-lg">
                      {String(dealTimer.hours).padStart(2, '0')}
                    </div>
                    <span className="text-red-400">:</span>
                    <div className="timer-glow bg-slate-900/80 px-2 py-1 rounded-lg">
                      {String(dealTimer.minutes).padStart(2, '0')}
                    </div>
                    <span className="text-red-400">:</span>
                    <div className="timer-glow bg-slate-900/80 px-2 py-1 rounded-lg">
                      {String(dealTimer.seconds).padStart(2, '0')}
                    </div>
                  </div>
                  <span className="text-xs text-slate-400 ml-auto">còn lại</span>
                </div>

                <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  className="w-full py-3 bg-gradient-to-r from-red-600 to-orange-600 text-white font-bold rounded-xl shadow-lg shadow-red-600/30"
                >
                  Mua ngay — Giảm 50%
                </motion.button>
              </div>
            </Link>
          </motion.div>

          {/* Product Swiper */}
          <div className="lg:col-span-3">
            <Swiper
              modules={[Navigation]} navigation spaceBetween={16}
              slidesPerView={2} breakpoints={{ 640: { slidesPerView: 2 }, 1024: { slidesPerView: 3 } }}
            >
              {displayProducts.slice(0, 10).map((p, i) => (
                <SwiperSlide key={p.MaSanPham}>
                  <ProductCard product={p} index={i} />
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>
      </section>

      {/* Product Carousel - Bán chạy */}
      <section className="max-w-[1440px] mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-black text-white flex items-center gap-2 font-display">
            <FaFire className="text-orange-400 animate-scale-pulse" /> Bán chạy nhất
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
      <section className="max-w-[1440px] mx-auto px-4">
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
              className="bg-gradient-to-b from-slate-900/60 to-slate-900/30 border border-slate-800/50 rounded-xl p-6 text-center hover:border-red-500/20 hover:shadow-[0_0_20px_rgba(220,38,38,0.06)] transition-all duration-300 group"
            >
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-red-500/20 via-orange-500/10 to-purple-600/10 flex items-center justify-center text-2xl shadow-lg shadow-red-500/5 border border-red-500/10 group-hover:from-red-500/30 group-hover:via-orange-500/20 group-hover:to-purple-600/20 group-hover:scale-105 transition-all duration-300">
                {icon}
              </div>
              <div className="text-3xl font-black gradient-text font-display animate-scale-pulse">{num}</div>
              <div className="text-sm text-slate-400 mt-1">{label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Why MartHub */}
      <section className="max-w-[1440px] mx-auto px-4">
        <div className="text-center mb-10">
          <motion.h2
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl font-black text-white mb-3 font-display"
          >
            Tại sao chọn <span className="gradient-text">MartHub</span>?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
            viewport={{ once: true }} transition={{ delay: 0.15 }}
            className="text-slate-400"
          >
            Cam kết mang đến trải nghiệm mua sắm tốt nhất cho bạn
          </motion.p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: <FaTruck size={28} />, title: 'Giao hàng nhanh chóng', desc: 'Miễn phí giao hàng cho đơn trên 500.000₫. Giao trong 2-4 giờ tại nội thành.' },
            { icon: <FaShieldAlt size={28} />, title: 'Bảo vệ người mua', desc: 'Đảm bảo hàng chính hãng, đổi trả miễn phí trong 30 ngày.' },
            { icon: <FaGem size={28} />, title: 'Giá tốt nhất', desc: 'Cam kết giá rẻ hơn thị trường. Hoàn tiền 200% nếu tìm thấy giá rẻ hơn.' },
            { icon: <FaHeadset size={28} />, title: 'Hỗ trợ 24/7', desc: 'Đội ngũ CSKH luôn sẵn sàng hỗ trợ bạn qua chat, điện thoại & email.' },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12 }}
              className="group bg-gradient-to-b from-slate-900/60 to-slate-900/30 border border-slate-800/50 rounded-xl p-6 text-center hover:border-red-500/30 hover:shadow-[0_0_25px_rgba(220,38,38,0.08)] transition-all duration-300"
            >
              <div className="relative mx-auto mb-4 w-fit">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500/20 via-orange-500/10 to-purple-600/10 flex items-center justify-center shadow-lg shadow-red-500/5 border border-red-500/10 group-hover:from-red-500/30 group-hover:via-orange-500/20 group-hover:to-purple-600/20 group-hover:border-red-500/30 group-hover:shadow-red-500/20 group-hover:scale-110 transition-all duration-300">
                  <span className="text-red-400 drop-shadow-sm group-hover:animate-bounce-gentle">{item.icon}</span>
                </div>
                <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-red-500/40 group-hover:bg-red-500/60 transition-all duration-300" />
              </div>
              <h3 className="text-white font-bold text-lg mb-2 font-display">{item.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Newsletter */}
      <section className="max-w-[1440px] mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative bg-gradient-to-r from-red-900 via-red-800 to-orange-900 rounded-2xl p-8 md:p-12 overflow-hidden animate-glow-pulse"
        >
          <div className="absolute inset-0 dot-pattern opacity-20" />
          <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-red-500/10 blur-3xl" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-orange-500/10 blur-3xl" />

          <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="max-w-lg">
              <h3 className="text-3xl md:text-4xl font-black text-white mb-2 font-display">
                Đừng bỏ lỡ <span className="text-orange-300">ưu đãi</span>
              </h3>
              <p className="text-red-200">
                Nhận thông tin khuyến mãi, sản phẩm mới và voucher độc quyền qua email.
              </p>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); toast.success('Đăng ký nhận tin thành công!'); }}
              className="flex w-full md:w-auto gap-3 shrink-0"
            >
              <div className="relative">
                <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="email" placeholder="Nhập email của bạn..."
                  className="w-64 md:w-80 bg-white/10 border border-white/20 text-white placeholder-slate-400 rounded-xl pl-11 pr-4 py-3.5 focus:outline-none focus:border-red-400 focus:ring-2 focus:ring-red-500/30 backdrop-blur-sm transition-all"
                />
              </div>
              <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                type="submit"
                className="px-7 py-3.5 bg-gradient-to-r from-red-600 to-orange-600 text-white font-bold rounded-xl shadow-lg shadow-red-600/30 flex items-center gap-2 shrink-0"
              >
                <FaPaperPlane size={14} /> Đăng ký
              </motion.button>
            </form>
          </div>
        </motion.div>
      </section>
    </div>
  );
}

export default Home;
