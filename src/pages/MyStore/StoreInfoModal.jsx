import { useState, useEffect } from 'react';
import { useApp } from './MyStore';
import * as api from './api';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const STORE_TYPES = [
  { value: '', label: 'Select type...' },
  { value: 'cafe', label: '☕ Cafe' },
  { value: 'restaurant', label: '🍽️ Restaurant' },
  { value: 'grocery', label: '🛒 Grocery / Convenience' },
  { value: 'flowers', label: '💐 Flower Shop / Boutique' },
];
const RESTAURANT_CATEGORIES = [
  { value: '', label: 'Select category...' },
  { value: 'fast-food', label: '🍔 Fast Food' },
  { value: 'pizza', label: '🍕 Pizza' },
  { value: 'mexican', label: '🌮 Mexican' },
  { value: 'chinese', label: '🥡 Chinese' },
  { value: 'indian', label: '🍛 Indian' },
  { value: 'italian', label: '🍝 Italian' },
  { value: 'sushi', label: '🍣 Japanese / Sushi' },
  { value: 'thai', label: '🍜 Thai' },
  { value: 'breakfast', label: '🥞 Breakfast & Brunch' },
  { value: 'desserts', label: '🍰 Desserts & Bakery' },
  { value: 'healthy', label: '🥗 Healthy / Salads' },
  { value: 'burgers', label: '🍔 Burgers' },
  { value: 'wings', label: '🍗 Wings & Chicken' },
  { value: 'seafood', label: '🦐 Seafood' },
];

