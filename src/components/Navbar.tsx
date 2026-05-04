import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Search, Menu, X, Heart, User as UserIcon, LogOut, Settings, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { getProducts } from '../lib/dataService';
import { useState, useEffect, useRef } from 'react';
import { Product } from '../types';

import { useCurrency } from '../context/CurrencyContext';
import CurrencySwitcher from './CurrencySwitcher';

const Navbar: React.FC = () => {
  const { formatPrice } = useCurrency();
  const { totalItems } = useCart();
  const { wishlist } = useWishlist();
  const { user, isAdmin, logout, setIsLoginModalOpen } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchAllProducts = async () => {
      try {
        const products = await getProducts();
        setAllProducts(products);
      } catch (error) {
        console.error("Error fetching products for search:", error);
      }
    };
    fetchAllProducts();
  }, []);

  useEffect(() => {
    if (searchQuery.trim().length > 0) {
      const filtered = allProducts.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setSearchResults(filtered.slice(0, 5));
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, allProducts]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-white/95 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-screen-2xl mx-auto px-6">
        <div className="flex justify-between items-center h-16 sm:h-[100px]">
          <div className="flex items-center gap-4 sm:gap-8">
            <button 
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 hover:bg-stone transition-colors sm:hidden text-ink"
            >
              <Menu size={18} />
            </button>
            <Link to="/" className="text-2xl sm:text-4xl font-display tracking-tight text-ink lowercase first-letter:uppercase">
              Genzin
            </Link>
            
            <div className="hidden sm:flex items-center gap-10 ml-8 md:ml-16">
              <Link to="/shop" className="text-[12px] font-bold tracking-widest text-gray-500 hover:text-accent transition-all uppercase">
                Shop
              </Link>
              <Link to="/shop?category=ELECTRONICS" className="text-[12px] font-bold tracking-widest text-gray-500 hover:text-accent transition-all uppercase">
                Tech
              </Link>
              <Link to="/shop?category=FASHION" className="text-[12px] font-bold tracking-widest text-gray-500 hover:text-accent transition-all uppercase">
                Fashion
              </Link>
              <Link to="/shop?category=WATCHES" className="text-[12px] font-bold tracking-widest text-gray-500 hover:text-accent transition-all uppercase">
                Watches
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div 
              ref={searchRef}
              className="hidden lg:flex items-center relative group"
            >
              <div className={`flex items-center border rounded-full px-4 py-2 bg-stone transition-all ${isSearchFocused ? 'bg-white border-accent w-64 shadow-lg' : 'border-gray-100 border-transparent w-48'}`}>
                <Search size={14} className={isSearchFocused ? 'text-accent' : 'text-gray-400'} />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  placeholder="Search products..." 
                  className="bg-transparent border-none focus:ring-0 text-xs ml-2 w-full font-medium placeholder:text-gray-400"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')} 
                    className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X size={12} className="text-gray-400" />
                  </button>
                )}
              </div>

              {/* Search Results Dropdown */}
              <AnimatePresence>
                {isSearchFocused && searchQuery.trim().length > 0 && (
                  <motion.div 
                    initial={{ opacity: 0, y: 15, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.98 }}
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    className="absolute top-full left-0 right-[-100px] mt-4 bg-white rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-gray-100 overflow-hidden z-[60]"
                  >
                    {searchResults.length > 0 ? (
                      <div className="p-2">
                        <div className="px-6 py-4 flex items-center justify-between border-b border-gray-50 mb-2">
                          <span className="text-[9px] font-black text-gray-400 tracking-[0.3em] uppercase">Suggestions</span>
                          <span className="text-[9px] font-bold text-accent uppercase tracking-widest">{searchResults.length} Match{searchResults.length > 1 ? 'es' : ''}</span>
                        </div>
                        <div className="space-y-1">
                          {searchResults.map(product => (
                            <Link 
                              key={product.id}
                              to={`/product/${product.id}`}
                              onClick={() => {
                                setSearchQuery('');
                                setIsSearchFocused(false);
                              }}
                              className="flex items-center gap-4 px-4 py-3 hover:bg-stone rounded-2xl transition-all group"
                            >
                              <div className="w-14 h-14 bg-stone rounded-xl overflow-hidden border border-gray-100 shrink-0 relative">
                                <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                <div className="absolute inset-0 bg-ink/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="text-[11px] font-bold text-ink truncate group-hover:text-accent transition-colors mb-1 uppercase tracking-wider">{product.name}</div>
                                <div className="flex items-center gap-2">
                                  <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest bg-stone px-2 py-0.5 rounded-full">{product.category}</span>
                                  {product.isNew && <span className="text-[8px] font-black text-accent uppercase tracking-tighter">New Arrival</span>}
                                </div>
                              </div>
                              <div className="text-[11px] font-mono font-bold text-ink">{formatPrice(product.price)}</div>
                            </Link>
                          ))}
                        </div>
                        <Link 
                          to={`/shop?q=${searchQuery}`}
                          onClick={() => {
                            setSearchQuery('');
                            setIsSearchFocused(false);
                          }}
                          className="mt-2 flex items-center justify-center gap-2 w-full py-4 bg-ink text-white hover:bg-accent transition-all text-[9px] font-black tracking-[0.3em] uppercase rounded-2xl"
                        >
                          View All results <ExternalLink size={10} />
                        </Link>
                      </div>
                    ) : (
                      <div className="p-10 text-center">
                        <div className="w-12 h-12 bg-stone flex items-center justify-center rounded-full mx-auto mb-4">
                          <Search size={16} className="text-gray-300" />
                        </div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">No matching artifacts found</p>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="hidden md:block mr-2 border-r border-gray-100 pr-4 h-5">
                <CurrencySwitcher />
              </div>
              
              <div className="relative">
                <button 
                  onClick={() => user ? setShowUserMenu(!showUserMenu) : navigate('/login')}
                  className="p-3 hover:bg-stone rounded-full transition-all group flex items-center gap-2"
                >
                  {user ? (
                    <img src={user.photoURL || ''} alt="avatar" className="w-5 h-5 rounded-full" />
                  ) : (
                    <UserIcon size={20} className="text-ink" />
                  )}
                  {user && <span className="hidden md:block text-[10px] font-bold tracking-widest uppercase">{user.displayName?.split(' ')[0]}</span>}
                </button>

                <AnimatePresence>
                  {showUserMenu && user && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-2 w-48 bg-white shadow-xl rounded-2xl border border-gray-100 py-2 z-50"
                    >
                      {isAdmin && (
                        <Link 
                          to="/admin" 
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center gap-3 px-6 py-3 text-xs font-bold hover:bg-stone transition-colors text-ink"
                        >
                          <Settings size={14} />
                          Admin Panel
                        </Link>
                      )}
                      <button 
                        onClick={() => {
                          logout();
                          setShowUserMenu(false);
                        }}
                        className="flex items-center gap-3 px-6 py-3 text-xs font-bold hover:bg-stone transition-colors text-red-500 w-full text-left"
                      >
                        <LogOut size={14} />
                        Logout
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <Link to="/wishlist" className="relative p-3 hover:bg-stone rounded-full transition-all group">
              <Heart size={20} className="text-ink" fill={wishlist.length > 0 ? "currentColor" : "none"} />
              {wishlist.length > 0 && (
                <span className="absolute top-1 right-1 bg-accent text-white text-[10px] font-bold h-5 w-5 rounded-full flex items-center justify-center border-2 border-white">
                  {wishlist.length}
                </span>
              )}
            </Link>

            <Link to="/cart" className="relative p-3 hover:bg-stone rounded-full transition-all group">
              <ShoppingBag size={20} className="text-ink" />
              {totalItems > 0 && (
                <span className="absolute top-1 right-1 bg-accent text-white text-[10px] font-bold h-5 w-5 rounded-full flex items-center justify-center border-2 border-white">
                  {totalItems}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>
    </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="sm:hidden absolute top-0 left-0 w-full bg-paper border-b border-ink"
          >
            <div className="p-4 flex justify-between items-center border-b border-ink/10">
              <span className="font-display text-xl">MENU</span>
              <button onClick={() => setIsOpen(false)}><X size={24} /></button>
            </div>
            <div className="flex flex-col p-6 space-y-6">
              {/* Mobile Search */}
              <div className="relative mb-4">
                <div className="flex items-center bg-stone rounded-2xl px-4 py-3 border border-gray-100">
                  <Search size={14} className="text-gray-400" />
                  <input 
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search products..." 
                    className="bg-transparent border-none focus:ring-0 text-xs ml-2 w-full font-bold uppercase tracking-wider placeholder:text-gray-400"
                  />
                </div>
                
                {searchQuery.trim().length > 0 && (
                  <div className="mt-4 space-y-2 max-h-[400px] overflow-y-auto pr-1">
                    <div className="flex justify-between items-center px-4 mb-2">
                      <span className="text-[8px] font-black text-gray-400 uppercase tracking-[0.2em]">Live Search</span>
                      <span className="text-[8px] font-bold text-accent uppercase tracking-widest">{searchResults.length} Results</span>
                    </div>
                    {searchResults.map(product => (
                      <Link 
                        key={product.id}
                        to={`/product/${product.id}`}
                        onClick={() => {
                          setSearchQuery('');
                          setIsOpen(false);
                        }}
                        className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm"
                      >
                        <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 border border-gray-50">
                          <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[10px] font-bold text-ink truncate uppercase tracking-wider">{product.name}</div>
                          <div className="text-[8px] text-gray-400 uppercase tracking-widest bg-stone inline-block px-2 py-0.5 rounded-full mt-1">{product.category}</div>
                        </div>
                        <div className="text-[10px] font-mono font-bold text-ink">{formatPrice(product.price)}</div>
                      </Link>
                    ))}
                    {searchResults.length > 0 && (
                      <Link 
                        to={`/shop?q=${searchQuery}`}
                        onClick={() => {
                          setSearchQuery('');
                          setIsOpen(false);
                        }}
                        className="flex items-center justify-center gap-2 w-full py-4 mt-2 bg-ink text-white rounded-2xl text-[9px] font-black tracking-[0.3em] uppercase"
                      >
                        Explore all results <ExternalLink size={10} />
                      </Link>
                    )}
                    {searchResults.length === 0 && (
                      <div className="py-12 text-center bg-stone rounded-2xl">
                         <Search size={20} className="text-gray-300 mx-auto mb-3" />
                         <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">No matching products</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-2">
                 <div className="flex items-center gap-3">
                   <div className="w-6 h-[1px] bg-accent"></div>
                   <span className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">Currency</span>
                 </div>
                 <CurrencySwitcher />
              </div>

              <div className="grid grid-cols-2 gap-4 border-b border-gray-100 pb-8">
                <Link to="/shop" onClick={() => setIsOpen(false)} className="bg-stone p-4 rounded-2xl flex flex-col items-center justify-center gap-2">
                  <ShoppingBag size={18} className="text-ink" />
                  <span className="text-[10px] font-bold tracking-widest uppercase">Shop</span>
                </Link>
                <Link to="/wishlist" onClick={() => setIsOpen(false)} className="bg-stone p-4 rounded-2xl flex flex-col items-center justify-center gap-2">
                  <Heart size={18} className="text-ink" />
                  <span className="text-[10px] font-bold tracking-widest uppercase">Wishlist</span>
                </Link>
              </div>

              <div className="flex flex-col space-y-4">
                <Link to="/shop" onClick={() => setIsOpen(false)} className="text-2xl font-display uppercase tracking-tight">SHOP ALL</Link>
                <Link to="/shop?category=ELECTRONICS" onClick={() => setIsOpen(false)} className="text-2xl font-display uppercase tracking-tight text-accent">TECH</Link>
                <Link to="/shop?category=FASHION" onClick={() => setIsOpen(false)} className="text-2xl font-display uppercase tracking-tight">FASHION</Link>
              </div>

              {/* User Section in Mobile Menu */}
              <div className="mt-8 pt-8 border-t border-gray-100">
                {user ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 p-4 bg-stone/50 rounded-2xl">
                      <img src={user.photoURL || ''} alt="avatar" className="w-10 h-10 rounded-full" />
                      <div>
                        <p className="text-xs font-bold text-ink">{user.displayName}</p>
                        <button onClick={() => { logout(); setIsOpen(false); }} className="text-[10px] font-bold text-red-500 uppercase tracking-widest mt-1">Logout</button>
                      </div>
                    </div>
                    {isAdmin && (
                      <Link 
                        to="/admin" 
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-3 p-4 bg-accent/5 text-accent rounded-2xl text-[10px] font-bold tracking-widest uppercase"
                      >
                        <Settings size={14} />
                        Admin Control Panel
                      </Link>
                    )}
                  </div>
                ) : (
                  <button 
                    onClick={() => { setIsLoginModalOpen(true); setIsOpen(false); }}
                    className="w-full bg-ink text-white py-4 rounded-2xl font-bold tracking-widest text-[10px] uppercase flex items-center justify-center gap-3"
                  >
                    <UserIcon size={14} />
                    Sign In to Genzin
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
