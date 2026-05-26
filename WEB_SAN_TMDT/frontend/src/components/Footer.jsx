import React from 'react';
import { Link } from 'react-router-dom';
import { FaFacebook, FaInstagram, FaYoutube, FaTwitter, FaShieldAlt, FaTruck, FaHeadset, FaGift } from 'react-icons/fa';

const features = [
  { icon: FaShieldAlt, title: 'Mua hàng an toàn', desc: 'Thanh toán qua sàn bảo mật' },
  { icon: FaTruck, title: 'Giao hàng nhanh', desc: 'Ship toàn quốc 2-5 ngày' },
  { icon: FaHeadset, title: 'Hỗ trợ 24/7', desc: 'Chat trực tiếp với CSKH' },
  { icon: FaGift, title: 'Ưu đãi VIP', desc: 'Điểm tích lũy đổi quà' },
];

const footerLinks = {
  'Về MartHub': [
    { label: 'Giới thiệu', to: '/about' },
    { label: 'Tuyển dụng', to: '/careers' },
    { label: 'Tin tức', to: '/news' },
    { label: 'Blog', to: '/blog' },
  ],
  'Dịch vụ': [
    { label: 'Bán hàng trên MartHub', to: '/seller/register' },
    { label: 'Quảng cáo', to: '/advertise' },
    { label: 'Affiliate', to: '/affiliate' },
    { label: 'Flash Sale', to: '/flash-sale' },
  ],
  'Hỗ trợ': [
    { label: 'Trung tâm hỗ trợ', to: '/help' },
    { label: 'Hướng dẫn mua hàng', to: '/guide/buy' },
    { label: 'Hướng dẫn bán hàng', to: '/guide/sell' },
    { label: 'Chính sách đổi trả', to: '/returns' },
  ],
  'Chính sách': [
    { label: 'Điều khoản sử dụng', to: '/terms' },
    { label: 'Chính sách bảo mật', to: '/privacy' },
    { label: 'Chính sách vận chuyển', to: '/shipping' },
    { label: 'Giải quyết tranh chấp', to: '/dispute' },
  ],
};

function Footer() {
  return (
    <footer className="bg-black/40 border-t border-slate-800/50 mt-20">
      {/* Feature highlights */}
      <div className="border-b border-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-center gap-4 group">
                <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center flex-shrink-0 group-hover:bg-red-500/20 transition-all">
                  <Icon className="text-red-400 text-xl" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{title}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-800 rounded-xl flex items-center justify-center font-black text-lg">
                M
              </div>
              <span className="text-xl font-black gradient-text">MartHub</span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed mb-4">
              Nền tảng thương mại điện tử trung tâm — kết nối người mua và người bán trên toàn quốc.
            </p>
            <div className="flex gap-3">
              {[
                { icon: FaFacebook, href: '#', color: 'hover:text-blue-400' },
                { icon: FaInstagram, href: '#', color: 'hover:text-pink-400' },
                { icon: FaYoutube, href: '#', color: 'hover:text-red-400' },
                { icon: FaTwitter, href: '#', color: 'hover:text-sky-400' },
              ].map(({ icon: Icon, href, color }) => (
                <a
                  key={href + color}
                  href={href}
                  className={`w-9 h-9 rounded-lg bg-slate-800/60 border border-slate-700/50 flex items-center justify-center text-slate-400 ${color} transition-all hover:scale-110`}
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">{category}</h3>
              <ul className="space-y-2.5">
                {links.map(({ label, to }) => (
                  <li key={label}>
                    <Link
                      to={to}
                      className="text-sm text-slate-400 hover:text-red-400 transition-colors"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col md:flex-row justify-between items-center gap-2">
          <p className="text-xs text-slate-500">
            © 2026 MartHub. Nền tảng thương mại điện tử trung tâm. All rights reserved.
          </p>
          <div className="flex gap-4">
            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/200px-Mastercard-logo.svg.png" alt="Mastercard" className="h-5 opacity-50 hover:opacity-80 transition" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/200px-Visa_Inc._logo.svg.png" alt="Visa" className="h-5 opacity-50 hover:opacity-80 transition" />
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
