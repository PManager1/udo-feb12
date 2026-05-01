import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const COMPETITOR_RATE = 0.30;
const UDO_RATE = 0.15;
const SAVINGS_RATE = COMPETITOR_RATE - UDO_RATE; // 15%

const BENCHMARK_DATA = [
  { category: 'New / Niche', icon: '🌱', dailyOrders: 10 },
  { category: 'The "Sweet Spot"', icon: '🔥', dailyOrders: 35 },
  { category: 'High Volume', icon: '🚀', dailyOrders: 80 },
];

const DEFAULT_ORDER_VALUE = 46;
const BENCHMARK_ORDER_VALUE = 30;

function formatCurrency(num) {
  return num.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 });
}

export default function ProfitCalculator() {
  const navigate = useNavigate();
  const [dailyOrders, setDailyOrders] = useState(80);
  const [avgOrderValue, setAvgOrderValue] = useState(DEFAULT_ORDER_VALUE);
  const [udoRateInput, setUdoRateInput] = useState(15);

  // Calculated savings
  const orders = Number(dailyOrders) || 0;
  const orderVal = Number(avgOrderValue) || 0;
  const udoRate = Number(udoRateInput) / 100;
  const savingsRate = COMPETITOR_RATE - udoRate;
  const dailySavings = orders * orderVal * savingsRate;
  const weeklySavings = dailySavings * 7;
  const monthlySavings = dailySavings * 30;
  const yearlySavings = dailySavings * 365;

  // For benchmark table
  const benchmarkOrderValue = BENCHMARK_ORDER_VALUE;
  const benchmarkSavingsRate = savingsRate > 0 ? savingsRate : 0;

  return (
    <div className="min-h-screen bg-[#f9f7f5]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-4">
          <button
            onClick={() => navigate('/mystore')}
            className="p-2 text-gray-500 hover:text-orange-500 hover:bg-gray-100 rounded-lg transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-2xl font-bold text-gray-900">💰 Profit Calculator</h1>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">

        {/* Hero Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-8 text-white text-center">
            <h2 className="text-2xl sm:text-3xl font-bold mb-2">Keep More of What You Earn</h2>
            <p className="text-orange-100 text-lg">Switch from 30% commission to U-DO's 15% and save thousands</p>
          </div>

          {/* Visual comparison bar */}
          <div className="px-6 py-6">
            <div className="flex flex-col sm:flex-row gap-6 items-center justify-center">
              {/* Competitor */}
              <div className="flex-1 w-full">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-500">Competitors</span>
                  <span className="text-lg font-bold text-red-500">30%</span>
                </div>
                <div className="h-8 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-red-400 rounded-full" style={{ width: '100%' }} />
                </div>
                <p className="text-xs text-gray-400 mt-1">They take nearly a third of every order</p>
              </div>

              {/* VS badge */}
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 font-bold text-sm">
                VS
              </div>

              {/* U-DO */}
              <div className="flex-1 w-full">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-500">U-DO</span>
                  <span className="text-lg font-bold text-green-600">15%</span>
                </div>
                <div className="h-8 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 rounded-full" style={{ width: '50%' }} />
                </div>
                <p className="text-xs text-gray-400 mt-1">Half the commission, double the savings</p>
              </div>
            </div>

            {/* Savings badge */}
            <div className="mt-6 text-center">
              <span className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-5 py-2.5 rounded-full text-lg font-bold">
                You save <span className="text-2xl">15%</span> on every order
              </span>
            </div>
          </div>
        </div>

        {/* Interactive Calculator */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="text-xl font-bold text-gray-900">📊 Calculate Your Savings</h3>
            <p className="text-sm text-gray-500 mt-1">Enter your numbers to see how much you could save with U-DO</p>
          </div>

          <div className="px-6 py-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
              {/* U-DO Commission Rate Input */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Your commission rate
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="30"
                    step="0.5"
                    value={udoRateInput}
                    onChange={(e) => setUdoRateInput(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-lg font-medium focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">%</span>
                </div>
              </div>

              {/* spacer to keep commission rate on its own row on desktop */}
              <div className="hidden sm:block" />

              {/* Daily Orders Input */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Orders per day
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    value={dailyOrders}
                    onChange={(e) => setDailyOrders(e.target.value)}
                    placeholder="e.g. 35"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-lg font-medium focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">orders/day</span>
                </div>
              </div>

              {/* Average Order Value Input */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Average order value
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg font-medium">$</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={avgOrderValue}
                    onChange={(e) => setAvgOrderValue(e.target.value)}
                    className="w-full pl-8 pr-4 py-3 border border-gray-200 rounded-xl text-lg font-medium focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition"
                  />
                </div>
              </div>
            </div>

            {/* Results */}
            {orders > 0 && orderVal > 0 && savingsRate > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-orange-50 rounded-xl p-4 text-center">
                  <p className="text-xs font-medium text-orange-600 uppercase tracking-wide mb-1">Daily</p>
                  <p className="text-2xl font-bold text-orange-600">{formatCurrency(dailySavings)}</p>
                </div>
                <div className="bg-orange-50 rounded-xl p-4 text-center">
                  <p className="text-xs font-medium text-orange-600 uppercase tracking-wide mb-1">Weekly</p>
                  <p className="text-2xl font-bold text-orange-600">{formatCurrency(weeklySavings)}</p>
                </div>
                <div className="bg-green-50 rounded-xl p-4 text-center ring-2 ring-green-200">
                  <p className="text-xs font-medium text-green-600 uppercase tracking-wide mb-1">Monthly</p>
                  <p className="text-2xl font-bold text-green-600">{formatCurrency(monthlySavings)}</p>
                  <p className="text-[10px] text-green-500 mt-0.5">30 days</p>
                </div>
                <div className="bg-green-50 rounded-xl p-4 text-center">
                  <p className="text-xs font-medium text-green-600 uppercase tracking-wide mb-1">Yearly</p>
                  <p className="text-2xl font-bold text-green-600">{formatCurrency(yearlySavings)}</p>
                  <p className="text-[10px] text-green-500 mt-0.5">365 days</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <p className="text-4xl mb-2">👆</p>
                <p>Enter your daily orders above to see your savings</p>
              </div>
            )}
          </div>
        </div>

        {/* Reference Comparison Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="text-xl font-bold text-gray-900">📋 Savings by Restaurant Category</h3>
            <p className="text-sm text-gray-500 mt-1">
              Based on {formatCurrency(benchmarkOrderValue)} average pizza order value in DC • Competitors take 30% vs U-DO's 15%
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Category</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Daily Orders</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Daily Savings</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Weekly Savings</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-orange-500 uppercase tracking-wide">Monthly (30 Days)</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-green-600 uppercase tracking-wide">Yearly (365 Days)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {BENCHMARK_DATA.map((row) => {
                  const daily = row.dailyOrders * benchmarkOrderValue * benchmarkSavingsRate;
                  const weekly = daily * 7;
                  const monthly = daily * 30;
                  const yearly = daily * 365;
                  return (
                    <tr key={row.category} className="hover:bg-orange-50/30 transition">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{row.icon}</span>
                          <span className="font-semibold text-gray-900">{row.category}</span>
                        </div>
                      </td>
                      <td className="text-center px-4 py-4 text-gray-700 font-medium">{row.dailyOrders}</td>
                      <td className="text-right px-4 py-4 text-gray-700 font-medium">{formatCurrency(daily)}</td>
                      <td className="text-right px-4 py-4 text-gray-700 font-medium">{formatCurrency(weekly)}</td>
                      <td className="text-right px-4 py-4 font-bold text-green-600">{formatCurrency(monthly)}</td>
                      <td className="text-right px-4 py-4 font-bold text-green-700">{formatCurrency(yearly)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="px-6 py-3 bg-gray-50 border-t border-gray-100">
            <p className="text-xs text-gray-400">
              💡 Savings calculated as the commission difference (30% − {udoRateInput}%) × daily orders × average order value.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}