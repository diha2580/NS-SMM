import React, { createContext, useState, useContext } from 'react';

export type Currency = 'USD' | 'BDT' | 'USDT' | 'EURO' | 'INR';

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  convert: (amount: number) => number;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currency, setCurrency] = useState<Currency>('USD');

  // Mock conversion rates - in a real app, fetch these from an API
  const rates: Record<Currency, number> = {
    USD: 1,
    BDT: 120,
    USDT: 1,
    EURO: 0.92,
    INR: 83,
  };

  const convert = (amount: number) => {
    return amount * rates[currency];
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, convert }}>
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
