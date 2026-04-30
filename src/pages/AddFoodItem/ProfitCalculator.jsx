import { useState } from 'react';

export default function ProfitCalculator() {
  const [price, setPrice] = useState('');
  const [cost, setCost] = useState('');
  const [showCalc, setShowCalc] = useState(false);

  const p = parseFloat(price) || 0;
  const c = parseFloat(cost) || 0;
  const udoPct = 15;
  const udoFee = p * (udoPct / 100);
  const payout = p - udoFee;
  const profit = payout - c;
  const margin = p > 0 ? ((profit / p) * 100).toFixed(1) : 0;

  return (
    <div className="mb-12 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow">
      <div className="p-5 cursor-pointer" onClick={() => setShowCalc(!showCalc)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-xl">🧮</span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Profit Calculator</h3>
              <p className="text-sm text-gray-500">Calculate your take-home profit per order</p>
            </div>
          </div>
          <svg className={`w-5 h-5 text-gray-400 transition-transform ${showCalc ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {showCalc && (
        <div className="border-t border-gray-100 p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Menu Price ($)</label>
              <input type="number" step="0.01" value={price} onChange={e => setPrice(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" placeholder="12.00" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Your Cost ($)</label>
              <input type="number" step="0.01" value={cost} onChange={e => setCost(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" placeholder="4.00" />
            </div>
          </div>

          {p > 0 && (
            <div className="bg-gray-50 rounded-xl p-4 space-y-2">
              <div className="flex justify-between text-sm"><span className="text-gray-600">Menu Price</span><span className="font-medium">${p.toFixed(2)}</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-600">UDO Fee ({udoPct}%)</span><span className="font-medium text-red-500">−${udoFee.toFixed(2)}</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-600">You Receive</span><span className="font-medium">${payout.toFixed(2)}</span></div>
              {c > 0 && <div className="flex justify-between text-sm"><span className="text-gray-600">Your Cost</span><span className="font-medium text-red-500">−${c.toFixed(2)}</span></div>}
              <div className="border-t pt-2 flex justify-between font-bold">
                <span>{c > 0 ? 'Profit' : 'You Keep'}</span>
                <span className={profit >= 0 ? 'text-green-600' : 'text-red-600'}>${(c > 0 ? profit : payout).toFixed(2)}</span>
              </div>
              {c > 0 && (
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Profit Margin</span>
                  <span className={parseFloat(margin) >= 20 ? 'text-green-600' : parseFloat(margin) >= 0 ? 'text-yellow-600' : 'text-red-600'}>{margin}%</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}