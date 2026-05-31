import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FaFacebookF, FaInstagram, FaTwitter, FaYoutube, FaTiktok,
  FaPhone, FaEnvelope, FaMapMarkerAlt, FaGem, FaCrown, FaShieldAlt
} from 'react-icons/fa';

function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    'Về MartHub': [
      { label: 'Giới thiệu', to: '/about' },
      { label: 'Tuyển dụng', to: '/careers' },
      { label: 'Điều khoản', to: '/terms' },
      { label: 'Chính sách bảo mật', to: '/privacy' },
      { label: 'Chính sách vận chuyển', to: '/shipping' },
    ],
    'Dành cho khách hàng': [
      { label: 'Hướng dẫn mua hàng', to: '/guide' },
      { label: 'Hướng dẫn thanh toán', to: '/payment-guide' },
      { label: 'Chính sách đổi trả', to: '/return-policy' },
      { label: 'Chăm sóc khách hàng', to: '/support' },
      { label: 'Câu hỏi thường gặp', to: '/faq' },
    ],
    'Hợp tác & Liên kết': [
      { label: 'Quy chế hoạt động', to: '/regulations' },
      { label: 'Bán hàng cùng MartHub', to: '/seller/register' },
      { label: 'Chương trình Affiliate', to: '/affiliate' },
      { label: 'Đối tác vận chuyển', to: '/shipping-partners' },
      { label: 'Đối tác thanh toán', to: '/payment-partners' },
    ],
  };

  const socialLinks = [
    { icon: FaFacebookF, url: 'https://facebook.com', color: 'hover:text-blue-500', bg: 'hover:bg-blue-500/10' },
    { icon: FaInstagram, url: 'https://instagram.com', color: 'hover:text-pink-500', bg: 'hover:bg-pink-500/10' },
    { icon: FaTwitter, url: 'https://twitter.com', color: 'hover:text-sky-500', bg: 'hover:bg-sky-500/10' },
    { icon: FaYoutube, url: 'https://youtube.com', color: 'hover:text-red-500', bg: 'hover:bg-red-500/10' },
    { icon: FaTiktok, url: 'https://tiktok.com', color: 'hover:text-white', bg: 'hover:bg-white/10' },
  ];

  const paymentMethods = ['💳 Visa', '💳 Mastercard', '🏦 ATM', '📱 MoMo', '💰 VNPay', '🏪 COD'];

  return (
    <footer className="relative bg-gradient-to-b from-black via-gray-950 to-black border-t border-red-900/30 mt-20">
      {/* Decorative top border */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold-700 to-transparent" />
      
      <div className="max-w-7xl mx-auto px-4 py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-3 mb-6 group">
              <motion.div
                whileHover={{ scale: 1.05, rotate: 5 }}
                className="w-14 h-14 bg-gradient-to-br from-red-900 via-red-800 to-red-950 rounded-xl flex items-center justify-center font-black text-2xl shadow-xl shadow-red-900/50 border border-red-700/50"
              >
                <span className="gradient-text-gold">M</span>
              </motion.div>
              <div>
                <span className="text-2xl font-display font-bold gradient-text-luxury block">MartHub</span>
                <span className="text-[10px] text-gold-700 font-bold tracking-widest">LUXURY SHOPPING</span>
              </div>
            </Link>
            <p className="text-gray-400 text-sm mb-6 leading-relaxed">
              Nền tảng thương mại điện tử cao cấp hàng đầu Việt Nam. Mang đến trải nghiệm mua sắm đẳng cấp với hàng triệu sản phẩm chính hãng.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm text-gray-400 hover:text-gold-700 transition group">
                <div className="w-8 h-8 rounded-lg bg-red-950/30 border border-red-900/50 flex items-center justify-center group-hover:bg-red-950/50 transition">
                  <FaPhone size={12} className="text-red-400" />
                </div>
                <span className="font-medium">1900 1234</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-400 hover:text-gold-700 transition group">
                <div className="w-8 h-8 rounded-lg bg-red-950/30 border border-red-900/50 flex items-center justify-center group-hover:bg-red-950/50 transition">
                  <FaEnvelope size={12} className="text-red-400" />
                </div>
                <span className="font-medium">support@marthub.vn</span>
              </div>
              <div className="flex items-start gap-3 text-sm text-gray-400 hover:text-gold-700 transition group">
                <div className="w-8 h-8 rounded-lg bg-red-950/30 border border-red-900/50 flex items-center justify-center group-hover:bg-red-950/50 transition flex-shrink-0">
                  <FaMapMarkerAlt size={12} className="text-red-400" />
                </div>
                <span className="font-medium">123 Đường ABC, Quận 1, TP.HCM</span>
              </div>
            </div>
          </div>

          {/* Links Columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h3 className="text-white font-bold text-sm mb-6 flex items-center gap-2 font-heading">
                <span className="w-1 h-4 bg-gradient-to-b from-red-900 to-gold-700 rounded-full" />
                {title}
              </h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.to}>
                    <Link
                      to={link.to}
                      className="text-gray-400 hover:text-gold-700 text-sm transition-colors flex items-center gap-2 group"
                    >
                      <span className="w-1 h-1 rounded-full bg-gray-700 group-hover:bg-gold-700 transition" />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="divider-luxury mb-12" />

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
          {/* Social Links */}
          <div>
            <h4 className="text-white font-bold text-sm mb-4 font-heading">Kết nối với chúng tôi</h4>
            <div className="flex gap-3">
              {socialLinks.map(({ icon: Icon, url, color, bg }, i) => (
                <motion.a
                  key={i}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className={`w-10 h-10 rounded-lg bg-gray-900 border border-gray-800 ${bg} flex items-center justify-center text-gray-400 ${color} transition-all`}
                >
                  <Icon size={16} />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Payment Methods */}
          <div>
            <h4 className="text-white font-bold text-sm mb-4 font-heading">Phương thức thanh toán</h4>
            <div className="flex flex-wrap gap-2">
              {paymentMethods.map((method, i) => (
                <span
                  key={i}
                  className="px-3 py-1.5 bg-gray-900 border border-gray-800 rounded-lg text-xs text-gray-400 font-medium"
                >
                  {method}
                </span>
              ))}
            </div>
          </div>

          {/* Certifications */}
          <div>
            <h4 className="text-white font-bold text-sm mb-4 font-heading">Chứng nhận</h4>
            <div className="flex gap-3">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="px-4 py-3 bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-lg flex items-center gap-2 group hover:border-gold-900/50 transition"
              >
                <FaShieldAlt className="text-green-500 text-xl" />
                <div>
                  <div className="text-xs font-bold text-white">Đã xác thực</div>
                  <div className="text-[10px] text-gray-500">Bộ Công Thương</div>
                </div>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="px-4 py-3 bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-lg flex items-center gap-2 group hover:border-gold-900/50 transition"
              >
                <FaCrown className="text-gold-700 text-xl" />
                <div>
                  <div className="text-xs font-bold text-white">Top 1</div>
                  <div className="text-[10px] text-gray-500">E-commerce VN</div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="divider-luxury my-8" />

        {/* Copyright */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
          <p className="flex items-center gap-2">
            <FaGem className="text-gold-700" size={14} />
            <span>© {currentYear} <span className="text-gold-700 font-bold">MartHub</span>. All rights reserved.</span>
          </p>
          <div className="flex gap-6">
            <Link to="/terms" className="hover:text-gold-700 transition">Điều khoản</Link>
            <span className="text-gray-800">|</span>
            <Link to="/privacy" className="hover:text-gold-700 transition">Bảo mật</Link>
            <span className="text-gray-800">|</span>
            <Link to="/sitemap" className="hover:text-gold-700 transition">Sitemap</Link>
          </div>
        </div>
      </div>

      {/* Decorative bottom glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-red-900/50 to-transparent" />
    </footer>
  );
}

export default Footer;
