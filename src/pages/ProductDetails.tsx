import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProductById, getProductsByGroupId } from '../lib/dataService';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import { motion } from 'motion/react';
import { ArrowLeft, Plus, Minus, Share2, Info, Heart, Loader2 } from 'lucide-react';

const ProductDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { user } = useAuth();
  const { formatPrice } = useCurrency();
  const [quantity, setQuantity] = useState(1);
  const [product, setProduct] = useState<Product | null>(null);
  const [siblings, setSiblings] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const [isZooming, setIsZooming] = useState(false);

  const [activeImage, setActiveImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);

  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isAddingToWishlist, setIsAddingToWishlist] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomPos({ x, y });
  };

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      try {
        const fetchedProduct = await getProductById(id);
        setProduct(fetchedProduct);
        if (fetchedProduct) {
          setSelectedSize(fetchedProduct.sizes[0]);
          setSelectedColor(fetchedProduct.colors[0]);
          
          if (fetchedProduct.groupId) {
            const related = await getProductsByGroupId(fetchedProduct.groupId);
            setSiblings(related.filter(p => p.id !== fetchedProduct.id));
          } else {
            setSiblings([]);
          }
        }
      } catch (error) {
        console.error("Error fetching product:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const variantImages = product?.variants?.find(v => v.color === selectedColor)?.images || [];
  const displayImages = variantImages.length > 0 ? variantImages : product?.images || [];

  const isWishlisted = product ? isInWishlist(product.id) : false;

  const toggleWishlist = async () => {
    if (!product) return;
    if (!user) {
      navigate('/login');
      return;
    }
    
    setIsAddingToWishlist(true);
    await new Promise(resolve => setTimeout(resolve, 600));

    if (isWishlisted) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
    setIsAddingToWishlist(false);
  };

  const handleAddToCart = async () => {
    if (!product) return;
    if (!user) {
      navigate('/login');
      return;
    }

    setIsAddingToCart(true);
    await new Promise(resolve => setTimeout(resolve, 800));

    for(let i=0; i<quantity; i++) {
      addToCart(product, { 
        color: selectedColor || undefined, 
        size: selectedSize || undefined 
      });
    }
    setIsAddingToCart(false);
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-accent"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="h-screen flex items-center justify-center">
        <h1 className="text-4xl font-display uppercase tracking-widest">PRODUCT_NOT_FOUND</h1>
      </div>
    );
  }

  return (
    <div className="pt-32 sm:pt-48 min-h-screen px-6 max-w-7xl mx-auto mb-20">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center space-x-4 text-[10px] font-bold tracking-[0.2em] text-gray-400 hover:text-accent transition-colors mb-12 uppercase group"
      >
        <ArrowLeft size={14} className="group-hover:-translate-x-2 transition-transform" />
        <span>Back to Collection</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 md:gap-24">
        {/* Gallery */}
        <div className="lg:col-span-7 space-y-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="aspect-[3/4] bg-stone overflow-hidden rounded-[2.5rem] premium-shadow border border-gray-100 cursor-zoom-in relative"
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsZooming(true)}
            onMouseLeave={() => setIsZooming(false)}
          >
            <motion.img 
              key={`${selectedColor}-${activeImage}`}
              src={displayImages[activeImage]} 
              alt={product.name}
              referrerPolicy="no-referrer"
              animate={{ 
                scale: isZooming ? 1.5 : 1,
                transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`
              }}
              transition={{ 
                scale: { duration: 0.4 },
                transformOrigin: { duration: 0 } // Immediate tracking
              }}
              className="w-full h-full object-cover"
            />
            {/* Gloss Overlay */}
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-white/10 to-transparent mix-blend-overlay" />
          </motion.div>
          
          {displayImages.length > 1 && (
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-stone">
               {displayImages.map((img, idx) => (
                 <button 
                  key={idx}
                  onClick={() => setActiveImage(idx)}
                  className={`relative w-24 sm:w-32 aspect-[3/4] flex-shrink-0 bg-stone rounded-2xl overflow-hidden border-2 transition-all ${activeImage === idx ? 'border-accent shadow-lg scale-95' : 'border-transparent opacity-60 hover:opacity-100'}`}
                 >
                    <img src={img} alt={`${product.name} ${idx + 1}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                 </button>
               ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="lg:col-span-5 h-fit space-y-10 lg:sticky lg:top-32">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
               <span className="w-8 h-[1px] bg-accent"></span>
               <span className="text-accent text-[10px] font-bold tracking-[0.3em] uppercase italic">{product.category}</span>
            </div>
            <h1 className="text-5xl font-display tracking-tight text-ink italic leading-tight">{product.name}</h1>
            <div className="flex items-end justify-between border-b border-gray-100 pb-8">
               <div className="flex flex-col">
                 <p className="text-4xl font-display italic tracking-tight text-ink">{formatPrice(product.price)}</p>
                 <div className="flex items-center gap-2 mt-2">
                   <div className="w-8 h-[1px] bg-accent/20"></div>
                   <span className="text-[10px] font-black tracking-widest text-gray-400 uppercase">VAT Included</span>
                 </div>
               </div>
               <span className="text-[10px] font-mono text-gray-300 bg-stone/50 px-3 py-1 rounded-full uppercase tracking-widest">A-NR: {product.id}</span>
            </div>
          </div>

          <p className="text-sm text-gray-500 leading-relaxed font-medium">
            {product.description}
          </p>

          <div className="space-y-10">
            <div className="flex flex-col space-y-4">
              <div className="flex justify-between items-center text-[10px] font-bold tracking-widest text-gray-400 uppercase">
                <span>Select Size</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map(size => (
                  <button 
                    key={size} 
                    onClick={() => setSelectedSize(size)}
                    className={`text-[11px] font-bold px-5 h-12 flex items-center justify-center border rounded-xl transition-all ${selectedSize === size ? 'bg-ink text-white border-ink shadow-lg' : 'hover:border-accent hover:text-accent border-gray-100'}`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col space-y-4">
              <div className="flex justify-between items-center text-[10px] font-bold tracking-widest text-ink uppercase">
                <span>Color: <span className="text-accent">{selectedColor}</span></span>
              </div>
              <div className="flex flex-wrap gap-4">
                {/* Linked Grouped Color Variations */}
                {siblings.map(sibling => (
                  <button 
                    key={sibling.id} 
                    onClick={() => {
                        navigate(`/product/${sibling.id}`);
                        window.scrollTo(0, 0);
                    }}
                    className="group relative flex flex-col items-center gap-2 p-1 rounded-2xl transition-all hover:bg-stone/30"
                  >
                    <div className="w-16 sm:w-20 aspect-[3/4] rounded-xl overflow-hidden bg-stone border border-gray-100 transition-transform group-hover:scale-95 grayscale hover:grayscale-0">
                      <img 
                        src={sibling.images[0]} 
                        alt={sibling.name} 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-tighter text-ink opacity-40 group-hover:opacity-100 transition-opacity pb-1 truncate max-w-[80px]">
                      {sibling.colors?.[0] || 'Alt'}
                    </span>
                  </button>
                ))}

                {/* Internal Color Variations (Current Product) */}
                {product.colors.map(color => {
                  const variant = product.variants?.find(v => v.color === color);
                  const thumbnail = variant?.images?.[0] || product.images[0];
                  
                  return (
                    <button 
                      key={color} 
                      onClick={() => {
                        setSelectedColor(color);
                        setActiveImage(0); // Reset gallery index on color change
                      }}
                      className={`group relative flex flex-col items-center gap-2 p-1 rounded-2xl transition-all ${selectedColor === color ? 'bg-stone/50 ring-2 ring-accent shadow-sm' : 'hover:bg-stone/30'}`}
                    >
                      <div className="w-16 sm:w-20 aspect-[3/4] rounded-xl overflow-hidden bg-stone border border-gray-100 transition-transform group-hover:scale-95">
                        <img 
                          src={thumbnail} 
                          alt={color} 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <span className="text-[9px] font-black uppercase tracking-tighter text-ink opacity-60 group-hover:opacity-100 transition-opacity pb-1">
                        {color}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-between border-y border-gray-100 py-6">
              <span className="text-[10px] font-bold tracking-widest uppercase text-gray-400">Quantity</span>
              <div className="flex items-center space-x-6 bg-stone p-1 rounded-full px-4">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="text-gray-400 hover:text-accent transition-colors"><Minus size={14} /></button>
                <span className="text-xs font-bold w-4 text-center">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="text-gray-400 hover:text-accent transition-colors"><Plus size={14} /></button>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <button 
              onClick={handleAddToCart}
              disabled={isAddingToCart}
              className="w-full bg-accent text-white py-6 font-bold tracking-widest text-xs hover:shadow-xl transition-all uppercase rounded-full shadow-lg flex items-center justify-center gap-4 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed"
            >
              {isAddingToCart ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Adding...</span>
                </>
              ) : (
                <>
                  Add to Cart
                  <Plus size={16} />
                </>
              )}
            </button>
            <div className="flex gap-4">
              <button 
                onClick={toggleWishlist}
                disabled={isAddingToWishlist}
                className={`flex-[0.5] border py-4 rounded-xl flex items-center justify-center space-x-2 text-[10px] font-bold tracking-widest transition-all uppercase disabled:opacity-50 disabled:cursor-not-allowed ${isWishlisted ? 'bg-accent border-accent text-white' : 'border-gray-100 text-gray-500 hover:border-accent'}`}
              >
                {isAddingToWishlist ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Heart size={14} fill={isWishlisted ? "currentColor" : "none"} />
                )}
                <span>{isWishlisted ? 'Saved' : 'Save'}</span>
              </button>
              <button className="flex-1 border border-gray-100 py-4 rounded-xl flex items-center justify-center space-x-2 text-[10px] font-bold tracking-widest hover:border-accent transition-all uppercase text-gray-500">
                <Share2 size={14} />
                <span>Share</span>
              </button>
              <button className="flex-1 border border-gray-100 py-4 rounded-xl flex items-center justify-center space-x-2 text-[10px] font-bold tracking-widest hover:border-accent transition-all uppercase text-gray-500">
                <Info size={14} />
                <span>Guide</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