export default function StoreInfoModal({ onClose }) {
  const { showToast } = useApp();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    restaurantName: '',
    storeType: '',
    storeAddress: '',
    category: '',
    emergencyPause: false,
  });
  const [hours, setHours] = useState(() => {
    const h = {};
    DAYS.forEach(d => { h[d] = { open: '09:00', close: '21:00' }; });
    return h;
  });

  // Load profile
  useEffect(() => {
    (async () => {
      try {
        const profile = await api.getProfile();
        const data = profile.store || profile;
        setForm({
          restaurantName: data.restaurantName || data.storeName || data.name || '',
          storeType: data.storeType || '',
          storeAddress: data.storeAddress || data.address || '',
          category: data.category || '',
          emergencyPause: data.emergencyPause || false,
        });
        // Parse hours
        if (data.storeHours && typeof data.storeHours === 'object') {
          const parsed = {};
          DAYS.forEach(d => {
            const val = data.storeHours[d];
            if (val && val.includes('-')) {
              const [o, c] = val.split('-');
              parsed[d] = { open: o, close: c };
            } else {
              parsed[d] = { open: '09:00', close: '21:00' };
            }
          });
          setHours(parsed);
        } else if (data.hours && typeof data.hours === 'object') {
          const parsed = {};
          DAYS.forEach(d => {
            const h = data.hours[d];
            parsed[d] = h ? { open: h.open || '09:00', close: h.close || '21:00' } : { open: '09:00', close: '21:00' };
          });
          setHours(parsed);
        }
      } catch (err) {
        console.error('Failed to load profile:', err);
      }
    })();
  }, []);

  const updateField = (field, value) => setForm(prev => ({ ...prev, [field]: value }));
  const updateHour = (day, field, value) => setHours(prev => ({
    ...prev,
    [day]: { ...prev[day], [field]: value },
  }));

  const fillAllHours = (open, close) => {
    const updated = {};
    DAYS.forEach(d => { updated[d] = { open, close }; });
    setHours(updated);
  };
  const clearAllHours = () => {
    const cleared = {};
    DAYS.forEach(d => { cleared[d] = { open: '', close: '' }; });
    setHours(cleared);
  };

  const handleSave = async () => {
    if (!form.restaurantName.trim()) { showToast('Enter a store name', 'error'); return; }
    setSaving(true);
    try {
      // Flatten hours
      const storeHours = {};
      DAYS.forEach(d => {
        const h = hours[d];
        if (h && h.open && h.close) {
          storeHours[d] = `${h.open}-${h.close}`;
        }
      });

      // Load existing profile to preserve fields
      let existing = {};
      try {
        const raw = await api.getProfile();
        existing = raw.store || raw || {};
      } catch {}

      await api.updateProfile({
        restaurantName: form.restaurantName,
        storeType: form.storeType,
        storeAddress: form.storeAddress,
        category: form.category,
        emergencyPause: form.emergencyPause,
        storeHours,
        // Preserve
        logoURL: existing.logoURL || '',
        images: existing.images || [],
        deliveryTime: existing.deliveryTime || 0,
        deliveryFee: existing.deliveryFee || 0,
        promoText: existing.promoText || '',
        latitude: existing.latitude || 0,
        longitude: existing.longitude || 0,
        isSponsored: existing.isSponsored || false,
      });
      showToast('Store information saved!');
      onClose();
    } catch (err) {
      showToast('Failed to save: ' + err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <h2 className="text-xl font-bold text-gray-800">Store Information</h2>
          </div>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 transition">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Store Name & Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Store Name</label>
              <input type="text" value={form.restaurantName} onChange={e => updateField('restaurantName', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition"
                placeholder="Your store name" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Store Type</label>
              <select value={form.storeType} onChange={e => updateField('storeType', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition cursor-pointer">
                {STORE_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Store Address</label>
            <input type="text" value={form.storeAddress} onChange={e => updateField('storeAddress', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition"
              placeholder="123 Main St, City, State" />
          </div>

          {/* Restaurant Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Restaurant Category <span className="text-gray-400 text-xs">(for customers)</span>
            </label>
            <select value={form.category} onChange={e => updateField('category', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition cursor-pointer">
              {RESTAURANT_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>

          {/* Store Hours */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Store Hours</label>
            {/* Quick fill */}
            <div className="flex items-center gap-2 mb-3 p-3 bg-gray-50 rounded-lg flex-wrap">
              <div className="flex items-center gap-2">
                <input type="time" id="bulkOpen" defaultValue="09:00"
                  className="px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500/50" />
                <span className="text-gray-400 text-sm">to</span>
                <input type="time" id="bulkClose" defaultValue="21:00"
                  className="px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500/50" />
              </div>
              <button onClick={() => {
                const o = document.getElementById('bulkOpen').value;
                const c = document.getElementById('bulkClose').value;
                fillAllHours(o, c);
              }} className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium transition shadow-sm">
                Fill All
              </button>
              <button onClick={clearAllHours}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-1.5 rounded-lg text-sm font-medium transition">
                Clear All
              </button>
            </div>
            {/* Day grid */}
            <div className="space-y-2">
              {DAYS.map(day => (
                <div key={day} className="flex items-center gap-3">
                  <span className="w-28 text-sm font-medium text-gray-700 flex-shrink-0">{day.slice(0, 3)}</span>
                  <input type="time" value={hours[day]?.open || ''} onChange={e => updateHour(day, 'open', e.target.value)}
                    className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500/50" />
                  <span className="text-gray-400 text-sm">to</span>
                  <input type="time" value={hours[day]?.close || ''} onChange={e => updateHour(day, 'close', e.target.value)}
                    className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500/50" />
                </div>
              ))}
            </div>
          </div>

          {/* Emergency Pause */}
          <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
            <div>
              <h3 className="font-semibold text-red-800">Emergency Pause</h3>
              <p className="text-sm text-red-600">Temporarily stop accepting orders</p>
            </div>
            <button onClick={() => updateField('emergencyPause', !form.emergencyPause)}
              className={`relative w-14 h-7 rounded-full transition-colors duration-300 ${form.emergencyPause ? 'bg-red-500' : 'bg-gray-300'}`}>
              <span className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform duration-300 ${form.emergencyPause ? 'translate-x-7' : ''}`} />
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-100 px-6 py-4 flex justify-end gap-3 rounded-b-2xl">
          <button onClick={onClose} className="px-6 py-2.5 text-gray-600 hover:text-gray-800 font-medium rounded-lg transition">
            Cancel
          </button>
          <button onClick={handleSave} disabled={saving}
            className="bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-semibold py-2.5 px-6 rounded-lg transition shadow-sm hover:shadow-md flex items-center gap-2">
            {saving && <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>}
            {saving ? 'Saving...' : 'Save Store Info'}
          </button>
        </div>
      </div>
    </div>
  );
}