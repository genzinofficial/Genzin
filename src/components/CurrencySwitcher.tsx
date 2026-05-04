import React from 'react';
import { useCurrency } from '../context/CurrencyContext';
import { Globe } from 'lucide-react';

const CurrencySwitcher: React.FC = () => {
  const { currency, setCurrency } = useCurrency();

  const currencies = [
    { code: 'USD', label: 'USD' },
    { code: 'INR', label: 'INR' },
    { code: 'EUR', label: 'EUR' },
    { code: 'GBP', label: 'GBP' },
    { code: 'JPY', label: 'JPY' },
  ];

  return (
    <div className="flex items-center gap-1.5">
      <Globe size={12} className="text-gray-400" />
      <select 
        value={currency} 
        onChange={(e) => setCurrency(e.target.value)}
        className="bg-transparent text-[9px] font-bold tracking-widest uppercase text-ink focus:outline-none cursor-pointer hover:text-accent transition-colors appearance-none"
      >
        {currencies.map((curr) => (
          <option key={curr.code} value={curr.code} className="bg-white text-ink">
            {curr.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default CurrencySwitcher;
