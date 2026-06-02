<<<<<<< HEAD
import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { FaStore, FaPlusCircle, FaShoppingBag, FaHome } from 'react-icons/fa';
import { motion } from 'framer-motion';
=======
import React, { useState, useEffect, useCallback } from 'react';
import { Outlet } from 'react-router-dom';
>>>>>>> 6b22ddd7f1495a754e75169ea503240ad3039d09
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useAuthStore } from '../store/authStore';

const MainLayout = () => {
<<<<<<< HEAD
  const { user, isAuthenticated } = useAuthStore();
  const hasShop = isAuthenticated && user?.shop?.MaCuaHang && user?.shop?.TrangThai === 'HOAT_DONG';

  return (
    <div className="flex flex-col min-h-screen bg-[#050507]">
      <Header />

      {/* Seller Quick Menu - show when user has active shop */}
      {hasShop && (
        <motion.div 
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-gradient-to-r from-orange-900/30 to-red-900/30 border-b border-orange-500/30"
        >
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <FaStore className="text-orange-400" size={16} />
                <span className="text-sm font-semibold text-white">
                  Kênh bán hàng: <span className="text-orange-400">{user?.shop?.TenCuaHang}</span>
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Link
                to="/"
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition text-sm font-medium"
                title="Về trang chủ để mua hàng"
              >
                <FaHome size={14} />
                <span className="hidden sm:inline">Mua hàng</span>
              </Link>

              <Link
                to="/seller/products/new"
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-orange-600/30 hover:bg-orange-600/50 text-orange-300 hover:text-orange-200 transition text-sm font-medium"
              >
                <FaPlusCircle size={14} />
                <span className="hidden sm:inline">Thêm SP</span>
              </Link>

              <Link
                to="/seller/orders"
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition text-sm font-medium"
              >
                <FaShoppingBag size={14} />
                <span className="hidden sm:inline">Đơn hàng</span>
              </Link>

              <Link
                to="/seller/dashboard"
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition text-sm font-medium"
              >
                <span className="text-lg">📊</span>
                <span className="hidden sm:inline">Dashboard</span>
              </Link>
            </div>
          </div>
        </motion.div>
      )}

      <main className="flex-1">
=======
  const [scrollProgress, setScrollProgress] = useState(0);
  const [mouse, setMouse] = useState({ x: 0.5, y: 0.5, px: window.innerWidth / 2, py: window.innerHeight / 2 });
  const [ripples, setRipples] = useState([]);

  useEffect(() => {
    const handleScroll = () => {
      const winScroll = document.documentElement.scrollTop;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      setScrollProgress(Math.min((winScroll / height) * 100, 100));
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleMouseMove = useCallback((e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMouse({
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height,
      px: e.clientX,
      py: e.clientY,
    });
  }, []);

  const handleClick = useCallback((e) => {
    const id = Date.now();
    const r = { id, x: e.clientX, y: e.clientY };
    setRipples(prev => [...prev, r]);
    setTimeout(() => setRipples(prev => prev.filter(rr => rr.id !== id)), 1000);
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-black via-slate-900 to-black relative"
      onMouseMove={handleMouseMove} onClick={handleClick}>

      {/* Scroll progress bar */}
      <div className="fixed top-0 left-0 right-0 h-[3px] z-[60]">
        <div
          className="h-full bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 shadow-[0_0_10px_rgba(220,38,38,0.5)] transition-all duration-150 ease-out"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>
      {/* Interactive space background — planets, orbits, stars, mouse effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">

        {/* === CURSOR GLOW — theo chuột === */}
        <div
          className="absolute inset-0 transition-[background] duration-75 ease-out"
          style={{
            background: `radial-gradient(500px circle at ${mouse.px}px ${mouse.py}px, rgba(255,100,50,0.06), transparent 60%)`,
          }}
        />
        <div
          className="absolute inset-0 transition-[background] duration-150 ease-out"
          style={{
            background: `radial-gradient(300px circle at ${mouse.px}px ${mouse.py}px, rgba(100,180,255,0.04), transparent 60%)`,
          }}
        />

        {/* === CLICK RIPPLES === */}
        {ripples.map(r => (
          <div key={r.id}
            className="absolute rounded-full border-2 border-white/10"
            style={{
              left: r.x,
              top: r.y,
              width: 1, height: 1,
              animation: 'ripple-expand 1s ease-out forwards',
            }}
          />
        ))}

        {/* === DECORATIVE BACKGROUND (mờ để nổi bậc nội dung) === */}
        <div className="absolute inset-0 opacity-40 pointer-events-none">

        {/* Nebula clouds */}
        <div className="absolute -left-40 top-[5%] w-[600px] h-[500px] bg-gradient-to-br from-red-500/5 via-orange-500/3 to-transparent rounded-full blur-[120px] animate-nebula" />
        <div className="absolute -right-40 bottom-[10%] w-[500px] h-[400px] bg-gradient-to-br from-blue-500/4 via-cyan-500/2 to-transparent rounded-full blur-[120px] animate-nebula-2" />
        <div className="absolute left-[20%] top-[50%] w-[300px] h-[300px] bg-gradient-to-br from-purple-500/3 via-pink-500/2 to-transparent rounded-full blur-[100px] animate-nebula" style={{ animationDelay: '2s' }} />

        {/* === GALAXY SPIRAL ARMS === */}
        <div className="absolute top-[30%] left-[20%] w-[600px] h-[400px] rounded-full bg-gradient-to-br from-blue-500/3 via-purple-500/2 to-transparent blur-[80px] rotate-45 animate-nebula" />
        <div className="absolute top-[40%] right-[15%] w-[500px] h-[350px] rounded-full bg-gradient-to-bl from-pink-500/2 via-purple-500/1.5 to-transparent blur-[70px] -rotate-30 animate-nebula-2" />
        <div className="absolute top-[50%] left-[40%] w-[400px] h-[300px] rounded-full bg-gradient-to-r from-orange-500/2 via-yellow-500/1 to-transparent blur-[60px] rotate-12 animate-nebula" style={{ animationDelay: '3s' }} />

        {/* Galaxy core glow */}
        <div className="absolute top-[55%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] rounded-full bg-gradient-to-br from-yellow-400/4 via-orange-400/2 to-transparent blur-[50px]" />
        <div className="absolute top-[55%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[100px] h-[100px] rounded-full bg-white/2 blur-[20px]" />

        {/* === DECORATIVE ORBS + AURORA + GEOMETRIC === */}

        {/* Orbs phát sáng lớn (trái trên + phải dưới) */}
        <div className="absolute -left-20 top-[10%] w-[300px] h-[300px] rounded-full bg-gradient-to-br from-red-500/8 via-orange-500/4 to-transparent blur-[90px] animate-nebula"
          style={{ transform: `translate(${(mouse.x - 0.5) * 25}px, ${(mouse.y - 0.5) * 15}px)`, transition: 'transform 0.15s ease-out' }}
        />
        <div className="absolute -right-20 bottom-[10%] w-[280px] h-[280px] rounded-full bg-gradient-to-bl from-blue-500/6 via-cyan-500/3 to-transparent blur-[80px] animate-nebula-2"
          style={{ transform: `translate(${(mouse.x - 0.5) * -22}px, ${(mouse.y - 0.5) * -13}px)`, transition: 'transform 0.2s ease-out' }}
        />

        {/* Orbs nhỏ hơn */}
        <div className="absolute left-[30%] top-[5%] w-[120px] h-[120px] rounded-full bg-gradient-to-br from-pink-500/5 via-purple-500/3 to-transparent blur-[50px] animate-nebula"
          style={{ animationDelay: '1s', transform: `translate(${(mouse.x - 0.5) * 15}px, ${(mouse.y - 0.5) * 10}px)`, transition: 'transform 0.12s ease-out' }}
        />
        <div className="absolute right-[25%] bottom-[20%] w-[100px] h-[100px] rounded-full bg-gradient-to-tl from-yellow-500/4 via-amber-500/2 to-transparent blur-[40px] animate-nebula-2"
          style={{ animationDelay: '2.5s', transform: `translate(${(mouse.x - 0.5) * -18}px, ${(mouse.y - 0.5) * -8}px)`, transition: 'transform 0.14s ease-out' }}
        />

        {/* Vòng tròn trang trí (decorative rings) */}
        <div className="absolute top-[15%] left-[5%] w-[200px] h-[200px] rounded-full border border-red-500/10 border-t-orange-500/20 animate-orbit"
          style={{ transform: `translate(${(mouse.x - 0.5) * 20}px, ${(mouse.y - 0.5) * 12}px)`, transition: 'transform 0.15s ease-out' }}
        />
        <div className="absolute top-[15%] left-[5%] w-[280px] h-[280px] rounded-full border border-orange-500/6 border-t-red-500/12 animate-orbit-slow"
          style={{ transform: `translate(${(mouse.x - 0.5) * 20}px, ${(mouse.y - 0.5) * 12}px)`, transition: 'transform 0.15s ease-out' }}
        />
        <div className="absolute bottom-[20%] right-[8%] w-[180px] h-[180px] rounded-full border border-blue-500/8 border-t-cyan-500/15 animate-orbit-slow"
          style={{ transform: `translate(${(mouse.x - 0.5) * -20}px, ${(mouse.y - 0.5) * -10}px)`, transition: 'transform 0.18s ease-out' }}
        />
        <div className="absolute bottom-[20%] right-[8%] w-[250px] h-[250px] rounded-full border border-cyan-500/5 border-t-blue-500/10 animate-orbit"
          style={{ transform: `translate(${(mouse.x - 0.5) * -20}px, ${(mouse.y - 0.5) * -10}px)`, transition: 'transform 0.18s ease-out' }}
        />

        {/* Dải aurora (sóng lượn) */}
        <div className="absolute top-[40%] left-0 w-[400px] h-px bg-gradient-to-r from-transparent via-green-500/10 via-cyan-500/8 to-transparent blur-[3px] rotate-12"
          style={{ transform: `translateY(${(mouse.y - 0.5) * 8}px)`, transition: 'transform 0.2s ease-out' }}
        />
        <div className="absolute top-[45%] left-0 w-[350px] h-px bg-gradient-to-r from-transparent via-purple-500/8 via-pink-500/6 to-transparent blur-[2px] -rotate-6"
          style={{ transform: `translateY(${(mouse.y - 0.5) * -6}px)`, transition: 'transform 0.2s ease-out' }}
        />
        <div className="absolute top-[60%] right-0 w-[300px] h-px bg-gradient-to-l from-transparent via-blue-500/8 via-cyan-500/5 to-transparent blur-[2px] rotate-8"
          style={{ transform: `translateY(${(mouse.y - 0.5) * 7}px)`, transition: 'transform 0.2s ease-out' }}
        />
        <div className="absolute top-[65%] right-0 w-[250px] h-px bg-gradient-to-l from-transparent via-red-500/6 via-orange-500/4 to-transparent blur-[2px] -rotate-4"
          style={{ transform: `translateY(${(mouse.y - 0.5) * -5}px)`, transition: 'transform 0.2s ease-out' }}
        />

        {/* Đường cong mảnh trang trí */}
        <svg className="absolute top-[5%] left-[20%] w-[300px] h-[200px] opacity-20" viewBox="0 0 300 200" fill="none">
          <path d="M0 100 Q75 20 150 100 T300 100" stroke="url(#grad1)" strokeWidth="0.5" strokeDasharray="4 6" />
          <defs><linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="transparent" /><stop offset="50%" stopColor="rgba(255,100,100,0.3)" /><stop offset="100%" stopColor="transparent" /></linearGradient></defs>
        </svg>
        <svg className="absolute bottom-[8%] right-[15%] w-[250px] h-[180px] opacity-20" viewBox="0 0 250 180" fill="none">
          <path d="M0 90 Q65 160 125 90 T250 90" stroke="url(#grad2)" strokeWidth="0.5" strokeDasharray="4 6" />
          <defs><linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="transparent" /><stop offset="50%" stopColor="rgba(100,180,255,0.3)" /><stop offset="100%" stopColor="transparent" /></linearGradient></defs>
        </svg>

        {/* === SAO CHỔI (COMETS) — 3 cái bay dọc theo quỹ đạo === */}
        <div className="absolute top-[18%] right-[-50px] animate-comet z-10">
          <div className="relative">
            <div className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_6px_3px_rgba(255,220,150,0.5)]" />
            <div className="absolute top-1/2 right-0 w-[60px] h-px bg-gradient-to-l from-white/60 via-orange-400/30 to-transparent -translate-y-1/2" />
            <div className="absolute top-1/2 right-0 w-[30px] h-[2px] bg-gradient-to-l from-white/30 via-orange-400/15 to-transparent -translate-y-1/2 blur-[1px]" />
          </div>
        </div>
        <div className="absolute top-[60%] right-[-30px] animate-comet-2 z-10">
          <div className="relative">
            <div className="w-1 h-1 rounded-full bg-white shadow-[0_0_4px_2px_rgba(150,200,255,0.4)]" />
            <div className="absolute top-1/2 right-0 w-[45px] h-px bg-gradient-to-l from-white/50 via-blue-400/25 to-transparent -translate-y-1/2" />
          </div>
        </div>
        <div className="absolute top-[78%] right-[-40px] animate-comet-3 z-10">
          <div className="relative">
            <div className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_5px_2px_rgba(200,255,200,0.4)]" />
            <div className="absolute top-1/2 right-0 w-[50px] h-px bg-gradient-to-l from-white/50 via-emerald-400/25 to-transparent -translate-y-1/2" />
          </div>
        </div>

        {/* === MƯA SAO BĂNG (METEOR SHOWER) — 15 vệt lớn === */}
        <div className="absolute top-[5%] right-[10%] w-[2.5px] h-[2.5px] bg-white/85 rounded-full animate-meteor"
          style={{ boxShadow: '0 0 8px 4px rgba(255,200,100,0.5)', animationDelay: '0s' }} />
        <div className="absolute top-[3%] right-[20%] w-[2px] h-[2px] bg-white/75 rounded-full animate-meteor-2"
          style={{ boxShadow: '0 0 7px 3px rgba(150,200,255,0.45)', animationDelay: '2s' }} />
        <div className="absolute top-[7%] right-[15%] w-[2.5px] h-[2.5px] bg-white/85 rounded-full animate-meteor-3"
          style={{ boxShadow: '0 0 8px 4px rgba(255,220,150,0.5)', animationDelay: '4s' }} />
        <div className="absolute top-[2%] right-[25%] w-[2px] h-[2px] bg-white/75 rounded-full animate-meteor"
          style={{ boxShadow: '0 0 7px 3px rgba(200,150,255,0.4)', animationDelay: '6s' }} />
        <div className="absolute top-[9%] right-[8%] w-[2.5px] h-[2.5px] bg-white/85 rounded-full animate-meteor-2"
          style={{ boxShadow: '0 0 8px 4px rgba(255,200,100,0.45)', animationDelay: '8s' }} />
        <div className="absolute top-[4%] right-[30%] w-[2px] h-[2px] bg-white/75 rounded-full animate-meteor-3"
          style={{ boxShadow: '0 0 6px 3px rgba(150,200,255,0.4)', animationDelay: '10s' }} />
        <div className="absolute top-[6%] right-[12%] w-[2.5px] h-[2.5px] bg-white/85 rounded-full animate-meteor"
          style={{ boxShadow: '0 0 8px 4px rgba(255,180,80,0.45)', animationDelay: '12s' }} />
        <div className="absolute top-[1%] right-[22%] w-[2px] h-[2px] bg-white/75 rounded-full animate-meteor-2"
          style={{ boxShadow: '0 0 6px 3px rgba(255,200,150,0.4)', animationDelay: '14s' }} />
        <div className="absolute top-[10%] right-[5%] w-[2.5px] h-[2.5px] bg-white/85 rounded-full animate-meteor-3"
          style={{ boxShadow: '0 0 8px 4px rgba(150,200,255,0.45)', animationDelay: '16s' }} />
        <div className="absolute top-[8%] right-[18%] w-[2px] h-[2px] bg-white/75 rounded-full animate-meteor"
          style={{ boxShadow: '0 0 6px 3px rgba(255,220,100,0.4)', animationDelay: '18s' }} />
        <div className="absolute top-[3%] right-[35%] w-[2.5px] h-[2.5px] bg-white/85 rounded-full animate-meteor-2"
          style={{ boxShadow: '0 0 7px 3px rgba(200,150,255,0.4)', animationDelay: '1s' }} />
        <div className="absolute top-[11%] right-[28%] w-[2px] h-[2px] bg-white/75 rounded-full animate-meteor-3"
          style={{ boxShadow: '0 0 6px 3px rgba(150,200,255,0.4)', animationDelay: '7s' }} />
        <div className="absolute top-[5%] right-[40%] w-[2.5px] h-[2.5px] bg-white/85 rounded-full animate-meteor"
          style={{ boxShadow: '0 0 7px 3px rgba(255,200,100,0.4)', animationDelay: '13s' }} />
        <div className="absolute top-[7%] right-[32%] w-[2px] h-[2px] bg-white/75 rounded-full animate-meteor-2"
          style={{ boxShadow: '0 0 6px 3px rgba(255,180,80,0.4)', animationDelay: '5s' }} />
        <div className="absolute top-[1%] right-[5%] w-[2.5px] h-[2.5px] bg-white/85 rounded-full animate-meteor-3"
          style={{ boxShadow: '0 0 8px 4px rgba(200,150,255,0.45)', animationDelay: '9s' }} />

        {/* === SAO BĂNG BAY NGANG + BAY LÊN === */}
        <div className="absolute left-[5%] top-[30%] w-[2.5px] h-[2.5px] bg-white/85 rounded-full animate-meteor-cross"
          style={{ boxShadow: '0 0 7px 3px rgba(255,200,100,0.45)' }} />
        <div className="absolute left-[8%] top-[55%] w-[2px] h-[2px] bg-white/75 rounded-full animate-meteor-cross-2"
          style={{ boxShadow: '0 0 6px 3px rgba(150,200,255,0.4)', animationDelay: '4s' }} />
        <div className="absolute left-[3%] top-[70%] w-[2.5px] h-[2.5px] bg-white/85 rounded-full animate-meteor-cross"
          style={{ boxShadow: '0 0 7px 3px rgba(200,150,255,0.4)', animationDelay: '8s' }} />
        <div className="absolute left-[10%] top-[20%] w-[2px] h-[2px] bg-white/75 rounded-full animate-meteor-cross-2"
          style={{ boxShadow: '0 0 6px 3px rgba(255,220,150,0.4)', animationDelay: '12s' }} />
        <div className="absolute left-[15%] bottom-[10%] w-[2.5px] h-[2.5px] bg-white/85 rounded-full animate-meteor-up"
          style={{ boxShadow: '0 0 7px 3px rgba(100,200,255,0.4)' }} />
        <div className="absolute left-[25%] bottom-[5%] w-[2px] h-[2px] bg-white/75 rounded-full animate-meteor-up"
          style={{ boxShadow: '0 0 6px 3px rgba(255,180,100,0.4)', animationDelay: '5s' }} />
        <div className="absolute right-[30%] bottom-[8%] w-[2.5px] h-[2.5px] bg-white/85 rounded-full animate-meteor-up"
          style={{ boxShadow: '0 0 7px 3px rgba(200,150,255,0.4)', animationDelay: '10s' }} />
        <div className="absolute left-[35%] bottom-[3%] w-[2px] h-[2px] bg-white/75 rounded-full animate-meteor-up"
          style={{ boxShadow: '0 0 6px 3px rgba(150,200,255,0.4)', animationDelay: '15s' }} />

        {/* === ĐÁ VỤN TRÔI NỔI (DEBRIS) === */}
        {[
          { t: 18, l: 50, s: 4, c: 'bg-slate-400/30', an: '' },
          { t: 35, l: 10, s: 3, c: 'bg-slate-300/25', an: '-2' },
          { t: 65, l: 85, s: 3.5, c: 'bg-slate-400/25', an: '-3' },
          { t: 42, l: 75, s: 2.5, c: 'bg-slate-300/20', an: '-2' },
          { t: 72, l: 20, s: 3, c: 'bg-slate-400/20', an: '-3' },
          { t: 8, l: 65, s: 2, c: 'bg-slate-300/25', an: '' },
          { t: 50, l: 90, s: 3, c: 'bg-slate-400/20', an: '-2' },
          { t: 82, l: 45, s: 2.5, c: 'bg-slate-300/25', an: '-3' },
          { t: 25, l: 30, s: 3.5, c: 'bg-slate-400/30', an: '' },
          { t: 60, l: 5, s: 2, c: 'bg-slate-300/20', an: '-3' },
        ].map((d, i) => (
          <div key={`debris-${i}`}
            className={`absolute rounded ${d.c} animate-debris${d.an}`}
            style={{
              top: `${d.t}%`,
              left: `${d.l}%`,
              width: `${d.s}px`,
              height: `${d.s * 0.6}px`,
              animationDelay: `${i * 1.8}s`,
              clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
            }}
          />
        ))}

        {/* === PHA LÊ LẤP LÁNH (FLOATING GEMS) === */}
        {[
          { t: 12, l: 45, s: 6, d: 0, c: 'from-pink-300/40 to-purple-400/20' },
          { t: 28, l: 78, s: 5, d: 2, c: 'from-cyan-300/35 to-blue-400/20' },
          { t: 48, l: 15, s: 4.5, d: 4, c: 'from-yellow-200/40 to-orange-400/20' },
          { t: 68, l: 60, s: 5.5, d: 6, c: 'from-green-300/35 to-emerald-400/20' },
          { t: 85, l: 35, s: 4, d: 8, c: 'from-red-300/35 to-pink-400/20' },
          { t: 15, l: 88, s: 5, d: 10, c: 'from-blue-300/35 to-indigo-400/20' },
          { t: 55, l: 40, s: 4.5, d: 12, c: 'from-purple-300/35 to-pink-400/20' },
          { t: 75, l: 70, s: 5, d: 14, c: 'from-amber-300/35 to-orange-400/20' },
        ].map((g, i) => (
          <div key={`gem-${i}`}
            className="absolute animate-gem"
            style={{ top: `${g.t}%`, left: `${g.l}%`, animationDelay: `${g.d}s` }}>
            <div className={`w-${Math.round(g.s)}px h-${Math.round(g.s)}px bg-gradient-to-br ${g.c} rounded-sm`}
              style={{
                width: g.s, height: g.s,
                clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
                boxShadow: '0 0 6px 2px rgba(255,255,255,0.1)',
              }}
            />
          </div>
        ))}

        {/* === TIA SÁNG BẮN RA (SPARKLE BURSTS) === */}
        {[
          { t: 8, l: 30, s: 8, d: 0, c: 'from-yellow-200/50 to-transparent' },
          { t: 22, l: 60, s: 6, d: 1, c: 'from-white/50 to-transparent' },
          { t: 40, l: 20, s: 7, d: 2.5, c: 'from-cyan-200/45 to-transparent' },
          { t: 58, l: 80, s: 6.5, d: 4, c: 'from-pink-200/45 to-transparent' },
          { t: 78, l: 45, s: 7, d: 5.5, c: 'from-amber-200/45 to-transparent' },
          { t: 90, l: 65, s: 5.5, d: 7, c: 'from-purple-200/40 to-transparent' },
        ].map((s, i) => (
          <div key={`sparkle-${i}`}
            className="absolute animate-sparkle"
            style={{ top: `${s.t}%`, left: `${s.l}%`, animationDelay: `${s.d}s` }}>
            <div className={`w-${Math.round(s.s)}px h-${Math.round(s.s)}px bg-gradient-to-br ${s.c} rounded-full`}
              style={{
                width: s.s, height: s.s,
                boxShadow: '0 0 8px 4px rgba(255,255,255,0.08)',
              }}
            />
          </div>
        ))}

        {/* === VỆT BỤI PHÁT SÁNG (DUST TRAILS) === */}
        {[
          { t: 10, l: 55, d: 0, c: 'from-orange-300/30 to-transparent' },
          { t: 30, l: 82, d: 2, c: 'from-blue-300/25 to-transparent' },
          { t: 52, l: 25, d: 4.5, c: 'from-purple-300/25 to-transparent' },
          { t: 70, l: 68, d: 7, c: 'from-green-300/25 to-transparent' },
          { t: 88, l: 40, d: 9.5, c: 'from-pink-300/25 to-transparent' },
        ].map((t, i) => (
          <div key={`dust-${i}`}
            className={`absolute h-px bg-gradient-to-r ${t.c} blur-[1px] animate-dust-trail`}
            style={{
              top: `${t.t}%`,
              left: `${t.l}%`,
              animationDelay: `${t.d}s`,
            }}
          />
        ))}

        {/* === THIÊN THẠCH (ASTEROIDS) === */}
        {[...Array(6)].map((_, i) => (
          <div key={`ast-${i}`}
            className={`absolute w-[3px] h-[3px] rounded-full bg-slate-300/40 ${['animate-asteroid','animate-asteroid-2','animate-asteroid-3','animate-asteroid-4'][i%4]}`}
            style={{
              top: `${12 + i * 12}%`,
              left: `${68 + (i % 4) * 6}%`,
              animationDelay: `${i * 2}s`,
              width: `${2 + (i % 2)}px`,
              height: `${2 + (i % 2)}px`,
            }}
          />
        ))}

        {/* === PHI THUYỀN (SPACESHIPS) — 3 chiếc bay các hướng === */}
        <div className="absolute top-[15%] left-[-60px] animate-spaceship z-10">
          <div className="relative w-12 h-5">
            {/* Thân phi thuyền */}
            <div className="absolute inset-0 bg-gradient-to-r from-slate-300/40 to-slate-400/30 rounded-full blur-[0.5px]"
              style={{ clipPath: 'polygon(0% 50%, 20% 0%, 80% 0%, 100% 50%, 80% 100%, 20% 100%)' }} />
            {/* Cửa sổ */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-cyan-300/50 animate-blink-light" />
            {/* Đuôi lửa */}
            <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-3 h-1.5 bg-gradient-to-l from-orange-400/50 via-yellow-400/30 to-transparent rounded-full blur-[1px]" />
            <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-2 h-1 bg-gradient-to-l from-orange-300/30 to-transparent rounded-full blur-[2px]" />
          </div>
        </div>
        <div className="absolute top-[55%] right-[-50px] animate-spaceship-2 z-10">
          <div className="relative w-10 h-4">
            <div className="absolute inset-0 bg-gradient-to-r from-slate-300/35 to-slate-400/25 rounded-full blur-[0.5px]"
              style={{ clipPath: 'polygon(0% 50%, 20% 0%, 80% 0%, 100% 50%, 80% 100%, 20% 100%)' }} />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-purple-300/40" />
            <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-2.5 h-1 bg-gradient-to-r from-orange-400/40 via-yellow-400/25 to-transparent rounded-full blur-[1px]" />
          </div>
        </div>
        <div className="absolute top-[38%] left-[-40px] animate-spaceship-3 z-10">
          <div className="relative w-8 h-3.5">
            <div className="absolute inset-0 bg-gradient-to-r from-slate-300/30 to-slate-400/20 rounded-full blur-[0.5px]"
              style={{ clipPath: 'polygon(0% 50%, 20% 0%, 80% 0%, 100% 50%, 80% 100%, 20% 100%)' }} />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-1 rounded-full bg-green-300/40" />
            <div className="absolute -left-2.5 top-1/2 -translate-y-1/2 w-2 h-1 bg-gradient-to-l from-orange-400/35 via-yellow-400/20 to-transparent rounded-full blur-[1px]" />
          </div>
        </div>

        {/* === VỆ TINH (SATELLITES) — 2 cái với đèn nhấp nháy === */}
        <div className="absolute top-[6%] right-[15%] animate-satellite z-10">
          <div className="relative w-14 h-10">
            {/* Thân vệ tinh */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-7 bg-slate-400/30 rounded-md border border-slate-400/20" />
            {/* Tấm pin mặt trời (trái) */}
            <div className="absolute top-1/2 left-0 -translate-y-1/2 w-5 h-5 bg-gradient-to-b from-blue-400/30 to-cyan-400/20 border border-blue-400/15"
              style={{ clipPath: 'polygon(0% 20%, 100% 0%, 100% 100%, 0% 80%)' }} />
            {/* Tấm pin mặt trời (phải) */}
            <div className="absolute top-1/2 right-0 -translate-y-1/2 w-5 h-5 bg-gradient-to-b from-blue-400/30 to-cyan-400/20 border border-blue-400/15"
              style={{ clipPath: 'polygon(0% 0%, 100% 20%, 100% 80%, 0% 100%)' }} />
            {/* Ăng-ten */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-3 bg-slate-400/40" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2.5 h-2 rounded-full bg-cyan-300/60 animate-blink-light shadow-[0_0_6px_3px_rgba(100,200,255,0.3)]" />
            {/* Đèn nhấp nháy thân */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-cyan-300/50 animate-blink-light shadow-[0_0_4px_2px_rgba(100,200,255,0.2)]"
              style={{ animationDelay: '1.5s' }} />
          </div>
        </div>
        <div className="absolute bottom-[22%] left-[8%] animate-satellite-2 z-10">
          <div className="relative w-12 h-9">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-6 bg-slate-400/25 rounded-md border border-slate-400/15" />
            <div className="absolute top-1/2 left-0 -translate-y-1/2 w-4 h-4 bg-gradient-to-b from-blue-400/25 to-cyan-400/15 border border-blue-400/10"
              style={{ clipPath: 'polygon(0% 20%, 100% 0%, 100% 100%, 0% 80%)' }} />
            <div className="absolute top-1/2 right-0 -translate-y-1/2 w-4 h-4 bg-gradient-to-b from-blue-400/25 to-cyan-400/15 border border-blue-400/10"
              style={{ clipPath: 'polygon(0% 0%, 100% 20%, 100% 80%, 0% 100%)' }} />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-px h-2.5 bg-slate-400/35" />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-purple-300/60 animate-blink-light shadow-[0_0_5px_2px_rgba(150,100,255,0.3)]" />
          </div>
        </div>

        {/* === BỤI SAO BAY (FLOATING PARTICLES) — 30 hạt === */}
        {[...Array(30)].map((_, i) => (
          <div key={`particle-${i}`}
            className="absolute rounded-full"
            style={{
              left: `${(i * 3.3 + i * i * 0.5) % 100}%`,
              bottom: `${(i * 4.1 + 3) % 50}%`,
              width: `${1 + (i % 3)}px`,
              height: `${1 + (i % 3)}px`,
              background: `rgba(255,255,255,${0.1 + (i % 5) * 0.05})`,
              animation: `float-up ${5 + i % 6}s ease-in-out infinite`,
              animationDelay: `${i * 0.4}s`,
            }}
          />
        ))}

        {/* === HẠT ZIGZAG (ZIGZAG LIGHT PARTICLES) — 16 hạt === */}
        {[...Array(16)].map((_, i) => (
          <div key={`zigzag-${i}`}
            className="absolute w-[2px] h-[2px] rounded-full bg-white/30 animate-zigzag"
            style={{
              left: `${8 + (i * 5.5) % 84}%`,
              top: `${12 + (i * 4.2) % 70}%`,
              animationDelay: `${i * 0.8}s`,
              boxShadow: `0 0 ${2 + (i % 3)}px ${1 + (i % 2)}px rgba(255,${200 + i % 55},${100 + i % 155},0.15)`,
            }}
          />
        ))}

        {/* === CHẤM SÁNG NHẤP NHÁY (PULSING DOTS) — 20 chấm === */}
        {[...Array(20)].map((_, i) => (
          <div key={`dotpulse-${i}`}
            className="absolute rounded-full animate-dot-pulse"
            style={{
              left: `${(i * 4.7 + 2) % 96}%`,
              top: `${(i * 3.9 + 5) % 90}%`,
              width: `${2 + (i % 2)}px`,
              height: `${2 + (i % 2)}px`,
              background: `radial-gradient(circle, rgba(255,255,255,0.4), transparent)`,
              animationDelay: `${i * 0.25}s`,
            }}
          />
        ))}

        {/* === LỤC GIÁC TRÔI (FLOATING HEXAGONS) — 12 cái === */}
        {[...Array(12)].map((_, i) => {
          const colors = ['border-red-400/20', 'border-blue-400/20', 'border-green-400/20', 'border-purple-400/20', 'border-yellow-400/20', 'border-cyan-400/20'];
          return (
            <div key={`hex-${i}`}
              className="absolute animate-hex"
              style={{
                left: `${5 + (i * 7.8) % 90}%`,
                top: `${8 + (i * 5.3) % 80}%`,
                animationDelay: `${i * 2}s`,
              }}>
              <div className={`w-4 h-4 border ${colors[i % 6]} rounded-sm`}
                style={{
                  clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
                }}
              />
            </div>
          );
        })}

        {/* === VÒNG NĂNG LƯỢNG (ENERGY RINGS) — 10 vòng === */}
        {[...Array(10)].map((_, i) => (
          <div key={`energy-${i}`}
            className="absolute rounded-full border border-white/10 animate-energy-ring"
            style={{
              left: `${10 + (i * 8) % 80}%`,
              top: `${8 + (i * 7) % 80}%`,
              width: `${20 + i * 3}px`,
              height: `${20 + i * 3}px`,
              animationDelay: `${i * 0.8}s`,
              borderWidth: `${0.5 + (i % 2) * 0.5}px`,
            }}
          />
        ))}

        {/* === QUẠT ÁNH SÁNG (LIGHT FANS) — 8 cái === */}
        {[...Array(8)].map((_, i) => (
          <div key={`fan-${i}`}
            className="absolute w-[120px] h-[60px] animate-light-fan"
            style={{
              left: `${5 + (i * 12) % 85}%`,
              top: `${10 + (i * 9) % 75}%`,
              animationDelay: `${i * 2.5}s`,
            }}>
            <div className="w-full h-full bg-gradient-to-r from-transparent via-white/5 to-transparent rounded-full blur-[8px]" />
          </div>
        ))}

        {/* === SAO BĂNG BỔ SUNG (EXTRA METEORS) — 30 vệt === */}
        {[...Array(30)].map((_, i) => (
          <div key={`extra-meteor-${i}`}
            className={`absolute rounded-full ${i % 3 === 0 ? 'animate-meteor' : i % 3 === 1 ? 'animate-meteor-2' : 'animate-meteor-3'}`}
            style={{
              top: `${1 + (i * 3.1) % 12}%`,
              right: `${5 + (i * 2.3) % 45}%`,
              width: `${2 + (i % 2)}px`,
              height: `${2 + (i % 2)}px`,
              background: i % 2 === 0 ? 'rgba(255,255,255,0.85)' : 'rgba(200,220,255,0.75)',
              boxShadow: `0 0 ${5 + (i % 4)}px ${2 + (i % 2)}px rgba(${255 - i % 80},${150 + i % 100},${100 + i % 50},0.3)`,
              animationDelay: `${i * 0.6}s`,
            }}
          />
        ))}

        {/* === HẠT SÁNG RẢI RÁC (SCATTERED LIGHT DUST) — 40 hạt === */}
        {[...Array(40)].map((_, i) => (
          <div key={`lightdust-${i}`}
            className="absolute rounded-full"
            style={{
              left: `${(i * 2.5 + 1) % 100}%`,
              top: `${(i * 2.3 + 3) % 95}%`,
              width: `${0.5 + (i % 3) * 0.5}px`,
              height: `${0.5 + (i % 3) * 0.5}px`,
              background: `rgba(255,255,255,${0.03 + (i % 5) * 0.02})`,
              animation: `twinkle ${2 + (i % 5)}s ease-in-out infinite`,
              animationDelay: `${i * 0.15}s`,
            }}
          />
        ))}

        {/* === STARS === */}
        <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[length:20px_20px]" />
        <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[length:40px_40px] bg-[position:10px_10px]" />

        {/* Bright stars with twinkle — 45 ngôi sao */}
        {[...Array(45)].map((_, i) => {
          const leftPos = [2, 8, 15, 22, 30, 38, 45, 52, 60, 68, 75, 82, 88, 92, 48, 55, 62, 35, 18, 72, 40, 65, 28, 85, 95, 12, 58, 78, 20, 50, 5, 25, 42, 70, 90, 33, 17, 63, 80, 10, 37, 53, 87, 73, 96];
          const topPos = [4, 8, 14, 3, 22, 10, 28, 16, 35, 6, 42, 20, 50, 12, 55, 8, 62, 3, 68, 18, 72, 25, 78, 30, 82, 15, 85, 22, 90, 10, 38, 48, 58, 32, 65, 18, 45, 70, 5, 75, 28, 55, 40, 60, 85];
          const sizes = [2, 1.5, 1, 2.5, 1.5, 1, 2, 1, 1.5, 2, 1, 1.5, 1, 2, 1, 1.5, 1, 2, 1.5, 1, 2, 1, 1.5, 1, 2, 1, 1.5, 1, 2, 1, 1.8, 1.2, 2.2, 1, 1.5, 2, 1.3, 0.8, 1.8, 1.5, 1, 2, 1.2, 1.8, 1];
          return (
            <div key={i}
              className={`absolute rounded-full bg-white ${i % 5 === 0 ? 'animate-twinkle' : i % 5 === 1 ? 'animate-twinkle-slow' : i % 5 === 2 ? 'animate-twinkle-fast' : i % 5 === 3 ? 'animate-pulse-soft' : 'animate-dot-pulse'}`}
              style={{
                left: `${leftPos[i]}%`,
                top: `${topPos[i]}%`,
                width: `${sizes[i]}px`,
                height: `${sizes[i]}px`,
                animationDelay: `${i * 0.25}s`,
                opacity: 0.3 + (i % 4) * 0.1,
              }}
            />
          );
        })}

        {/* === VERTICAL ACCENTS (2 bên) === */}
        <div className="hidden 2xl:block absolute left-12 top-[5%] bottom-[5%] w-px bg-gradient-to-b from-transparent via-red-500/15 via-orange-500/8 to-transparent"
          style={{ transform: `translateY(${(mouse.y - 0.5) * 10}px)`, transition: 'transform 0.2s ease-out' }} />
        <div className="hidden 2xl:block absolute right-12 top-[5%] bottom-[5%] w-px bg-gradient-to-b from-transparent via-blue-500/12 via-cyan-500/6 to-transparent"
          style={{ transform: `translateY(${(mouse.y - 0.5) * -8}px)`, transition: 'transform 0.2s ease-out' }} />
        <div className="hidden 2xl:block absolute left-12 top-[5%] w-2 h-2 rounded-full bg-red-400/40 animate-twinkle" />
        <div className="hidden 2xl:block absolute left-12 top-[50%] w-1.5 h-1.5 rounded-full bg-orange-400/30 animate-twinkle-slow" style={{ animationDelay: '0.8s' }} />
        <div className="hidden 2xl:block absolute left-12 bottom-[5%] w-2 h-2 rounded-full bg-red-400/40 animate-twinkle" style={{ animationDelay: '1.5s' }} />
        <div className="hidden 2xl:block absolute right-12 top-[5%] w-2 h-2 rounded-full bg-blue-400/35 animate-twinkle" />
        <div className="hidden 2xl:block absolute right-12 top-[50%] w-1.5 h-1.5 rounded-full bg-cyan-400/25 animate-twinkle-slow" style={{ animationDelay: '1.2s' }} />
        <div className="hidden 2xl:block absolute right-12 bottom-[5%] w-2 h-2 rounded-full bg-blue-400/35 animate-twinkle" style={{ animationDelay: '0.6s' }} />

        </div>

        {/* === WATERMARKS === */}
        <div className="hidden 2xl:block absolute bottom-8 left-8 text-white/[0.04] text-xs font-bold tracking-[0.35em] select-none"
          style={{ writingMode: 'vertical-rl' }}>
          MARTHUB
        </div>
        <div className="hidden 2xl:block absolute top-8 right-8 text-white/[0.04] text-xs font-bold tracking-[0.35em] select-none"
          style={{ writingMode: 'vertical-rl' }}>
          SINCE 2024
        </div>
      </div>

      <Header />
      <main className="flex-1 relative z-10">
>>>>>>> 6b22ddd7f1495a754e75169ea503240ad3039d09
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;
