import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaFilter, FaSearch, FaSlidersH, FaTimes, FaChevronDown, FaStar, FaThLarge, FaList } from 'react-icons/fa';
import { useProductStore } from '../store/productStore';
import ProductCard from '../components/ProductCard';

const sortOptions = [
  { value: 'newest', label: 'Mới nhất' },
  { value: 'bestseller', label: 'Bán chạy nhất' },
  { value: 'price_asc', label: 'Giá thấp → cao' },
  { value: 'price_desc', label: 'Giá cao → thấp' },
  { value: 'rating', label: 'Đánh giá cao nhất' },
];

const categories = [
  { value: '', label: 'Tất cả' },
  { value: 'dien-tu', label: '📱 Điện tử' },
  { value: 'thoi-trang', label: '👗 Thời trang' },
  { value: 'gia-dung', label: '🏠 Gia dụng' },
  { value: 'sach', label: '📚 Sách' },
  { value: 'my-pham', label: '💄 Mỹ phẩm' },
  { value: 'gaming', label: '🎮 Gaming' },
  { value: 'thuc-pham', label: '🍔 Thực phẩm' },
  { value: 'the-thao', label: '🏋️ Thể thao' },
];

const priceRanges = [
  { label: 'Tất cả', min: 0, max: 0 },
  { label: 'Dưới 100K', min: 0, max: 100000 },
  { label: '100K - 500K', min: 100000, max: 500000 },
  { label: '500K - 1M', min: 500000, max: 1000000 },
  { label: '1M - 5M', min: 1000000, max: 5000000 },
  { label: 'Trên 5M', min: 5000000, max: 0 },
];

