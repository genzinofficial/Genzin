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
  MapPin,
  Plus,
  X,
  Edit2,
  Trash2
} from 'lucide-react';
import { getOrders, getUserAddresses, saveUserAddress, deleteUserAddress } from '../lib/dataService';
import { Order, UserAddress } from '../types';
import { useCurrency } from '../context/CurrencyContext';

const ProfilePage: React.FC = () => {
  const { user, logout, loading: authLoading } = useAuth();
  const { formatPrice } = useCurrency();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [activeTab, setActiveTab] = useState<'orders' | 'personal' | 'addresses'>('orders');
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<UserAddress | null>(null);
  const [addressForm, setAddressForm] = useState<Omit<UserAddress, 'id' | 'userId'>>({
    fullName: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    phone: '',
    isDefault: false
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      if (user) {
        try {
          const [userOrders, userAddresses] = await Promise.all([
            getOrders(user.uid),
            getUserAddresses(user.uid)
          ]);
          setOrders(userOrders);
          setAddresses(userAddresses);
        } catch (error) {
          console.error("Error fetching user data:", error);
        } finally {
          setLoadingOrders(false);
          setLoadingAddresses(false);
        }
      }
    };

    fetchData();
  }, [user, authLoading, navigate]);

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setLoadingAddresses(true);
      const saved = await saveUserAddress(user.uid, { ...addressForm, userId: user.uid }, editingAddress?.id);
      
      if (editingAddress) {
        setAddresses(addresses.map(a => a.id === saved.id ? saved : a));
      } else {
        setAddresses([saved, ...addresses]);
      }
      
      setShowAddressForm(false);
      setEditingAddress(null);
      setAddressForm({
        fullName: '',
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: '',
        phone: '',
        isDefault: false
      });
    } catch (error) {
      console.error("Error saving address:", error);
    } finally {
      setLoadingAddresses(false);
    }
  };

  const handleDeleteAddress = async (id: string) => {
    if (!user || !window.confirm('Are you sure you want to delete this address?')) return;

    try {
      setLoadingAddresses(true);
      await deleteUserAddress(user.uid, id);
      setAddresses(addresses.filter(a => a.id !== id));
    } catch (error) {
      console.error("Error deleting address:", error);
    } finally {
      setLoadingAddresses(false);
    }
  };

  const handleEditAddress = (address: UserAddress) => {
    setEditingAddress(address);
    setAddressForm({
      fullName: address.fullName,
      street: address.street,
      city: address.city,
      state: address.state,
      zipCode: address.zipCode,
      country: address.country,
      phone: address.phone,
      isDefault: address.isDefault
    });
    setShowAddressForm(true);
  };

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
                <button 
                  onClick={() => setActiveTab('personal')}
                  className={`w-full flex items-center justify-between p-4 rounded-2xl group transition-all ${activeTab === 'personal' ? 'bg-white shadow-md' : 'bg-transparent hover:bg-white/50'}`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-lg transition-colors ${activeTab === 'personal' ? 'bg-accent/10' : 'bg-stone group-hover:bg-accent/10'}`}>
                      <User size={16} className={`${activeTab === 'personal' ? 'text-accent' : 'text-gray-600 group-hover:text-accent'}`} />
                    </div>
                    <span className={`text-xs font-bold uppercase tracking-widest ${activeTab === 'personal' ? 'text-ink' : ''}`}>Personal Info</span>
                  </div>
                  <ChevronRight size={14} className={activeTab === 'personal' ? 'text-accent' : 'text-gray-300'} />
                </button>

                <button 
                  onClick={() => setActiveTab('orders')}
                  className={`w-full flex items-center justify-between p-4 rounded-2xl group transition-all ${activeTab === 'orders' ? 'bg-white shadow-md' : 'bg-transparent hover:bg-white/50'}`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-lg transition-colors ${activeTab === 'orders' ? 'bg-accent/10' : 'bg-stone group-hover:bg-accent/10'}`}>
                      <Package size={16} className={`${activeTab === 'orders' ? 'text-accent' : 'text-gray-600 group-hover:text-accent'}`} />
                    </div>
                    <span className={`text-xs font-bold uppercase tracking-widest ${activeTab === 'orders' ? 'text-ink' : ''}`}>Order History</span>
                  </div>
                  <ChevronRight size={14} className={activeTab === 'orders' ? 'text-accent' : 'text-gray-300'} />
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

                <button 
                  onClick={() => setActiveTab('addresses')}
                  className={`w-full flex items-center justify-between p-4 rounded-2xl group transition-all ${activeTab === 'addresses' ? 'bg-white shadow-md' : 'bg-transparent hover:bg-white/50'}`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-lg transition-colors ${activeTab === 'addresses' ? 'bg-accent/10' : 'bg-stone group-hover:bg-accent/10'}`}>
                      <MapPin size={16} className={`${activeTab === 'addresses' ? 'text-accent' : 'text-gray-600 group-hover:text-accent'}`} />
                    </div>
                    <span className={`text-xs font-bold uppercase tracking-widest ${activeTab === 'addresses' ? 'text-ink' : ''}`}>Addresses</span>
                  </div>
                  <ChevronRight size={14} className={activeTab === 'addresses' ? 'text-accent' : 'text-gray-300'} />
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
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {activeTab === 'orders' ? (
              <>
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
                        transition={{ delay: index * 0.05 }}
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
                                <img src={item.images?.[0]} alt={item.name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
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
              </>
            ) : activeTab === 'addresses' ? (
              <>
                <div className="flex items-center justify-between mb-12">
                  <h2 className="text-4xl font-display tracking-tighter italic">Saved Addresses<span className="text-accent">.</span></h2>
                  <button 
                    onClick={() => {
                      setEditingAddress(null);
                      setAddressForm({
                        fullName: '',
                        street: '',
                        city: '',
                        state: '',
                        zipCode: '',
                        country: '',
                        phone: '',
                        isDefault: addresses.length === 0
                      });
                      setShowAddressForm(true);
                    }}
                    className="flex items-center gap-2 group/btn"
                  >
                    <div className="w-8 h-8 rounded-full bg-ink text-white flex items-center justify-center group-hover/btn:bg-accent transition-colors">
                      <Plus size={14} />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-ink">Add New</span>
                  </button>
                </div>

                {showAddressForm ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white p-10 rounded-[40px] border border-gray-100 shadow-xl mb-12"
                  >
                    <div className="flex justify-between items-center mb-10">
                      <h3 className="text-xl font-display italic">{editingAddress ? 'Edit Address' : 'New Address'}</h3>
                      <button onClick={() => setShowAddressForm(false)} className="text-gray-400 hover:text-ink transition-colors">
                        <X size={20} />
                      </button>
                    </div>

                    <form onSubmit={handleSaveAddress} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="md:col-span-2">
                        <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Full Name</label>
                        <input 
                          type="text" 
                          required
                          value={addressForm.fullName}
                          onChange={(e) => setAddressForm({ ...addressForm, fullName: e.target.value })}
                          className="w-full bg-stone border-none rounded-2xl p-4 text-xs font-bold focus:ring-2 focus:ring-accent outline-none"
                          placeholder="John Doe"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Street Address</label>
                        <input 
                          type="text" 
                          required
                          value={addressForm.street}
                          onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })}
                          className="w-full bg-stone border-none rounded-2xl p-4 text-xs font-bold focus:ring-2 focus:ring-accent outline-none"
                          placeholder="123 Luxury Lane"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">City</label>
                        <input 
                          type="text" 
                          required
                          value={addressForm.city}
                          onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                          className="w-full bg-stone border-none rounded-2xl p-4 text-xs font-bold focus:ring-2 focus:ring-accent outline-none"
                          placeholder="New York"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">State / Province</label>
                        <input 
                          type="text" 
                          value={addressForm.state}
                          onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                          className="w-full bg-stone border-none rounded-2xl p-4 text-xs font-bold focus:ring-2 focus:ring-accent outline-none"
                          placeholder="NY"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">ZIP / Postal Code</label>
                        <input 
                          type="text" 
                          value={addressForm.zipCode}
                          onChange={(e) => setAddressForm({ ...addressForm, zipCode: e.target.value })}
                          className="w-full bg-stone border-none rounded-2xl p-4 text-xs font-bold focus:ring-2 focus:ring-accent outline-none"
                          placeholder="10001"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Country</label>
                        <input 
                          type="text" 
                          required
                          value={addressForm.country}
                          onChange={(e) => setAddressForm({ ...addressForm, country: e.target.value })}
                          className="w-full bg-stone border-none rounded-2xl p-4 text-xs font-bold focus:ring-2 focus:ring-accent outline-none"
                          placeholder="United States"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Phone Number</label>
                        <input 
                          type="tel" 
                          value={addressForm.phone}
                          onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                          className="w-full bg-stone border-none rounded-2xl p-4 text-xs font-bold focus:ring-2 focus:ring-accent outline-none"
                          placeholder="+1 (555) 000-0000"
                        />
                      </div>
                      <div className="md:col-span-2 flex items-center gap-3">
                        <input 
                          type="checkbox" 
                          id="isDefault"
                          checked={addressForm.isDefault}
                          onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                          className="w-5 h-5 rounded-lg border-stone text-accent focus:ring-accent cursor-pointer"
                        />
                        <label htmlFor="isDefault" className="text-[10px] font-black uppercase tracking-widest text-ink cursor-pointer">Set as default shipping address</label>
                      </div>

                      <div className="md:col-span-2 flex gap-4 pt-6">
                        <button 
                          type="submit"
                          disabled={loadingAddresses}
                          className="flex-1 bg-ink text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-accent transition-all disabled:opacity-50"
                        >
                          {loadingAddresses ? 'Processing...' : (editingAddress ? 'Update saved address' : 'Save address')}
                        </button>
                        <button 
                          type="button"
                          onClick={() => setShowAddressForm(false)}
                          className="px-8 bg-stone py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-200 transition-all font-bold"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </motion.div>
                ) : null}

                {loadingAddresses && !showAddressForm ? (
                  <div className="flex justify-center py-12">
                    <div className="w-6 h-6 border-2 border-stone border-t-accent rounded-full animate-spin"></div>
                  </div>
                ) : addresses.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {addresses.map((address) => (
                      <motion.div
                        key={address.id}
                        layout
                        className={`p-8 rounded-[32px] border transition-all ${address.isDefault ? 'bg-white border-accent shadow-lg' : 'bg-white border-gray-100 hover:border-accent/30 hover:shadow-md'}`}
                      >
                        <div className="flex justify-between items-start mb-6">
                          <div>
                            {address.isDefault && (
                              <span className="inline-block px-2.5 py-1 bg-accent text-white text-[8px] font-black uppercase tracking-[0.2em] rounded-full mb-3">Primary</span>
                            )}
                            <h4 className="text-lg font-display italic">{address.fullName}</h4>
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => handleEditAddress(address)} className="p-2 hover:bg-stone rounded-lg text-gray-400 hover:text-ink transition-colors">
                              <Edit2 size={14} />
                            </button>
                            {!address.isDefault && (
                              <button onClick={() => handleDeleteAddress(address.id!)} className="p-2 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-500 transition-colors">
                                <Trash2 size={14} />
                              </button>
                            )}
                          </div>
                        </div>
                        <div className="space-y-1 text-xs text-gray-500 font-medium">
                          <p>{address.street}</p>
                          <p>{address.city}, {address.state} {address.zipCode}</p>
                          <p>{address.country}</p>
                          <p className="pt-2 text-ink font-bold">{address.phone}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : !showAddressForm ? (
                  <div className="bg-stone/50 border-2 border-dashed border-stone rounded-[40px] p-20 text-center">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                      <MapPin className="text-gray-300" size={24} />
                    </div>
                    <h3 className="text-xl font-display italic mb-2 text-ink">No addresses saved<span className="text-accent">.</span></h3>
                    <p className="text-gray-400 text-sm max-w-xs mx-auto mb-8">Save your shipping details for a faster checkout experience across Genzin.</p>
                    <button 
                      onClick={() => setShowAddressForm(true)}
                      className="bg-ink text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-accent transition-all"
                    >
                      Add Primary Address
                    </button>
                  </div>
                ) : null}
              </>
            ) : (
              <>
                <div className="flex items-center justify-between mb-12">
                  <h2 className="text-4xl font-display tracking-tighter italic">Personal Info<span className="text-accent">.</span></h2>
                  <div className="flex items-center gap-2 text-gray-400">
                    <ShieldCheck size={14} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Secure</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-white p-10 rounded-[40px] border border-gray-100 shadow-sm">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-8 italic">Identity Verification</p>
                    
                    <div className="space-y-8">
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Display Name</label>
                        <p className="text-lg font-display italic">{user.displayName || 'Anonymous Explorer'}</p>
                      </div>
                      
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Email Identity</label>
                        <p className="text-lg font-display italic break-all">{user.email}</p>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Global ID</label>
                        <p className="text-[10px] font-mono text-gray-400 select-all uppercase tracking-tighter">{user.uid}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-8">
                    <div className="bg-white p-10 rounded-[40px] border border-gray-100 shadow-sm">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-6 italic">Communication</p>
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Phone Number</label>
                        <div className="flex items-center justify-between">
                          <p className="text-lg font-display italic">{user.phoneNumber || 'Not Linked'}</p>
                          <button className="text-[9px] font-black uppercase tracking-widest text-accent border-b border-accent/20 pb-0.5">Link Phone</button>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white p-10 rounded-[40px] border border-gray-100 shadow-sm">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-6 italic">Curation Status</p>
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-accent/10 rounded-2xl flex items-center justify-center">
                          <ShieldCheck className="text-accent" size={20} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-ink">Elite Member</p>
                          <p className="text-[10px] text-gray-400 uppercase tracking-widest">Lifetime access verified</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-12 p-10 bg-stone rounded-[40px] relative overflow-hidden">
                  <div className="relative z-10">
                    <h3 className="text-xl font-display italic mb-2">Security Preferences<span className="text-accent">.</span></h3>
                    <p className="text-gray-400 text-xs mb-8 max-w-md">Manage how your account is accessed and secured. We recommend enabling two-factor authentication for higher tier curation.</p>
                    <button className="px-8 py-4 bg-white border border-gray-100 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:shadow-md transition-all">
                      Manage Security
                    </button>
                  </div>
                  <Settings className="absolute -bottom-4 -right-4 w-32 h-32 text-white/40 italic pointer-events-none" />
                </div>
              </>
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
