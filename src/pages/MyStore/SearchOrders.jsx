import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getOrders } from './api';

const STATUS_CONFIG = {
  pending:    { label: 'Pending',    color: 'bg-yellow-100 text-yellow-800', dot: 'bg-yellow-500' },
  confirmed:  { label: 'Confirmed',  color: 'bg-blue-100 text-blue-800',     dot: 'bg-blue-500' },
  preparing:  { label: 'Preparing',  color: 'bg-orange-100 text-orange-800', dot: 'bg-orange-500' },
  ready:      { label: 'Ready',      color: 'bg-green-100 text-green-800',   dot: 'bg-green-500' },
  picked_up:  { label: 'Picked Up',  color: 'bg-purple-100 text-purple-800', dot: 'bg-purple-500' },
  delivered:  { label: 'Delivered',  color: 'bg-gray-100 text-gray-800',     dot: 'bg-gray-500' },
  cancelled:  { label: 'Cancelled',  color: 'bg-red-100 text-red-800',       dot: 'bg-red-500' },
};

function formatTime(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now - d;
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function fuzzyMatch(value, query) {
  if (!value) return false;
  return String(value).toLowerCase().includes(query.toLowerCase());
}

function Highlight({ text, query }) {
  if (!query || !text) return text || '';
  const idx = String(text).toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {String(text).slice(0, idx)}
      <mark className="bg-yellow-200 text-yellow-900 rounded px-0.5">{String(text).slice(idx, idx + query.length)}</mark>
      {String(text).slice(idx + query.length)}
    </>
  );
}

function heroItems(items) {
  if (!items?.length) return '';
  const first2 = items.slice(0, 2).map(i => `${i.quantity}× ${i.itemName || i.name}`).join(', ');
  const extra = items.length > 2 ? `… +${items.length - 2} more` : '';
  return first2 + extra;
}

export default function SearchOrders() {
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState(() => {
    try { return JSON.parse(localStorage.getItem('udo-order-searches') || '[]'); } catch { return []; }
  });

  // Load all orders
  useEffect(() => {
    getOrders()
      .then(data => setOrders(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Auto-focus input
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Save recent search
  const saveRecent = (q) => {
    if (!q.trim()) return;
    setRecentSearches(prev => {
      const next = [q, ...prev.filter(s => s !== q)].slice(0, 5);
      localStorage.setItem('udo-order-searches', JSON.stringify(next));
      return next;
    });
  };

  // Filter orders
  const results = useMemo(() => {
    const q = query.trim();
    if (!q) return [];
    return orders.filter(o =>
      fuzzyMatch(o.orderNumber, q) ||
      fuzzyMatch(o.customerName, q) ||
      fuzzyMatch(o.customerPhone, q) ||
      fuzzyMatch(o.customerEmail, q) ||
      (o.items || []).some(i => fuzzyMatch(i.itemName || i.name, q)) ||
      fuzzyMatch(o.id, q) ||
      fuzzyMatch(o._id, q)
    );
  }, [orders, query]);

  const handleSelect = (orderId) => {
    saveRecent(query.trim());
    navigate(`/mystore/orders?expand=${orderId}`);
  };

  const q = query.trim();

  return (
    <div className="min-h-screen bg-white">
      {/* Search header */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center gap-2 px-4 py-3">
          {/* Back button */}
          <button onClick={() => navigate('/mystore/orders')}
            className="p-2 text-gray-500 hover:text-orange-500 hover:bg-gray-100 rounded-lg transition">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Search input */}
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="search"
              inputMode="search"
              placeholder="Order #, name, phone, or item…"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') saveRecent(query); }}
              className="w-full pl-4 pr-10 py-2.5 bg-gray-100 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-orange-400/50 focus:bg-white transition"
            />
            {query && (
              <button onClick={() => { setQuery(''); inputRef.current?.focus(); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-gray-300 text-white rounded-full flex items-center justify-center text-xs hover:bg-gray-400 transition">
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Result count */}
        {q && (
          <div className="px-4 pb-2">
            <span className="text-xs text-gray-500">
              {loading ? 'Searching…' : `${results.length} result${results.length !== 1 ? 's' : ''} for "${q}"`}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto">
        {/* No query yet: show recent searches */}
        {!q && recentSearches.length > 0 && (
          <div className="px-4 py-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-gray-400 font-medium">Recent Searches</p>
              <button onClick={() => { setRecentSearches([]); localStorage.removeItem('udo-order-searches'); }}
                className="text-xs text-gray-400 hover:text-red-500 transition">Clear</button>
            </div>
            <div className="flex flex-wrap gap-2">
              {recentSearches.map((s, i) => (
                <button key={i} onClick={() => setQuery(s)}
                  className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-orange-50 hover:text-orange-600 transition">
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* No query, no recent */}
        {!q && recentSearches.length === 0 && (
          <div className="text-center py-20">
            <div className="text-5xl mb-3">🔍</div>
            <p className="text-gray-500">Search by order number, customer name,<br />phone number, or item name</p>
          </div>
        )}

        {/* Results */}
        {q && !loading && results.length === 0 && (
          <div className="text-center py-20">
            <div className="text-5xl mb-3">🤷</div>
            <p className="text-lg font-semibold text-gray-700">No orders match "{q}"</p>
            <p className="text-gray-400 mt-1 text-sm">Try searching by name, order #, phone, or item</p>
            <button onClick={() => setQuery('')}
              className="mt-4 px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 transition">
              Clear Search
            </button>
          </div>
        )}

        {q && results.length > 0 && (
          <div className="divide-y divide-gray-100">
            {results.map(order => {
              const orderId = order.id || order._id;
              const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
              const hero = heroItems(order.items);

              return (
                <button
                  key={orderId}
                  onClick={() => handleSelect(orderId)}
                  className="w-full text-left px-4 py-3 hover:bg-orange-50/50 transition flex items-start gap-3"
                >
                  {/* Status dot */}
                  <div className={`w-2.5 h-2.5 rounded-full mt-2 flex-shrink-0 ${cfg.dot}`} />

                  {/* Order info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-900 text-sm">
                        <Highlight text={order.orderNumber || '—'} query={q} />
                      </span>
                      <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${cfg.color}`}>
                        {cfg.label}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-0.5 truncate">
                      <Highlight text={order.customerName || 'Customer'} query={q} />
                      {order.customerPhone && (
                        <span className="text-gray-400"> · <Highlight text={order.customerPhone} query={q} /></span>
                      )}
                    </p>
                    {hero && (
                      <p className="text-xs text-gray-400 mt-0.5 truncate">{hero}</p>
                    )}
                  </div>

                  {/* Price + time */}
                  <div className="text-right flex-shrink-0">
                    <p className="font-bold text-gray-900 text-sm">${order.total?.toFixed(2) || '0.00'}</p>
                    <p className="text-xs text-gray-400">{formatTime(order.createdAt)}</p>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}