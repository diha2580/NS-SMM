import React from 'react';
import { useCurrency, Currency } from './CurrencyContext';
import { ChevronDown } from 'lucide-react';

export const CurrencySwitcher: React.FC = () => {
  const { currency, setCurrency } = useCurrency();
  const currencies: Currency[] = ['USD', 'BDT', 'USDT', 'EURO', 'INR'];

  return (
    <div className="relative">
      <select
        value={currency}
        onChange={(e) => setCurrency(e.target.value as Currency)}
        className="appearance-none bg-slate-100 text-slate-700 text-sm font-semibold py-2 px-3 rounded-xl cursor-pointer hover:bg-slate-200 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
      >
        {currencies.map((c) => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>
      <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
    </div>
  );
};