const mockProducts = Array.from({ length: 20 }, (_, i) => ({
  MaSanPham: i + 1,
  TenSanPham: ['Điện thoại Samsung Galaxy S24', 'Áo thun nam cổ tròn', 'Laptop ASUS VivoBook', 'Giày thể thao Nike', 'Tai nghe Sony WH-1000XM5', 'Đồng hồ Casio G-Shock', 'Máy ảnh Canon EOS R50', 'Balo du lịch Swissgear'][i % 8] + ` #${i + 1}`,
  GiaGoc: (i + 2) * 200000 + 50000,
  DanhGiaTrungBinh: 3.5 + (i % 3) * 0.5,
  TenCuaHang: ['Tech Store', 'Fashion Hub', 'Gaming Zone', 'Sport Center'][i % 4],
  isNew: i < 5, isHot: i >= 5 && i < 12,
  variants: [{ MaPhienBan: i + 1, GiaBan: (i + 2) * 175000 + 50000 }],
  images: [],
}));

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

  const { products, fetchProducts, loading } = useProductStore();
  const displayProducts = products.length > 0 ? products : mockProducts;

  useEffect(() => {
    fetchProducts({ search: currentSearch, shop: currentShop, category: currentCategory, sort: currentSort, limit: 20 });
  }, [currentSearch, currentShop, currentCategory, currentSort, fetchProducts]);


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
        <h3 className="text-sm font-bold text-white mb-3 uppercase tracking-wider">Danh mục</h3>
        <div className="space-y-1">
          {categories.map(cat => (
            <button key={cat.value}
              onClick={() => updateParam('category', cat.value)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${currentCategory === cat.value ? 'bg-red-600/20 text-red-400 border border-red-500/30' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}>
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h3 className="text-sm font-bold text-white mb-3 uppercase tracking-wider">Khoảng giá</h3>
        <div className="space-y-1">
          {priceRanges.map((range, i) => (
            <button key={range.label} onClick={() => setSelectedPriceRange(i)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${selectedPriceRange === i ? 'bg-red-600/20 text-red-400 border border-red-500/30' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}>
              {range.label}
            </button>
          ))}
        </div>
      </div>

      {/* Rating */}
      <div>
        <h3 className="text-sm font-bold text-white mb-3 uppercase tracking-wider">Đánh giá tối thiểu</h3>
        <div className="space-y-1">
          {[0, 3, 4, 4.5].map(r => (
            <button key={r} onClick={() => setMinRating(r)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-2 transition-all ${minRating === r ? 'bg-red-600/20 text-red-400 border border-red-500/30' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}>
              {r === 0 ? 'Tất cả' : (
                <><div className="flex">{[...Array(5)].map((_, i) => <FaStar key={i} size={11} className={i < r ? 'text-yellow-400' : 'text-slate-600'} />)}</div> trở lên</>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-1">
          {currentSearch ? `Kết quả tìm kiếm: "${currentSearch}"` : 'Tất cả sản phẩm'}
        </h1>
        <p className="text-slate-400 text-sm">{filtered.length} sản phẩm</p>
      </div>

      {/* Search bar */}
      <form onSubmit={handleSearch} className="mb-6 flex gap-3">
        <div className="relative flex-1">
          <input type="text" value={localSearch} onChange={e => setLocalSearch(e.target.value)}
            placeholder="Tìm kiếm sản phẩm..."
            className="input-field pr-10" />
          <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500">
            <FaSearch size={16} />
          </button>
        </div>
        <button type="button" onClick={() => setIsFilterOpen(!isFilterOpen)}
          className="flex items-center gap-2 px-4 py-3 bg-slate-800 border border-slate-700 hover:border-red-500/50 rounded-lg text-sm text-slate-300 hover:text-white transition-all md:hidden">
          <FaSlidersH size={14} /> Lọc
        </button>
      </form>

      {/* Sort + View controls */}
      <div className="flex items-center justify-between mb-6 gap-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {sortOptions.map(opt => (
            <button key={opt.value} onClick={() => updateParam('sort', opt.value)}
              className={`whitespace-nowrap px-4 py-2 rounded-lg text-sm font-medium transition-all ${currentSort === opt.value ? 'bg-red-600 text-white' : 'bg-slate-800/60 text-slate-400 hover:text-white border border-slate-700/50 hover:border-slate-600'}`}>
              {opt.label}
            </button>
          ))}
        </div>
        <div className="hidden md:flex gap-2">
          {[{ icon: FaThLarge, mode: 'grid' }, { icon: FaList, mode: 'list' }].map(({ icon: Icon, mode }) => (
            <button key={mode} onClick={() => setViewMode(mode)}
              className={`p-2.5 rounded-lg transition-all ${viewMode === mode ? 'bg-red-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}>
              <Icon size={14} />
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-6">
        {/* Desktop Filter Sidebar */}
        <aside className="hidden md:block w-56 flex-shrink-0">
          <div className="glass-card rounded-xl p-4 border border-slate-700/50 sticky top-20">
            <div className="flex items-center gap-2 mb-4">
              <FaFilter size={14} className="text-red-400" />
              <span className="font-bold text-white text-sm">Bộ lọc</span>
            </div>
            <FilterPanel />
          </div>
        </aside>

        {/* Mobile Filter Drawer */}
        <AnimatePresence>
          {isFilterOpen && (
            <motion.div initial={{ x: -300, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -300, opacity: 0 }}
              className="fixed inset-y-0 left-0 z-50 w-72 glass-card border-r border-slate-700/50 p-6 overflow-y-auto md:hidden">
              <div className="flex justify-between items-center mb-6">
                <span className="font-bold text-white">Bộ lọc</span>
                <button onClick={() => setIsFilterOpen(false)}><FaTimes /></button>
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
                <div key={i} className="bg-slate-800/60 rounded-xl h-72 shimmer" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-bold text-white mb-2">Không tìm thấy sản phẩm</h3>
              <p className="text-slate-400 mb-6">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
              <button onClick={() => { setSearchParams({}); setSelectedPriceRange(0); setMinRating(0); }}
                className="btn-primary">Xóa bộ lọc</button>
            </div>
          ) : (
            <div className={`grid gap-4 ${viewMode === 'grid' ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4' : 'grid-cols-1 sm:grid-cols-2'}`}>
              {filtered.map((p, i) => <ProductCard key={p.MaSanPham} product={p} index={i} />)}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
