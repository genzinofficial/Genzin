import React, { createContext, useContext, useState, useEffect } from 'react';

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
  const [currency, setCurrencyState] = useState('USD');
  const [symbol, setSymbol] = useState('$');
  const [loading, setLoading] = useState(true);

  const updateSymbol = (curr: string) => {
    const fmt = new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: curr,
    });
    const parts = fmt.formatToParts(0);
    const symbolPart = parts.find(p => p.type === 'currency');
    if (symbolPart) setSymbol(symbolPart.value);
  };

  useEffect(() => {
    const detectCurrency = async () => {
      try {
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        
        if (data.currency && EXCHANGE_RATES[data.currency]) {
          setCurrencyState(data.currency);
          updateSymbol(data.currency);
        }
      } catch (error) {
        console.error('Failed to detect currency:', error);
      } finally {
        setLoading(false);
      }
    };

    detectCurrency();
  }, []);

  const convertPrice = (amount: number) => {
    return amount * (EXCHANGE_RATES[currency] || 1);
  };

  const setCurrency = (newCurrency: string) => {
    if (EXCHANGE_RATES[newCurrency]) {
      setCurrencyState(newCurrency);
      updateSymbol(newCurrency);
    }
  };

  const formatPrice = (amount: number) => {
    // Convert from USD (base) to target currency
    const convertedAmount = convertPrice(amount);
    
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(convertedAmount);
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
