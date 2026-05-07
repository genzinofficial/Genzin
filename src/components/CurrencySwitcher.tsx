import React, { useState, useRef, useEffect } from 'react';
import { useCurrency } from '../context/CurrencyContext';
import { Globe, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const CurrencySwitcher: React.FC = () => {
  const { currency, setCurrency } = useCurrency();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currencies = [
    { code: 'USD', label: 'USD', name: 'US Dollar', flag: '🇺🇸' },
    { code: 'INR', label: 'INR', name: 'Indian Rupee', flag: '🇮🇳' },
    { code: 'EUR', label: 'EUR', name: 'Euro', flag: '🇪🇺' },
    { code: 'GBP', label: 'GBP', name: 'British Pound', flag: '🇬🇧' },
    { code: 'JPY', label: 'JPY', name: 'Japanese Yen', flag: '🇯🇵' },
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-stone transition-all group"
      >
        <Globe size={12} className={isOpen ? 'text-accent' : 'text-gray-400 group-hover:text-accent'} />
        <span className="text-[10px] font-black tracking-[0.2em] uppercase text-ink">{currency}</span>
        <ChevronDown size={10} className={`text-gray-300 transition-transform duration-300 ${isOpen ? 'rotate-180 text-accent' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="absolute top-full right-0 mt-2 w-48 bg-white border border-gray-100 rounded-2xl shadow-xl z-[100] overflow-hidden"
          >
            <div className="p-2">
              <div className="px-3 py-2 border-b border-gray-50 mb-1">
                <span className="text-[8px] font-black text-gray-400 uppercase tracking-[0.3em]">Select Currency</span>
              </div>
              <div className="space-y-0.5">
                {currencies.map((curr) => (
                  <button
                    key={curr.code}
                    onClick={() => {
                      setCurrency(curr.code);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all group ${
                      currency === curr.code ? 'bg-stone text-ink' : 'hover:bg-gray-50 text-gray-500 hover:text-ink'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-sm">{curr.flag}</span>
                      <div className="text-left">
                        <div className="text-[10px] font-black tracking-widest uppercase">{curr.code}</div>
                        <div className="text-[8px] font-bold text-gray-400 uppercase tracking-tighter">{curr.name}</div>
                      </div>
                    </div>
                    {currency === curr.code && (
                      <div className="w-1.5 h-1.5 rounded-full bg-accent"></div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CurrencySwitcher;
