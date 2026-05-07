import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Product, Order } from '../types';
import { useCurrency } from '../context/CurrencyContext';
import { 
  getProducts, getOrders, addProduct, updateProduct, deleteProduct, updateOrderStatus,
  getAllUsers, setUserAccess
} from '../lib/dataService';
import { Plus, Trash2, Edit2, X, Check, Package, Image as ImageIcon, Layout, ShoppingBag, Mail, Calendar, CreditCard, ChevronDown, UserPlus, Shield, Info, Download, ClipboardList, UserMinus, UserCheck, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type AdminTab = 'products' | 'orders' | 'team' | 'users';

const formatDate = (date: any) => {
  if (!date) return 'N/A';
  if (date.toDate) return date.toDate().toLocaleDateString();
  return new Date(date).toLocaleDateString();
};

const AdminPage: React.FC = () => {
  const { isAdmin, isCreator, loading: authLoading } = useAuth();
  const { formatPrice } = useCurrency();
  const [activeTab, setActiveTab] = useState<AdminTab>('products');
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [admins, setAdmins] = useState<{ id: string; email: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [adminEmail, setAdminEmail] = useState('');
  const [grantLoading, setGrantLoading] = useState(false);
  const [revokeLoading, setRevokeLoading] = useState<string | null>(null);
  
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: 'FASHION',
    image: '',
    description: '',
    isNew: false
  });

  useEffect(() => {
    if (isAdmin) {
      if (activeTab === 'products') {
        fetchProducts();
      } else if (activeTab === 'orders') {
        fetchOrders();
      } else if (activeTab === 'team') {
        fetchAdmins();
      } else if (activeTab === 'users') {
        fetchUsers();
      }
    }
  }, [isAdmin, activeTab]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const fetchedUsers = await getAllUsers();
      setUsers(fetchedUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const fetchedProducts = await getProducts();
      setProducts(fetchedProducts);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const fetchedOrders = await getOrders();
      setOrders(fetchedOrders);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAdmins = async () => {
    setLoading(true);
    try {
      // Mock admin fetching from localStorage
      const saved = localStorage.getItem('genzin_admins');
      setAdmins(saved ? JSON.parse(saved) : []);
    } catch (error) {
      console.error("Error fetching admins:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleGrantAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminEmail.trim()) return;
    setGrantLoading(true);
    try {
      const newAdmins = [...admins, { id: adminEmail.toLowerCase(), email: adminEmail.toLowerCase() }];
      setAdmins(newAdmins);
      localStorage.setItem('genzin_admins', JSON.stringify(newAdmins));
      setAdminEmail('');
      alert(`Admin access granted to ${adminEmail}`);
    } catch (error) {
      console.error("Error granting admin access:", error);
    } finally {
      setGrantLoading(false);
    }
  };

  const removeAdmin = async (email: string) => {
    if (email === 'genzin.official@gmail.com') {
      alert("System Creator access cannot be revoked.");
      return;
    }
    if (email === 'geesinjosephhh@gmail.com' && !isCreator) {
      alert("Only the System Creator can revoke Administrator access.");
      return;
    }
    if (!window.confirm(`Revoke admin access for ${email}?`)) return;
    const newAdmins = admins.filter(a => a.email !== email);
    setAdmins(newAdmins);
    localStorage.setItem('genzin_admins', JSON.stringify(newAdmins));
  };

  const handleRevokeAccess = async (userId: string, email: string, currentRevoked: boolean) => {
    if (email === 'genzin.official@gmail.com') {
      alert("System Creator access cannot be revoked.");
      return;
    }
    
    if (email === 'geesinjosephhh@gmail.com' && !isCreator) {
      alert("Only the System Creator can modify Administrator status.");
      return;
    }
    
    const action = currentRevoked ? 'Restore' : 'Revoke';
    if (!window.confirm(`${action} access for ${email}?`)) return;
    
    setRevokeLoading(userId);
    try {
      await setUserAccess(userId, !currentRevoked);
      fetchUsers();
    } catch (error) {
      console.error(`Error ${action.toLowerCase()}ing access:`, error);
    } finally {
      setRevokeLoading(null);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: Order['status']) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      fetchOrders();
    } catch (error) {
      console.error("Error updating order status:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const productData = {
        name: formData.name,
        price: parseFloat(formData.price),
        category: formData.category as any,
        image: formData.image,
        description: formData.description,
        isNew: formData.isNew,
        sizes: ['S', 'M', 'L', 'XL'],
        colors: ['Black', 'White']
      };

      if (editingProduct) {
        await updateProduct(editingProduct.id, productData);
      } else {
        await addProduct(productData);
      }
      
      setIsModalOpen(false);
      setEditingProduct(null);
      setFormData({ name: '', price: '', category: 'FASHION', image: '', description: '', isNew: false });
      fetchProducts();
    } catch (error) {
      console.error("Error saving product:", error);
    }
  };

  const confirmDelete = async () => {
    if (!productToDelete || deleteConfirmationText !== 'REMOVE PRODUCT') return;
    try {
      await deleteProduct(productToDelete.id);
      setIsDeleteModalOpen(false);
      setProductToDelete(null);
      fetchProducts();
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  const exportOrdersToCSV = () => {
    const headers = ['Order ID', 'Email', 'Items', 'Total', 'Status', 'Date'];
    const rows = orders.map(order => [
      order.id,
      order.userEmail,
      order.items.map(item => `${item.name} (x${item.quantity})`).join('; '),
      formatPrice(order.total),
      order.status,
      formatDate(order.createdAt)
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n" 
      + rows.map(e => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `orders_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDeleteClick = (product: Product) => {
    setProductToDelete(product);
    setDeleteConfirmationText('');
    setIsDeleteModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      price: product.price.toString(),
      category: product.category,
      image: product.image,
      description: product.description,
      isNew: product.isNew || false
    });
    setIsModalOpen(true);
  };

  if (authLoading || loading) return (
    <div className="pt-40 flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-accent"></div>
    </div>
  );

  if (!isAdmin) return (
    <div className="pt-40 text-center min-h-screen">
      <h1 className="text-4xl font-display italic text-red-500">Access Denied</h1>
      <p className="mt-4 text-gray-500 font-bold uppercase tracking-widest text-xs">You do not have administrative privileges.</p>
    </div>
  );

  return (
    <div className="pt-32 sm:pt-48 px-6 max-w-screen-2xl mx-auto pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-8 pb-8 border-b border-gray-100">
        <div>
          <div className="flex items-center gap-2 mb-4">
             <span className="w-8 h-[1px] bg-accent"></span>
             <span className="text-[10px] font-bold tracking-[0.2em] text-gray-400 uppercase">Control Center</span>
          </div>
          <h1 className="text-6xl sm:text-7xl font-display tracking-tight text-ink italic leading-tight">Admin<span className="text-accent">.</span></h1>
          
          <div className="flex gap-8 mt-12">
            <button 
              onClick={() => setActiveTab('products')}
              className={`text-[10px] font-bold tracking-[0.3em] uppercase pb-2 transition-all ${activeTab === 'products' ? 'text-accent border-b border-accent' : 'text-gray-400 hover:text-ink'}`}
            >
              Inventory
            </button>
            <button 
              onClick={() => setActiveTab('orders')}
              className={`text-[10px] font-bold tracking-[0.3em] uppercase pb-2 transition-all ${activeTab === 'orders' ? 'text-accent border-b border-accent' : 'text-gray-400 hover:text-ink'}`}
            >
              Orders Tracking
            </button>
            <button 
              onClick={() => setActiveTab('team')}
              className={`text-[10px] font-bold tracking-[0.3em] uppercase pb-2 transition-all ${activeTab === 'team' ? 'text-accent border-b border-accent' : 'text-gray-400 hover:text-ink'}`}
            >
              Team Access
            </button>
            <button 
              onClick={() => setActiveTab('users')}
              className={`text-[10px] font-bold tracking-[0.3em] uppercase pb-2 transition-all ${activeTab === 'users' ? 'text-accent border-b border-accent' : 'text-gray-400 hover:text-ink'}`}
            >
              User Base
            </button>
          </div>
        </div>
        
        {activeTab === 'products' ? (
          <button 
            onClick={() => {
              setEditingProduct(null);
              setFormData({ name: '', price: '', category: 'FASHION', image: '', description: '', isNew: false });
              setIsModalOpen(true);
            }}
            className="flex items-center gap-3 bg-ink text-white px-8 py-4 rounded-full font-bold text-xs tracking-widest hover:shadow-xl transition-all"
          >
            <Plus size={16} />
            ADD PRODUCT
          </button>
        ) : activeTab === 'orders' ? (
          <button 
            onClick={exportOrdersToCSV}
            className="flex items-center gap-3 bg-stone text-ink border border-gray-100 px-8 py-4 rounded-full font-bold text-xs tracking-widest hover:shadow-xl transition-all"
          >
            <Download size={16} />
            EXPORT TO CSV
          </button>
        ) : null}
      </div>

      {activeTab === 'products' ? (
        <div className="grid grid-cols-1 gap-4">
          {products.map(product => (
            <div key={product.id} className="bg-white p-6 rounded-3xl border border-gray-100 flex items-center gap-6 hover:shadow-md transition-all group">
              <div className="w-20 h-24 bg-stone rounded-xl overflow-hidden flex-shrink-0">
                <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex-grow">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[9px] font-bold tracking-widest text-accent uppercase">{product.category}</span>
                  {product.isNew && <span className="text-[9px] font-bold bg-accent/10 text-accent px-2 py-0.5 rounded-full">NEW</span>}
                </div>
                <h3 className="font-bold text-ink uppercase text-sm mb-1">{product.name}</h3>
                <p className="text-xs font-bold text-gray-400">{formatPrice(product.price)}</p>
              </div>
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => openEditModal(product)}
                  className="p-3 hover:bg-stone rounded-full text-gray-500 hover:text-ink transition-colors"
                >
                  <Edit2 size={18} />
                </button>
                <button 
                  onClick={() => handleDeleteClick(product)}
                  className="p-3 hover:bg-stone rounded-full text-gray-500 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : activeTab === 'orders' ? (
        <div className="bg-white rounded-[40px] border border-gray-100 overflow-hidden overflow-x-auto premium-shadow">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-stone/50 border-b border-gray-100">
                <th className="px-8 py-6 text-[10px] font-bold tracking-widest text-gray-400 uppercase">Order Details</th>
                <th className="px-8 py-6 text-[10px] font-bold tracking-widest text-gray-400 uppercase">Customer</th>
                <th className="px-8 py-6 text-[10px] font-bold tracking-widest text-gray-400 uppercase">Items</th>
                <th className="px-8 py-6 text-[10px] font-bold tracking-widest text-gray-400 uppercase">Total Amount</th>
                <th className="px-8 py-6 text-[10px] font-bold tracking-widest text-gray-400 uppercase">Status</th>
                <th className="px-8 py-6 text-[10px] font-bold tracking-widest text-gray-400 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-b border-gray-50 hover:bg-stone/30 transition-colors">
                  <td className="px-8 py-8">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-mono font-bold text-ink">#{order.id.slice(-8).toUpperCase()}</span>
                      <div className="flex items-center gap-2 text-gray-400">
                        <Calendar size={10} />
                        <span className="text-[10px] font-bold">
                          {formatDate(order.createdAt)}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-8">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 text-ink uppercase text-[11px] font-bold">
                        <Mail size={12} className="text-gray-400" />
                        {order.userEmail}
                      </div>
                      <span className="text-[10px] text-gray-400 font-mono">ID: {order.userId.slice(0, 12)}...</span>
                    </div>
                  </td>
                  <td className="px-8 py-8">
                    <div className="flex flex-col gap-2">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded bg-stone overflow-hidden">
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                          </div>
                          <span className="text-[10px] font-bold text-ink uppercase truncate max-w-[120px]">{item.name}</span>
                          <span className="text-[9px] font-mono text-gray-400">x{item.quantity}</span>
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="px-8 py-8">
                    <div className="flex items-center gap-2 text-xs font-bold text-ink">
                      <CreditCard size={14} className="text-gray-400" />
                      {formatPrice(order.total)}
                    </div>
                  </td>
                  <td className="px-8 py-8">
                    <div className="relative group/status">
                      <span className={`
                        px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-tighter inline-flex items-center gap-2 cursor-pointer
                        ${order.status === 'delivered' ? 'bg-green-100 text-green-600' : 
                          order.status === 'cancelled' ? 'bg-red-100 text-red-600' : 
                          order.status === 'shipped' ? 'bg-blue-100 text-blue-600' : 'bg-orange-100 text-orange-600'}
                      `}>
                        <span className={`w-1 h-1 rounded-full ${
                          order.status === 'delivered' ? 'bg-green-600' : 
                          order.status === 'cancelled' ? 'bg-red-600' : 
                          order.status === 'shipped' ? 'bg-blue-600' : 'bg-orange-600'
                        }`}></span>
                        {order.status}
                        <ChevronDown size={10} />
                      </span>
                      
                      <div className="absolute top-full left-0 mt-2 w-32 bg-white rounded-xl shadow-xl border border-gray-100 hidden group-hover/status:block z-20 py-2">
                        {['pending', 'processing', 'shipped', 'delivered', 'cancelled'].map((status) => (
                          <button
                            key={status}
                            onClick={() => handleUpdateOrderStatus(order.id, status as any)}
                            className="w-full text-left px-4 py-2 text-[9px] font-bold uppercase tracking-widest hover:bg-stone transition-colors"
                          >
                            {status}
                          </button>
                        ))}
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-8">
                    <button 
                      onClick={() => {
                        if (window.confirm('Archive this order?')) {
                          console.log('Archiving order:', order.id);
                        }
                      }}
                      className="p-3 hover:bg-stone rounded-full text-gray-400 hover:text-ink transition-colors"
                    >
                      <ClipboardList size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-8 py-32 text-center">
                    <ShoppingBag size={48} className="mx-auto text-gray-100 mb-6" />
                    <p className="text-[10px] font-bold tracking-[0.3em] text-gray-300 uppercase">No orders found in the system</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : activeTab === 'users' ? (
        <div className="bg-white rounded-[40px] border border-gray-100 overflow-hidden overflow-x-auto premium-shadow">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-stone/50 border-b border-gray-100">
                <th className="px-8 py-6 text-[10px] font-bold tracking-widest text-gray-400 uppercase">User Profile</th>
                <th className="px-8 py-6 text-[10px] font-bold tracking-widest text-gray-400 uppercase">Email</th>
                <th className="px-8 py-6 text-[10px] font-bold tracking-widest text-gray-400 uppercase">Joined On</th>
                <th className="px-8 py-6 text-[10px] font-bold tracking-widest text-gray-400 uppercase">Access Status</th>
                <th className="px-8 py-6 text-[10px] font-bold tracking-widest text-gray-400 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.userId} className="border-b border-gray-50 hover:bg-stone/30 transition-colors">
                  <td className="px-8 py-8">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-stone">
                        <img src={user.photoURL} alt={user.displayName} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[11px] font-bold text-ink uppercase tracking-tight">{user.displayName}</span>
                        <span className="text-[9px] font-mono text-gray-400">ID: {user.userId.slice(0, 8)}...</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-8">
                    <span className="text-[10px] font-bold text-ink uppercase">{user.email}</span>
                  </td>
                  <td className="px-8 py-8">
                    <span className="text-[10px] font-bold text-gray-400">{formatDate(user.createdAt)}</span>
                  </td>
                  <td className="px-8 py-8">
                    <span className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase ${user.accessRevoked ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                      {user.accessRevoked ? 'REVOKED' : 'ACTIVE'}
                    </span>
                  </td>
                  <td className="px-8 py-8">
                    {user.email === 'genzin.official@gmail.com' ? (
                      <span className="text-[10px] font-bold text-gray-300 italic uppercase">System Creator</span>
                    ) : (user.email === 'geesinjosephhh@gmail.com' && !isCreator) ? (
                      <span className="text-[10px] font-bold text-gray-300 italic uppercase">Protected Admin</span>
                    ) : (
                      <button 
                        onClick={() => handleRevokeAccess(user.userId, user.email, !!user.accessRevoked)}
                        disabled={revokeLoading === user.userId}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${
                          user.accessRevoked 
                            ? 'bg-ink text-white hover:bg-accent' 
                            : 'bg-stone text-red-500 border border-red-50 hover:bg-red-500 hover:text-white'
                        }`}
                      >
                        {user.accessRevoked ? <UserCheck size={14} /> : <UserMinus size={14} />}
                        {revokeLoading === user.userId ? 'PROCESSING...' : user.accessRevoked ? 'RESTORE ACCESS' : 'REVOKE ACCESS'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-8 py-32 text-center">
                    <Users size={48} className="mx-auto text-gray-100 mb-6" />
                    <p className="text-[10px] font-bold tracking-[0.3em] text-gray-300 uppercase">No users found in the directory</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="max-w-4xl">
          <section className="bg-white rounded-[40px] p-8 sm:p-12 border border-blue-50 premium-shadow mb-12">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center">
                <UserPlus size={24} className="text-blue-500" />
              </div>
              <div>
                <h2 className="text-2xl font-display italic">Grant Admin Access</h2>
                <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">Authorize new administrative members</p>
              </div>
            </div>

            <form onSubmit={handleGrantAdmin} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">User Email Address</label>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-grow">
                    <Mail size={16} className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input 
                      required
                      type="email" 
                      value={adminEmail}
                      onChange={e => setAdminEmail(e.target.value)}
                      placeholder="colleague@example.com"
                      className="w-full bg-stone border-none rounded-2xl pl-14 pr-6 py-5 text-sm font-bold focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                  <button 
                    type="submit"
                    disabled={grantLoading}
                    className="bg-ink text-white px-10 py-5 rounded-2xl font-bold tracking-widest text-xs hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-3 whitespace-nowrap"
                  >
                    {grantLoading ? 'AUTHORIZING...' : (
                      <>
                        <Shield size={16} />
                        GRANT ACCESS
                      </>
                    )}
                  </button>
                </div>
              </div>
              
              <div className="flex items-start gap-3 bg-blue-50/50 p-6 rounded-2xl border border-blue-100">
                <Info size={16} className="text-blue-500 shrink-0 mt-0.5" />
                <p className="text-[10px] font-bold text-blue-600/70 leading-relaxed uppercase tracking-widest">
                  Granting access allows this user to manage products, track orders, and authorize other administrators. Please verify the email address before proceeding.
                </p>
              </div>
            </form>
          </section>

          <div className="space-y-4">
            <h3 className="text-xs font-bold tracking-[0.2em] text-gray-400 uppercase ml-4">Authorized Administrative Team</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Hardcoded Bootstrap Admins */}
              <div className="bg-stone p-6 rounded-3xl border border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                    <Shield size={20} className="text-accent" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-ink">genzin.official@gmail.com</p>
                    <p className="text-[9px] font-bold text-accent uppercase tracking-widest">System Creator</p>
                  </div>
                </div>
                <div className="px-3 py-1 bg-white rounded-full text-[9px] font-bold text-gray-400 uppercase tracking-tighter">Root</div>
              </div>
              
              <div className="bg-stone p-6 rounded-3xl border border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                    <Shield size={20} className="text-accent" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-ink">geesinjosephhh@gmail.com</p>
                    <p className="text-[9px] font-bold text-accent uppercase tracking-widest">Administrator</p>
                  </div>
                </div>
                <div className="px-3 py-1 bg-white rounded-full text-[9px] font-bold text-gray-400 uppercase tracking-tighter">Immutable</div>
              </div>

              {/* Dynamic Admins from Firestore */}
              {admins.filter(a => a.email !== 'geesinjosephhh@gmail.com' && a.email !== 'genzin.official@gmail.com').map(admin => (
                <div key={admin.id} className="bg-white p-6 rounded-3xl border border-gray-100 flex items-center justify-between hover:shadow-md transition-all group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-stone rounded-full flex items-center justify-center">
                      <Shield size={20} className="text-gray-400 group-hover:text-accent transition-colors" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-ink">{admin.email}</p>
                      <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Authorized Access</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => removeAdmin(admin.id)}
                    className="p-2 hover:bg-red-50 rounded-full text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Edit/Add Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white w-full max-w-2xl rounded-[40px] shadow-2xl relative z-10 overflow-hidden"
            >
              <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-stone/30">
                <h2 className="text-2xl font-display italic">{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-stone rounded-full transition-colors">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold tracking-widest text-gray-400 uppercase flex items-center gap-2">
                      <Layout size={10} /> Product Name
                    </label>
                    <input 
                      required
                      type="text" 
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-stone border-none rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-accent/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold tracking-widest text-gray-400 uppercase flex items-center gap-2">
                      Price (USD - Base)
                    </label>
                    <input 
                      required
                      type="number" 
                      value={formData.price}
                      onChange={e => setFormData({ ...formData, price: e.target.value })}
                      className="w-full bg-stone border-none rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-accent/20"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold tracking-widest text-gray-400 uppercase flex items-center gap-2">
                    <Package size={10} /> Category
                  </label>
                  <select 
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-stone border-none rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-accent/20"
                  >
                    <option value="FASHION">FASHION</option>
                    <option value="ELECTRONICS">ELECTRONICS</option>
                    <option value="WATCHES">WATCHES</option>
                    <option value="JEWELRY">JEWELRY</option>
                    <option value="ACCESSORIES">ACCESSORIES</option>
                    <option value="HOME">HOME</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold tracking-widest text-gray-400 uppercase flex items-center gap-2">
                    <ImageIcon size={10} /> Image URL
                  </label>
                  <input 
                    required
                    type="url" 
                    value={formData.image}
                    onChange={e => setFormData({ ...formData, image: e.target.value })}
                    className="w-full bg-stone border-none rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-accent/20"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold tracking-widest text-gray-400 uppercase flex items-center gap-2">
                    Description
                  </label>
                  <textarea 
                    required
                    rows={4}
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    className="w-full bg-stone border-none rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-accent/20"
                  ></textarea>
                </div>

                <div className="flex items-center gap-3">
                  <input 
                    type="checkbox" 
                    id="isNew"
                    checked={formData.isNew}
                    onChange={e => setFormData({ ...formData, isNew: e.target.checked })}
                    className="w-4 h-4 rounded border-gray-300 text-accent focus:ring-accent"
                  />
                  <label htmlFor="isNew" className="text-xs font-bold text-gray-600 uppercase tracking-widest">Mark as New Arrival</label>
                </div>

                <button 
                  type="submit"
                  className="w-full bg-accent text-white py-4 rounded-xl font-bold tracking-widest text-xs hover:shadow-xl transition-all shadow-lg flex items-center justify-center gap-3"
                >
                  <Check size={16} />
                  {editingProduct ? 'UPDATE PRODUCT' : 'CREATE PRODUCT'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {isDeleteModalOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDeleteModalOpen(false)}
              className="absolute inset-0 bg-ink/60 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white w-full max-w-md rounded-[40px] shadow-2xl relative z-10 overflow-hidden"
            >
              <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-red-50/30">
                <h2 className="text-2xl font-display italic text-red-600">Delete Product?</h2>
                <button onClick={() => setIsDeleteModalOpen(false)} className="p-2 hover:bg-stone rounded-full transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="p-8 space-y-6">
                <p className="text-xs font-bold text-gray-500 leading-relaxed uppercase tracking-widest">
                  This action is irreversible. To confirm deletion of <span className="text-ink">"{productToDelete?.name}"</span>, please type <span className="text-red-500 italic">REMOVE PRODUCT</span> below.
                </p>

                <input 
                  type="text" 
                  value={deleteConfirmationText}
                  onChange={e => setDeleteConfirmationText(e.target.value)}
                  placeholder="Type here..."
                  className="w-full bg-stone border-none rounded-xl px-4 py-4 text-xs font-bold tracking-widest focus:ring-2 focus:ring-red-500/20 text-center uppercase"
                />

                <div className="flex flex-col gap-3">
                  <button 
                    onClick={confirmDelete}
                    disabled={deleteConfirmationText !== 'REMOVE PRODUCT'}
                    className="w-full bg-red-500 text-white py-4 rounded-xl font-bold tracking-widest text-xs hover:shadow-xl transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    PERMANENTLY DELETE
                  </button>
                  <button 
                    onClick={() => setIsDeleteModalOpen(false)}
                    className="w-full py-4 rounded-xl font-bold tracking-widest text-xs text-gray-400 hover:text-ink transition-colors"
                  >
                    CANCEL
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminPage;
