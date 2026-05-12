import React, { createContext, useContext, useState } from 'react';

interface CurrencyContextType {
  currency: string;
  symbol: string;
  formatPrice: (amount: number) => string;
  convertPrice: (amount: number) => number;
  setCurrency: (currency: string) => void;
  loading: boolean;
}

const EXCHANGE_RATES: Record<string, number> = {
  USD: 1,
  INR: 95,
  EUR: 0.92,
  GBP: 0.79,
  JPY: 156.40,
};

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currency] = useState('INR');
  const [symbol] = useState('₹');
  const [loading] = useState(false);

  const convertPrice = (amount: number) => {
    return amount;
  };

  const setCurrency = (_newCurrency: string) => {
    // No-op to lock currency to INR
  };

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <CurrencyContext.Provider value={{ currency, symbol, formatPrice, convertPrice, setCurrency, loading }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};
