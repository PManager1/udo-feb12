import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getOrders, updateOrderStatus } from './api';

const STATUS_CONFIG = {
  pending:    { label: 'Pending',    color: 'bg-yellow-100 text-yellow-800',   dot: 'bg-yellow-500',   next: ['confirmed', 'cancelled'] },
  confirmed:  { label: 'Confirmed',  color: 'bg-blue-100 text-blue-800',       dot: 'bg-blue-500',     next: ['preparing', 'cancelled'] },
  preparing:  { label: 'Preparing',  color: 'bg-orange-100 text-orange-800',   dot: 'bg-orange-500',   next: ['ready', 'cancelled'] },
  ready:      { label: 'Ready',      color: 'bg-green-100 text-green-800',     dot: 'bg-green-500',    next: ['picked_up'] },
  picked_up:  { label: 'Picked Up',  color: 'bg-purple-100 text-purple-800',   dot: 'bg-purple-500',   next: ['delivered'] },
  delivered:  { label: 'Delivered',  color: 'bg-gray-100 text-gray-800',       dot: 'bg-gray-500',     next: [] },
  cancelled:  { label: 'Cancelled',  color: 'bg-red-100 text-red-800',         dot: 'bg-red-500',      next: [] },
};

const FILTER_TABS = ['all', 'pending', 'confirmed', 'preparing', 'ready', 'picked_up', 'delivered', 'cancelled'];

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

