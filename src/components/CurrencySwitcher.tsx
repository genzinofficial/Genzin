import React, { useState, useRef, useEffect } from 'react';
import { useCurrency } from '../context/CurrencyContext';
import { Globe, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const CurrencySwitcher: React.FC = () => {
  const { currency } = useCurrency();

  return (
    <div className="relative">
      <div 
        className="flex items-center gap-2 px-3 py-1.5"
      >
        <Globe size={12} className="text-accent" />
        <span className="text-[10px] font-black tracking-[0.2em] uppercase text-ink">{currency}</span>
        <span className="text-[10px] ml-1">🇮🇳</span>
      </div>
    </div>
  );
};

export default CurrencySwitcher;
