import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Product } from '../types';
import { motion } from 'motion/react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import { Plus, Heart, Loader2 } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { user } = useAuth();
  const { formatPrice } = useCurrency();

  const [isAddingToCart, setIsAddingToCart] = React.useState(false);
  const [isAddingToWishlist, setIsAddingToWishlist] = React.useState(false);

  const isWishlisted = isInWishlist(product.id);

  const isProductNew = () => {
    if (!product.createdAt) return product.isNew;
    
    try {
      const createdDate = product.createdAt.toDate 
        ? product.createdAt.toDate() 
        : new Date(product.createdAt);
      
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - createdDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      return diffDays <= 7;
    } catch (e) {
      return product.isNew;
    }
  };

  const toggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }
    
    setIsAddingToWishlist(true);
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 600));
    
    if (isWishlisted) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
    setIsAddingToWishlist(false);
  };

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }
    
    setIsAddingToCart(true);
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    addToCart(product);
    setIsAddingToCart(false);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group"
    >
      <div className="relative overflow-hidden bg-stone aspect-[3/4] group/image premium-shadow border border-gray-100 transition-all duration-300 group-hover:-translate-y-1">
        <Link to={`/product/${product.id}`} className="block h-full">
          <img 
            src={product.images?.[0]} 
            alt={product.name}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover transition-transform duration-700 group-hover/image:scale-105"
          />
        </Link>
        
        {isProductNew() && (
          <div className="absolute top-4 left-4 bg-accent text-white text-[10px] font-bold px-3 py-1 uppercase tracking-widest z-10 shadow-lg">
            New
          </div>
        )}

        <button 
          onClick={toggleWishlist}
          disabled={isAddingToWishlist}
          className={`absolute top-4 right-4 p-2 rounded-full shadow-lg z-10 transition-all ${isWishlisted ? 'bg-accent text-white' : 'bg-white/80 text-gray-400 hover:text-accent'} ${isAddingToWishlist ? 'opacity-70 cursor-not-allowed' : ''}`}
        >
          {isAddingToWishlist ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Heart size={16} fill={isWishlisted ? "currentColor" : "none"} />
          )}
        </button>

        <button 
          onClick={handleAddToCart}
          disabled={isAddingToCart}
          className="absolute bottom-4 left-4 right-4 bg-white/95 text-ink py-2.5 sm:py-4 text-[9px] sm:text-[10px] font-bold tracking-widest uppercase border border-gray-100 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 translate-y-0 sm:translate-y-2 sm:group-hover:translate-y-0 transition-all duration-300 z-20 hover:bg-accent hover:text-white flex items-center justify-center gap-2 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
        >
          {isAddingToCart ? (
            <>
              <Loader2 size={12} className="animate-spin" />
              <span>Processing...</span>
            </>
          ) : (
            'Add to Cart'
          )}
        </button>
      </div>
      
      <div className="mt-4 sm:mt-6 flex flex-col items-start gap-1 p-1">
        <div className="flex flex-col sm:flex-row justify-between w-full items-start gap-1 sm:gap-2">
          <Link to={`/product/${product.id}`} className="text-xs sm:text-sm font-bold tracking-tight text-ink hover:text-accent transition-colors uppercase leading-tight truncate w-full sm:w-auto">
            {product.name}
          </Link>
          <div className="flex flex-col items-end shrink-0">
            <span className="text-sm font-display italic tracking-tight text-ink">{formatPrice(product.price)}</span>
            <div className="w-4 h-[1px] bg-accent/20 mt-1"></div>
          </div>
        </div>
        <div className="flex items-center gap-2 mt-0.5 sm:mt-1">
          <span className="text-[8px] sm:text-[10px] font-black tracking-widest text-gray-400 uppercase italic">
            {product.category}
          </span>
          {product.colors && product.colors.length > 0 && (
            <>
              <span className="w-1 h-1 rounded-full bg-gray-200"></span>
              <div className="flex items-center gap-1.5">
                {product.colors.slice(0, 3).map((color, i) => (
                  <div 
                    key={i} 
                    className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full border border-gray-100 shadow-sm" 
                    style={{ backgroundColor: color.toLowerCase() }}
                    title={color}
                  />
                ))}
                {product.colors.length > 3 && (
                  <span className="text-[8px] font-bold text-gray-400 tracking-tighter">+{product.colors.length - 3}</span>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
