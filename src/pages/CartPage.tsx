import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ArrowRight, ShoppingBag, CheckCircle2, MapPin } from 'lucide-react';
import { BillingInfo } from '../types';
import { useCurrency } from '../context/CurrencyContext';
import { createOrder, getUserAddresses, saveUserAddress } from '../lib/dataService';
import { motion, AnimatePresence } from 'motion/react';
import { UserAddress } from '../types';

const CartPage: React.FC = () => {
  const { cart, removeFromCart, updateQuantity, totalPrice, totalItems, clearCart } = useCart();
  const { user } = useAuth();
  const { formatPrice, convertPrice, currency, symbol } = useCurrency();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [checkoutStep, setCheckoutStep] = useState<'review' | 'billing'>('review');
  const [billingInfo, setBillingInfo] = useState<BillingInfo>({
    firstName: '',
    lastName: '',
    email: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'USA',
    phone: ''
  });

  // Auto-fill identity and address if user is logged in
  React.useEffect(() => {
    if (user && checkoutStep === 'billing') {
      // 1. Auto-fill Identity (Name & Email)
      setBillingInfo(prev => ({
        ...prev,
        firstName: prev.firstName || (user.displayName ? user.displayName.split(' ')[0] : ''),
        lastName: prev.lastName || (user.displayName ? user.displayName.split(' ').slice(1).join(' ') : ''),
        email: prev.email || user.email || ''
      }));

      // 2. Auto-fill Address if saved addresses exist
      const fetchAndFillAddress = async () => {
        try {
          const addresses = await getUserAddresses(user.uid);
          const defaultAddr = addresses.find(a => a.isDefault) || addresses[0];
          
          if (defaultAddr) {
            const names = defaultAddr.fullName.split(' ');
            setBillingInfo(prev => ({
              ...prev,
              firstName: prev.firstName || names[0] || '',
              lastName: prev.lastName || names.slice(1).join(' ') || '',
              address: prev.address || defaultAddr.street,
              city: prev.city || defaultAddr.city,
              state: prev.state || defaultAddr.state,
              zipCode: prev.zipCode || defaultAddr.zipCode,
              country: prev.country || defaultAddr.country,
              phone: prev.phone || defaultAddr.phone
            }));
          }
        } catch (error) {
          console.error("Error auto-filling address:", error);
        }
      };

      fetchAndFillAddress();
    }
  }, [user, checkoutStep]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Validation for phone number: max 10 digits, numbers only
    if (name === 'phone') {
      const numericValue = value.replace(/\D/g, '');
      if (numericValue.length <= 10) {
        setBillingInfo(prev => ({ ...prev, [name]: numericValue }));
      }
      return;
    }

    // Validation for zip code: max 6 digits, numbers only
    if (name === 'zipCode') {
      const numericValue = value.replace(/\D/g, '');
      if (numericValue.length <= 6) {
        setBillingInfo(prev => ({ ...prev, [name]: numericValue }));
      }
      return;
    }

    setBillingInfo(prev => ({ ...prev, [name]: value }));
  };

  const isBillingValid = () => {
    return Object.values(billingInfo).every(val => typeof val === 'string' && val.trim().length > 0);
  };

  const handleCheckout = async () => {
    if (!user) {
      navigate('/login', { state: { from: { pathname: '/cart' } } });
      return;
    }

    if (checkoutStep === 'review') {
      setCheckoutStep('billing');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (!isBillingValid()) {
      alert("Please fill in all billing details.");
      return;
    }

    setIsProcessing(true);
    try {
      const orderData = {
        userId: user.uid,
        userEmail: user.email || '',
        items: cart.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          images: item.images,
          selectedColor: item.selectedColor,
          selectedSize: item.selectedSize
        })),
        total: totalPrice,
        status: 'pending' as const,
        billingInfo
      };

      await createOrder(orderData as any);
      
      // Save address if rememberMe is selected
      if (rememberMe) {
        try {
          await saveUserAddress(user.uid, {
            userId: user.uid,
            fullName: `${billingInfo.firstName} ${billingInfo.lastName}`,
            street: billingInfo.address,
            city: billingInfo.city,
            state: billingInfo.state || 'N/A',
            zipCode: billingInfo.zipCode,
            country: billingInfo.country || 'USA',
            phone: billingInfo.phone,
            isDefault: true
          });
        } catch (error) {
          console.warn("Failed to remember address:", error);
        }
      }
      
      // Sync to Google Sheets via Google Apps Script (keep as is if user still wants it)
      try {
        const googleSheetsPayload = {
          firstName: billingInfo.firstName,
          lastName: billingInfo.lastName,
          email: user.email,
          streetAddress: billingInfo.address,
          city: billingInfo.city,
          zipCode: billingInfo.zipCode,
          productName: cart.map(item => `${item.name} (x${item.quantity})`).join(', '),
          totalAmount: `${symbol}${convertPrice(totalPrice).toFixed(2)} (${currency})`,
          baseTotalUsd: totalPrice.toFixed(2),
          currency: currency,
          orderId: 'LOCAL_ORD',
          timestamp: new Date().toISOString()
        };

        await fetch('https://script.google.com/macros/s/AKfycbw-uhwr6XM4H7zpbhhlnnCusoy8Gh6pdm68PZnN1prOM83Z91FynI240opdixF_ISz6/exec', {
          method: 'POST',
          mode: 'no-cors',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(googleSheetsPayload)
        });
      } catch (error) {
        console.warn("Google Sheets sync failed:", error);
      }

      setIsSuccess(true);
      clearCart();
      setTimeout(() => {
        navigate('/shop');
      }, 3000);
    } catch (error) {
      console.error("Checkout error:", error);
      alert("There was an error processing your order. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="pt-40 pb-20 px-4 text-center min-h-[80vh] flex flex-col items-center justify-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", damping: 12 }}
        >
          <CheckCircle2 size={100} className="text-green-500 mb-8" />
        </motion.div>
        <h1 className="text-5xl font-display tracking-tight italic mb-6">Order Placed!</h1>
        <p className="text-[10px] tracking-[0.3em] font-bold text-gray-400 mb-12 uppercase">Thank you for your purchase. Redirecting you home...</p>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="pt-40 pb-20 px-4 text-center min-h-[80vh] flex flex-col items-center justify-center">
        <ShoppingBag size={80} className="text-gray-100 mb-8" />
        <h1 className="text-4xl font-display tracking-tight text-ink italic mb-6 uppercase">YOUR CART IS EMPTY</h1>
        <p className="text-[10px] tracking-[0.3em] font-bold text-gray-400 mb-12 uppercase">ADD ITEMS TO YOUR CART TO CONTINUE SHOPPING</p>
        <Link to="/shop" className="bg-accent text-white px-12 py-6 font-bold tracking-widest text-sm hover:shadow-xl transition-all uppercase rounded-full">
          EXPLORE PRODUCTS
        </Link>
      </div>
    );
  }

  const getCompositeKey = (item: any) => `${item.id}-${item.selectedColor || ''}-${item.selectedSize || ''}`;

  return (
    <div className="pt-32 sm:pt-48 px-6 max-w-7xl mx-auto min-h-screen pb-20">
      <div className="mb-12">
        <h1 className="text-5xl sm:text-7xl font-display tracking-tight text-ink italic mb-2">My Cart</h1>
        <p className="text-[10px] tracking-[0.2em] font-bold text-gray-400 uppercase">You have {totalItems} items in your collection</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
        <div className="lg:col-span-8 space-y-12">
          <AnimatePresence mode="wait">
            {checkoutStep === 'billing' ? (
              <motion.section 
                key="billing"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white rounded-[40px] p-8 sm:p-12 border border-gray-100 premium-shadow"
              >
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-stone rounded-full flex items-center justify-center">
                      <MapPin size={20} className="text-accent" />
                    </div>
                    <h2 className="text-2xl font-display italic">Billing Details</h2>
                  </div>
                  <button 
                    onClick={() => setCheckoutStep('review')}
                    className="text-[10px] font-bold tracking-widest uppercase text-gray-400 hover:text-accent underline underline-offset-4"
                  >
                    Back to Cart
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">First Name</label>
                    <input 
                      type="text" 
                      name="firstName"
                      value={billingInfo.firstName}
                      onChange={handleInputChange}
                      placeholder="John"
                      className="w-full bg-stone border-none rounded-2xl px-6 py-4 text-xs font-bold tracking-widest focus:ring-2 focus:ring-accent/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">Last Name</label>
                    <input 
                      type="text" 
                      name="lastName"
                      value={billingInfo.lastName}
                      onChange={handleInputChange}
                      placeholder="Doe"
                      className="w-full bg-stone border-none rounded-2xl px-6 py-4 text-xs font-bold tracking-widest focus:ring-2 focus:ring-accent/20"
                    />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">Email Confirmation</label>
                    <input 
                      type="email" 
                      name="email"
                      value={billingInfo.email}
                      onChange={handleInputChange}
                      placeholder="john@example.com"
                      className="w-full bg-stone border-none rounded-2xl px-6 py-4 text-xs font-bold tracking-widest focus:ring-2 focus:ring-accent/20"
                    />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">Address</label>
                    <input 
                      type="text" 
                      name="address"
                      value={billingInfo.address}
                      onChange={handleInputChange}
                      placeholder="Street Address"
                      className="w-full bg-stone border-none rounded-2xl px-6 py-4 text-xs font-bold tracking-widest focus:ring-2 focus:ring-accent/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">City</label>
                    <input 
                      type="text" 
                      name="city"
                      value={billingInfo.city}
                      onChange={handleInputChange}
                      placeholder="City"
                      className="w-full bg-stone border-none rounded-2xl px-6 py-4 text-xs font-bold tracking-widest focus:ring-2 focus:ring-accent/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">State/Province</label>
                    <input 
                      type="text" 
                      name="state"
                      value={billingInfo.state}
                      onChange={handleInputChange}
                      placeholder="NY"
                      className="w-full bg-stone border-none rounded-2xl px-6 py-4 text-xs font-bold tracking-widest focus:ring-2 focus:ring-accent/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">Zip Code</label>
                    <input 
                      type="text" 
                      name="zipCode"
                      value={billingInfo.zipCode}
                      onChange={handleInputChange}
                      placeholder="12345"
                      className="w-full bg-stone border-none rounded-2xl px-6 py-4 text-xs font-bold tracking-widest focus:ring-2 focus:ring-accent/20"
                      maxLength={6}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">Country</label>
                    <input 
                      type="text" 
                      name="country"
                      value={billingInfo.country}
                      onChange={handleInputChange}
                      placeholder="USA"
                      className="w-full bg-stone border-none rounded-2xl px-6 py-4 text-xs font-bold tracking-widest focus:ring-2 focus:ring-accent/20"
                    />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">Phone Number (10 Digits)</label>
                    <input 
                      type="tel" 
                      name="phone"
                      value={billingInfo.phone}
                      onChange={handleInputChange}
                      placeholder="1234567890"
                      className="w-full bg-stone border-none rounded-2xl px-6 py-4 text-xs font-bold tracking-widest focus:ring-2 focus:ring-accent/20"
                      maxLength={10}
                    />
                  </div>
                  <div className="md:col-span-2 pt-4">
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <div className="relative">
                        <input 
                          type="checkbox" 
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                          className="sr-only"
                        />
                        <div className={`w-6 h-6 rounded-lg border-2 transition-all flex items-center justify-center ${rememberMe ? 'bg-accent border-accent shadow-lg shadow-accent/20' : 'border-gray-200 bg-white group-hover:border-accent/40'}`}>
                          {rememberMe && <CheckCircle2 size={12} className="text-white" />}
                        </div>
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-[0.1em] text-gray-500 group-hover:text-ink transition-colors italic">
                        Remember these details for my next curation
                      </span>
                    </label>
                  </div>
                </div>
              </motion.section>
            ) : (
              <motion.div 
                key="review"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-10"
              >
                <AnimatePresence mode="popLayout">
                {cart.map((item) => (
                  <motion.div 
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    key={getCompositeKey(item)} 
                    className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-8 border-b border-gray-100 pb-10 group"
                  >
                    <div className="w-full sm:w-32 aspect-[3/4] bg-stone overflow-hidden rounded-xl border border-gray-50">
                      <img src={item.images?.[0]} alt={item.name} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                    </div>
                    <div className="flex-grow flex flex-col justify-between py-1">
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="text-base font-bold tracking-tight text-ink uppercase">{item.name}</h3>
                          <div className="flex flex-col items-end">
                            <p className="font-display italic text-lg tracking-tight text-ink">{formatPrice(item.price)}</p>
                            <div className="w-4 h-[1px] bg-accent/20 mt-1"></div>
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 mb-6">
                          <p className="text-[10px] text-accent tracking-widest uppercase font-bold">{item.category}</p>
                          {(item.selectedColor || item.selectedSize) && <span className="w-1 h-1 rounded-full bg-gray-200"></span>}
                          {item.selectedColor && (
                            <span className="text-[9px] font-black tracking-widest text-ink uppercase bg-stone px-2 py-1 rounded">
                              Color: {item.selectedColor}
                            </span>
                          )}
                          {item.selectedSize && (
                            <span className="text-[9px] font-black tracking-widest text-ink uppercase bg-stone px-2 py-1 rounded">
                              Size: {item.selectedSize}
                            </span>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-8">
                          <div className="flex items-center space-x-6 bg-stone p-1 rounded-full px-4">
                            <button onClick={() => updateQuantity(getCompositeKey(item), item.quantity - 1)} className="text-sm font-bold text-gray-400 hover:text-accent transition-colors">-</button>
                            <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                            <button onClick={() => updateQuantity(getCompositeKey(item), item.quantity + 1)} className="text-sm font-bold text-gray-400 hover:text-accent transition-colors">+</button>
                          </div>
                          <button 
                            onClick={() => removeFromCart(getCompositeKey(item))}
                            className="text-gray-300 hover:text-red-500 transition-colors"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="lg:col-span-4 lg:sticky lg:top-32 h-fit space-y-8">
          <div className="bg-white p-10 space-y-8 premium-shadow rounded-3xl border border-gray-50">
            <h2 className="text-2xl font-display italic tracking-tight border-b border-gray-100 pb-4">Summary</h2>
            
            <div className="space-y-4 text-[10px] font-black tracking-[0.2em] uppercase italic">
              <div className="flex justify-between text-gray-400">
                <span>Refinement Subtotal</span>
                <span className="font-mono">{formatPrice(totalPrice)}</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Curation & Delivery</span>
                <span className="text-accent">Complementary</span>
              </div>
              <div className="flex justify-between text-ink pt-6 border-t border-gray-100 items-baseline">
                <span className="text-sm">Total Valuation</span>
                <span className="text-2xl font-display italic tracking-tight">{formatPrice(totalPrice)}</span>
              </div>
            </div>

            <button 
              onClick={handleCheckout}
              disabled={isProcessing}
              className="w-full bg-accent text-white py-6 font-bold tracking-widest text-xs hover:shadow-xl transition-all uppercase flex items-center justify-center space-x-4 rounded-full disabled:opacity-50"
            >
            {isProcessing ? (
              <span>Processing...</span>
            ) : checkoutStep === 'billing' ? (
              <>
                <span>Complete Order</span>
                <CheckCircle2 size={16} />
              </>
            ) : (
              <>
                <span>Checkout Now</span>
                <ArrowRight size={16} />
              </>
            )}
            </button>
          </div>
          
          <div className="p-8 border border-gray-100 rounded-2xl text-[10px] tracking-widest leading-relaxed uppercase opacity-40 font-bold">
            Secure checkout guaranteed. all major credit cards and digital wallets accepted.
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
