import React from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../types';
import { motion } from 'motion/react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import { Plus, Heart } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { user, login } = useAuth();
  const { formatPrice } = useCurrency();

  const isWishlisted = isInWishlist(product.id);

  const toggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) {
      login();
      return;
    }
    if (isWishlisted) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) {
      login();
      return;
    }
    addToCart(product);
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
            src={product.image} 
            alt={product.name}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover transition-transform duration-700 group-hover/image:scale-105"
          />
        </Link>
        
        {product.isNew && (
          <div className="absolute top-4 left-4 bg-accent text-white text-[10px] font-bold px-3 py-1 uppercase tracking-widest z-10 shadow-lg">
            New
          </div>
        )}

        <button 
          onClick={toggleWishlist}
          className={`absolute top-4 right-4 p-2 rounded-full shadow-lg z-10 transition-all ${isWishlisted ? 'bg-accent text-white' : 'bg-white/80 text-gray-400 hover:text-accent'}`}
        >
          <Heart size={16} fill={isWishlisted ? "currentColor" : "none"} />
        </button>

        <button 
          onClick={handleAddToCart}
          className="absolute bottom-4 left-4 right-4 bg-white/95 text-ink py-2.5 sm:py-4 text-[9px] sm:text-[10px] font-bold tracking-widest uppercase border border-gray-100 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 translate-y-0 sm:translate-y-2 sm:group-hover:translate-y-0 transition-all duration-300 z-20 hover:bg-accent hover:text-white"
        >
          Add to Cart
        </button>
      </div>
      
      <div className="mt-4 sm:mt-6 flex flex-col items-start gap-1 p-1">
        <div className="flex flex-col sm:flex-row justify-between w-full items-start gap-1 sm:gap-2">
          <Link to={`/product/${product.id}`} className="text-xs sm:text-sm font-bold tracking-tight text-ink hover:text-accent transition-colors uppercase leading-tight truncate w-full sm:w-auto">
            {product.name}
          </Link>
          <span className="text-xs sm:text-sm font-semibold text-gray-900 shrink-0">{formatPrice(product.price)}</span>
        </div>
        <div className="flex items-center gap-2 mt-0.5 sm:mt-1">
          <span className="text-[8px] sm:text-[10px] font-mono tracking-widest text-gray-400 font-bold uppercase">
            {product.category}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
