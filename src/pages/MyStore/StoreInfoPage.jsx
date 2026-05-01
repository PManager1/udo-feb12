import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import * as api from './api';
import { MAPS_API } from '../../config/api';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const STORE_TYPES = [
  { value: '', label: 'Select type...' },
  { value: 'cafe', label: '☕ Cafe' },
  { value: 'restaurant', label: '🍽️ Restaurant' },
  { value: 'grocery', label: '🛒 Grocery / Convenience' },
  { value: 'flowers', label: '💐 Flower Shop / Boutique' },
];

export default function StoreInfoPage() {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  // Address autocomplete state
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isFetchingSuggestions, setIsFetchingSuggestions] = useState(false);
  const addressRef = useRef(null);
  const suggestionsRef = useRef(null);
  const debounceTimer = useRef(null);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  }, []);

  // Click outside to close suggestions dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        suggestionsRef.current && !suggestionsRef.current.contains(e.target) &&
        addressRef.current && !addressRef.current.contains(e.target)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch autocomplete suggestions from backend
  const fetchSuggestions = useCallback(async (input) => {
    if (!input || input.length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    setIsFetchingSuggestions(true);
    try {
      const res = await fetch(MAPS_API.autocomplete, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input }),
      });
      const data = await res.json();
      const list = data.suggestions || [];
      setSuggestions(list);
      setShowSuggestions(list.length > 0);
    } catch (err) {
      console.error('Autocomplete error:', err);
      setSuggestions([]);
    } finally {
      setIsFetchingSuggestions(false);
    }
  }, []);

  // Geocode the selected address to get lat/lng
  const geocodeAddress = useCallback(async (address) => {
    try {
      const res = await fetch(MAPS_API.geocoordinates, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address }),
      });
      const data = await res.json();
      if (data.coordinates) {
        return { lat: data.coordinates.lat, lng: data.coordinates.lng };
      }
    } catch (err) {
      console.error('Geocode error:', err);
    }
    return null;
  }, []);

  const handleAddressChange = (value) => {
    updateField('storeAddress', value);
    // Debounce autocomplete: wait 300ms after user stops typing
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      fetchSuggestions(value);
    }, 300);
  };

  const handleSuggestionSelect = async (suggestion) => {
    updateField('storeAddress', suggestion.description);
    setShowSuggestions(false);
    setSuggestions([]);
    // Geocode the selected address
    const coords = await geocodeAddress(suggestion.description);
    if (coords) {
      // Store lat/lng for saving later
      setForm(prev => ({ ...prev, _lat: coords.lat, _lng: coords.lng }));
      showToast('Address selected with coordinates', 'success');
    }
  };

  const [form, setForm] = useState({
    restaurantName: '',
    storeType: '',
    storeAddress: '',
    emergencyPause: false,
  });
  const [hours, setHours] = useState(() => {
    const h = {};
    DAYS.forEach(d => { h[d] = { open: '09:00', close: '21:00', closed: false }; });
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
          emergencyPause: data.emergencyPause || false,
        });
        // Parse hours
        if (data.storeHours && typeof data.storeHours === 'object') {
          const parsed = {};
          DAYS.forEach(d => {
            const val = data.storeHours[d];
            if (val && val === 'closed') {
              parsed[d] = { open: '', close: '', closed: true };
            } else if (val && val.includes('-')) {
              const [o, c] = val.split('-');
              parsed[d] = { open: o, close: c, closed: false };
            } else {
              parsed[d] = { open: '09:00', close: '21:00', closed: false };
            }
          });
          setHours(parsed);
        } else if (data.hours && typeof data.hours === 'object') {
          const parsed = {};
          DAYS.forEach(d => {
            const h = data.hours[d];
            parsed[d] = h ? { open: h.open || '09:00', close: h.close || '21:00', closed: h.closed || false } : { open: '09:00', close: '21:00', closed: false };
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
      const storeHours = {};
      DAYS.forEach(d => {
        const h = hours[d];
        if (h?.closed) {
          storeHours[d] = 'closed';
        } else if (h && h.open && h.close) {
          storeHours[d] = `${h.open}-${h.close}`;
        }
      });

      let existing = {};
      try {
        const raw = await api.getProfile();
        existing = raw.store || raw || {};
      } catch {}

      await api.updateProfile({
        restaurantName: form.restaurantName,
        storeType: form.storeType,
        storeAddress: form.storeAddress,
        emergencyPause: form.emergencyPause,
        storeHours,
        logoURL: existing.logoURL || '',
        images: existing.images || [],
        deliveryTime: existing.deliveryTime || 0,
        deliveryFee: existing.deliveryFee || 0,
        promoText: existing.promoText || '',
        latitude: form._lat || existing.latitude || 0,
        longitude: form._lng || existing.longitude || 0,
        isSponsored: existing.isSponsored || false,
      });
      showToast('Store information saved!');
      navigate('/mystore');
    } catch (err) {
      showToast('Failed to save: ' + err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f9f7f5]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/mystore')} className="p-2 text-gray-500 hover:text-orange-500 hover:bg-gray-100 rounded-lg transition">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                Store Information
              </h1>
              <p className="text-sm text-gray-500 mt-0.5">Manage your store details and hours</p>
            </div>
          </div>
          <button onClick={handleSave} disabled={saving}
            className="bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-semibold py-2.5 px-8 rounded-full transition shadow-sm hover:shadow-md flex items-center gap-2 text-lg">
            {saving && <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>}
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </header>

      {/* Form */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Basic Info Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Basic Details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Store Name</label>
              <input type="text" value={form.restaurantName} onChange={e => updateField('restaurantName', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl text-base focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition"
                placeholder="Your store name" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Store Type</label>
              <select value={form.storeType} onChange={e => updateField('storeType', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl text-base focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition cursor-pointer">
                {STORE_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
          </div>

          <div className="mt-6 relative">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Store Address</label>
            <div className="relative">
              <input ref={addressRef} type="text" value={form.storeAddress}
                onChange={e => handleAddressChange(e.target.value)}
                onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true); }}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl text-base focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition pr-10"
                placeholder="Start typing address..." autoComplete="off" />
              {isFetchingSuggestions && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <svg className="w-5 h-5 text-orange-500 animate-spin" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                </div>
              )}
            </div>
            {/* Suggestions dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div ref={suggestionsRef}
                className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                {suggestions.map((s, i) => (
                  <button key={s.placeId || i} type="button"
                    onClick={() => handleSuggestionSelect(s)}
                    className="w-full text-left px-4 py-3 hover:bg-orange-50 border-b border-gray-50 last:border-0 transition flex items-start gap-3">
                    <svg className="w-5 h-5 text-orange-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                    </svg>
                    <span className="text-sm text-gray-700">{s.description}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Store Hours Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Store Hours</h2>

          {/* Quick fill bar */}
          <div className="flex items-center gap-3 mb-6 p-4 bg-gray-50 rounded-xl flex-wrap">
            <span className="text-sm font-medium text-gray-600">Quick Fill:</span>
            <input type="time" id="bulkOpen" defaultValue="09:00"
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500/50" />
            <span className="text-gray-400 text-sm">to</span>
            <input type="time" id="bulkClose" defaultValue="21:00"
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500/50" />
            <button onClick={() => {
              const o = document.getElementById('bulkOpen').value;
              const c = document.getElementById('bulkClose').value;
              fillAllHours(o, c);
            }} className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2 rounded-lg text-sm font-medium transition shadow-sm">
              Apply to All Days
            </button>
            <button onClick={clearAllHours}
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-5 py-2 rounded-lg text-sm font-medium transition">
              Clear All
            </button>
          </div>

          {/* Day grid */}
          <div className="space-y-4">
            {DAYS.map(day => {
              const isClosed = hours[day]?.closed || false;
              return (
              <div key={day} className="flex items-center gap-4 py-2">
                <span className="w-28 text-base font-semibold text-gray-700 flex-shrink-0">{day}</span>
                <input type="time" value={hours[day]?.open || ''} onChange={e => updateHour(day, 'open', e.target.value)} disabled={isClosed}
                  className={`flex-1 max-w-[180px] px-4 py-2.5 border border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-orange-500/50 ${isClosed ? 'opacity-30 bg-gray-50' : ''}`} />
                <span className="text-gray-400 text-sm">to</span>
                <input type="time" value={hours[day]?.close || ''} onChange={e => updateHour(day, 'close', e.target.value)} disabled={isClosed}
                  className={`flex-1 max-w-[180px] px-4 py-2.5 border border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-orange-500/50 ${isClosed ? 'opacity-30 bg-gray-50' : ''}`} />
                {/* Toggle: checked = open, unchecked = closed */}
                <label className="flex items-center gap-2 cursor-pointer select-none" title={isClosed ? 'Turn on' : 'Turn off'}>
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={!isClosed}
                      onChange={() => updateHour(day, 'closed', !isClosed)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-red-400 peer-checked:bg-green-500 rounded-full transition-colors"></div>
                    <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform peer-checked:translate-x-4"></div>
                  </div>
                  <span className={`text-xs font-semibold ${isClosed ? 'text-red-500' : 'text-green-600'}`}>
                    {isClosed ? 'Closed' : 'Open'}
                  </span>
                </label>
              </div>
              );
            })}
          </div>
        </div>

        {/* Emergency Pause Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-red-800 flex items-center gap-2">
                <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                Emergency Pause
              </h2>
              <p className="text-sm text-red-600 mt-1">Temporarily stop accepting all orders</p>
            </div>
            <button onClick={() => updateField('emergencyPause', !form.emergencyPause)}
              className={`relative w-16 h-8 rounded-full transition-colors duration-300 ${form.emergencyPause ? 'bg-red-500' : 'bg-gray-300'}`}>
              <span className={`absolute top-0.5 left-0.5 w-7 h-7 bg-white rounded-full shadow transition-transform duration-300 ${form.emergencyPause ? 'translate-x-8' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Toast */}
      {toast.show && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
}

// Simple inline Toast
function Toast({ message, type }) {
  const bg = type === 'error' ? 'bg-red-500' : 'bg-green-500';
  return (
    <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 ${bg} text-white px-6 py-3 rounded-full shadow-lg z-[100] font-medium text-sm animate-bounce`}>
      {message}
    </div>
  );
}