export default function OrdersPage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [updating, setUpdating] = useState({});

  const fetchOrders = useCallback(async () => {
    try {
      const data = await getOrders();
      setOrders(data);
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchOrders, 30000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  const handleStatusUpdate = async (orderId, newStatus) => {
    setUpdating((prev) => ({ ...prev, [orderId]: true }));
    try {
      const updated = await updateOrderStatus(orderId, newStatus);
      setOrders((prev) => prev.map((o) => (o.id === orderId || o._id === orderId ? updated : o)));
    } catch (err) {
      setError(err.message || 'Failed to update order');
    } finally {
      setUpdating((prev) => ({ ...prev, [orderId]: false }));
    }
  };

  const filteredOrders = activeFilter === 'all' ? orders : orders.filter((o) => o.status === activeFilter);

  const statusCounts = {};
  statusCounts['all'] = orders.length;
  for (const o of orders) {
    statusCounts[o.status] = (statusCounts[o.status] || 0) + 1;
  }

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
          <h1 className="text-2xl font-bold text-gray-900">📋 Orders</h1>
          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={fetchOrders}
              className="p-2 text-gray-400 hover:text-orange-500 hover:bg-gray-100 rounded-lg transition"
              title="Refresh"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-3 flex gap-2 overflow-x-auto scrollbar-hide">
          {FILTER_TABS.map((tab) => {
            const count = statusCounts[tab] || 0;
            const isActive = activeFilter === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveFilter(tab)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition ${
                  isActive
                    ? 'bg-orange-500 text-white shadow-sm'
                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {tab === 'all' ? 'All' : STATUS_CONFIG[tab]?.label || tab}
                {count > 0 && (
                  <span className={`ml-1.5 text-xs ${isActive ? 'text-white/80' : 'text-gray-400'}`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </header>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-orange-500 border-t-transparent mb-4" />
            <p className="text-gray-500">Loading orders...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📦</div>
            <p className="text-xl font-semibold text-gray-700">No orders yet</p>
            <p className="text-gray-400 mt-1">
              {activeFilter === 'all' ? 'Orders from your customers will appear here' : `No ${STATUS_CONFIG[activeFilter]?.label || activeFilter} orders`}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => {
              const orderId = order.id || order._id;
              const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
              const isExpanded = expandedOrder === orderId;
              const isUpdating = updating[orderId];

              return (
                <div
                  key={orderId}
                  className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                >
                  {/* Order Header — always visible */}
                  <button
                    onClick={() => setExpandedOrder(isExpanded ? null : orderId)}
                    className="w-full text-left px-5 py-4 flex items-center gap-4"
                  >
                    {/* Status dot */}
                    <div className={`w-3 h-3 rounded-full ${cfg.dot} flex-shrink-0`} />

                    {/* Order info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900">{order.orderNumber || '—'}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cfg.color}`}>
                          {cfg.label}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mt-0.5 truncate">
                        {order.customerName || 'Customer'} • {order.items?.length || 0} item{(order.items?.length || 0) !== 1 ? 's' : ''}
                      </p>
                    </div>

                    {/* Price + time */}
                    <div className="text-right flex-shrink-0">
                      <p className="font-bold text-gray-900">${order.total?.toFixed(2) || '0.00'}</p>
                      <p className="text-xs text-gray-400">{formatTime(order.createdAt)}</p>
                    </div>

                    {/* Expand chevron */}
                    <svg
                      className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="border-t border-gray-100 px-5 py-4 bg-gray-50/50">
                      {/* Customer info */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                        <div className="bg-white rounded-xl p-3 border border-gray-100">
                          <p className="text-xs text-gray-400 font-medium mb-1">CUSTOMER</p>
                          <p className="font-semibold text-gray-900">{order.customerName || '—'}</p>
                          {order.customerPhone && <p className="text-sm text-gray-500">{order.customerPhone}</p>}
                        </div>
                        <div className="bg-white rounded-xl p-3 border border-gray-100">
                          <p className="text-xs text-gray-400 font-medium mb-1">DELIVERY</p>
                          {order.deliveryAddress ? (
                            <p className="text-sm text-gray-700">
                              {order.deliveryAddress.street}
                              {order.deliveryAddress.city && `, ${order.deliveryAddress.city}`}
                            </p>
                          ) : (
                            <p className="text-sm text-gray-400">No address</p>
                          )}
                          {order.leaveAtDoor && (
                            <span className="text-xs text-orange-600 font-medium">🚪 Leave at door</span>
                          )}
                        </div>
                      </div>

                      {/* Items */}
                      <div className="bg-white rounded-xl border border-gray-100 mb-4 overflow-hidden">
                        <p className="text-xs text-gray-400 font-medium px-3 pt-3 pb-1">ITEMS</p>
                        <div className="divide-y divide-gray-50">
                          {order.items?.map((item, idx) => (
                            <div key={idx} className="px-3 py-2 flex justify-between">
                              <div>
                                <span className="font-medium text-gray-900">{item.quantity}× {item.itemName || item.name}</span>
                                {item.selectedOptions?.length > 0 && (
                                  <p className="text-xs text-gray-400">{item.selectedOptions.join(' • ')}</p>
                                )}
                                {item.specialInstructions && (
                                  <p className="text-xs text-orange-500 italic">📝 {item.specialInstructions}</p>
                                )}
                              </div>
                              <span className="text-gray-700 font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Price breakdown */}
                      <div className="bg-white rounded-xl border border-gray-100 p-3 mb-4 text-sm space-y-1">
                        <div className="flex justify-between text-gray-500">
                          <span>Subtotal</span><span>${order.subtotal?.toFixed(2) || '0.00'}</span>
                        </div>
                        <div className="flex justify-between text-gray-500">
                          <span>Delivery Fee</span><span>${order.deliveryFee?.toFixed(2) || '0.00'}</span>
                        </div>
                        <div className="flex justify-between text-gray-500">
                          <span>Service Fee</span><span>${order.serviceFee?.toFixed(2) || '0.00'}</span>
                        </div>
                        <div className="flex justify-between text-gray-500">
                          <span>Tax</span><span>${order.tax?.toFixed(2) || '0.00'}</span>
                        </div>
                        {order.tip > 0 && (
                          <div className="flex justify-between text-gray-500">
                            <span>Tip</span><span>${order.tip?.toFixed(2) || '0.00'}</span>
                          </div>
                        )}
                        <div className="flex justify-between font-bold text-gray-900 pt-1 border-t border-gray-100">
                          <span>Total</span><span>${order.total?.toFixed(2) || '0.00'}</span>
                        </div>
                      </div>

                      {/* Status action buttons */}
                      {cfg.next.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {cfg.next.map((nextStatus) => {
                            const nextCfg = STATUS_CONFIG[nextStatus];
                            return (
                              <button
                                key={nextStatus}
                                disabled={isUpdating}
                                onClick={() => handleStatusUpdate(orderId, nextStatus)}
                                className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${
                                  nextStatus === 'cancelled'
                                    ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200'
                                    : 'bg-orange-500 text-white hover:bg-orange-600 shadow-sm'
                                } disabled:opacity-50 disabled:cursor-not-allowed`}
                              >
                                {isUpdating ? (
                                  <span className="inline-flex items-center gap-1">
                                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                    Updating...
                                  </span>
                                ) : (
                                  nextStatus === 'cancelled' ? '❌ Cancel Order' : `→ ${nextCfg?.label || nextStatus}`
                                )}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}