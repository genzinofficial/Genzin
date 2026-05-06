import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Package, 
  Heart, 
  Settings, 
  LogOut, 
  ChevronRight, 
  Clock, 
  ShieldCheck,
  CreditCard,
  MapPin
} from 'lucide-react';
import { getOrders } from '../lib/dataService';
import { Order } from '../types';
import { useCurrency } from '../context/CurrencyContext';

const ProfilePage: React.FC = () => {
  const { user, logout, loading: authLoading } = useAuth();
  const { formatPrice } = useCurrency();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
      return;
    }

    const fetchOrders = async () => {
      if (user) {
        try {
          const userOrders = await getOrders(user.uid);
          setOrders(userOrders);
        } catch (error) {
          console.error("Error fetching user orders:", error);
        } finally {
          setLoadingOrders(false);
        }
      }
    };

    fetchOrders();
  }, [user, authLoading, navigate]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const formatDate = (date: any) => {
    if (!date) return 'N/A';
    if (date.toDate) return date.toDate().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
    return new Date(date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
  };

  if (authLoading || !user) {
    return (
      <div className="pt-48 pb-24 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gray-200 border-t-accent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-24 px-6 md:px-12 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* Sidebar */}
        <div className="lg:col-span-4 space-y-8">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-stone p-8 rounded-[40px] shadow-sm relative overflow-hidden"
          >
            <div className="relative z-10">
              <div className="flex items-center gap-6 mb-8">
                <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-white shadow-inner bg-accent/10">
                  <img 
                    src={user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`} 
                    alt={user.displayName || 'User'} 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div>
                  <h1 className="text-2xl font-display tracking-tight leading-tight mb-1 italic">
                    {user.displayName?.split(' ')[0]}<span className="text-accent">.</span>
                  </h1>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Member since {new Date().getFullYear()}</p>
                </div>
              </div>

              <div className="space-y-2">
                <button className="w-full flex items-center justify-between p-4 bg-white rounded-2xl group transition-all hover:shadow-md">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-stone rounded-lg group-hover:bg-accent/10 transition-colors">
                      <User size={16} className="text-gray-600 group-hover:text-accent" />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-widest">Personal Info</span>
                  </div>
                  <ChevronRight size={14} className="text-gray-300" />
                </button>

                <button 
                  onClick={() => navigate('/wishlist')}
                  className="w-full flex items-center justify-between p-4 bg-transparent rounded-2xl group transition-all hover:bg-white/50"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-stone rounded-lg group-hover:bg-accent/10 transition-colors">
                      <Heart size={16} className="text-gray-600 group-hover:text-accent" />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-widest">Wishlist</span>
                  </div>
                  <ChevronRight size={14} className="text-gray-300" />
                </button>

                <button className="w-full flex items-center justify-between p-4 bg-transparent rounded-2xl group transition-all hover:bg-white/50">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-stone rounded-lg group-hover:bg-accent/10 transition-colors">
                      <MapPin size={16} className="text-gray-600 group-hover:text-accent" />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-widest">Addresses</span>
                  </div>
                  <ChevronRight size={14} className="text-gray-300" />
                </button>

                <button className="w-full flex items-center justify-between p-4 bg-transparent rounded-2xl group transition-all hover:bg-white/50">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-stone rounded-lg group-hover:bg-accent/10 transition-colors">
                      <CreditCard size={16} className="text-gray-600 group-hover:text-accent" />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-widest">Payments</span>
                  </div>
                  <ChevronRight size={14} className="text-gray-300" />
                </button>

                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center justify-between p-4 bg-transparent rounded-2xl group transition-all hover:bg-red-50"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-stone rounded-lg group-hover:bg-red-100 transition-colors">
                      <LogOut size={16} className="text-gray-600 group-hover:text-red-500" />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-widest group-hover:text-red-500">Sign Out</span>
                  </div>
                </button>
              </div>
            </div>
            
            <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-accent/5 rounded-full blur-3xl pointer-events-none"></div>
          </motion.div>

          <div className="bg-ink text-white p-8 rounded-[40px] shadow-sm relative overflow-hidden group">
            <ShieldCheck className="absolute top-6 right-6 text-accent/20 w-12 h-12 italic" />
            <div className="relative z-10">
              <h3 className="text-lg font-display italic mb-4">Genzin Concierge<span className="text-accent">.</span></h3>
              <p className="text-gray-400 text-xs mb-6 leading-relaxed">
                As a valued member, you have access to prioritized support and exclusive early access to upcoming drops.
              </p>
              <button className="text-[10px] font-black uppercase tracking-[0.2em] border-b border-accent pb-1 hover:text-accent transition-colors">
                Contact Concierge
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center justify-between mb-12">
              <h2 className="text-4xl font-display tracking-tighter italic">Recent Orders<span className="text-accent">.</span></h2>
              <div className="flex items-center gap-2 text-gray-400">
                <Clock size={14} />
                <span className="text-[10px] font-bold uppercase tracking-widest">History</span>
              </div>
            </div>

            {loadingOrders ? (
              <div className="flex justify-center py-12">
                <div className="w-6 h-6 border-2 border-stone border-t-accent rounded-full animate-spin"></div>
              </div>
            ) : orders.length > 0 ? (
              <div className="space-y-6">
                {orders.map((order, index) => (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + index * 0.05 }}
                    className="p-8 bg-white border border-gray-100 rounded-[32px] hover:shadow-lg transition-all group"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 pb-8 border-b border-gray-50">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-[10px] font-black uppercase tracking-widest text-ink">
                            {order.id}
                          </span>
                          <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                            order.status === 'completed' ? 'bg-green-50 text-green-600' :
                            order.status === 'cancelled' ? 'bg-red-50 text-red-500' :
                            'bg-amber-50 text-amber-600'
                          }`}>
                            {order.status}
                          </span>
                        </div>
                        <p className="text-gray-400 text-xs">{formatDate(order.createdAt)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Total</p>
                        <p className="text-2xl font-display italic tracking-tight">{formatPrice(order.total)}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {order.items.slice(0, 4).map((item, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-stone rounded-xl overflow-hidden flex-shrink-0">
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-[9px] font-black uppercase tracking-widest truncate">{item.name}</p>
                            <p className="text-[9px] text-gray-400 uppercase tracking-widest">x{item.quantity}</p>
                          </div>
                        </div>
                      ))}
                      {order.items.length > 4 && (
                        <div className="flex items-center justify-center bg-stone rounded-xl">
                          <span className="text-[10px] font-black text-gray-400">+{order.items.length - 4} MORE</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-8 flex justify-end">
                      <button className="flex items-center gap-2 group/btn">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 group-hover/btn:text-accent transition-colors">Order Details</span>
                        <ArrowRight size={12} className="text-gray-300 group-hover/btn:text-accent transition-colors" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="bg-stone/50 border-2 border-dashed border-stone rounded-[40px] p-20 text-center">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                  <Package className="text-gray-300" size={24} />
                </div>
                <h3 className="text-xl font-display italic mb-2 text-ink">No orders yet<span className="text-accent">.</span></h3>
                <p className="text-gray-400 text-sm max-w-xs mx-auto mb-8">Your curated acquisitions will appear here once you make your first purchase.</p>
                <button 
                  onClick={() => navigate('/shop')}
                  className="bg-ink text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-accent transition-all"
                >
                  Explore Collections
                </button>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

const ArrowRight = ({ size, className }: { size: number, className: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M5 12h14" />
    <path d="m12 5 7 7-7 7" />
  </svg>
);

export default ProfilePage;
