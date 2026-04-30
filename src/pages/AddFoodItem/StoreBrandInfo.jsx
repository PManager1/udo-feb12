import { useState, useEffect } from 'react';
import { useApp } from './AddFoodItem';
import * as api from './api';

export default function StoreBrandInfo() {
  const { showToast } = useApp();
  const [expanded, setExpanded] = useState(false);
  const [brand, setBrand] = useState({ logo_url: '', banner_image_url: '', rating: 0, review_count: 0 });
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    api.getProfile().then(profile => {
      const p = profile.store || profile || {};
      setBrand({
        logo_url: p.logoURL || p.logo || '',
        banner_image_url: (p.images && p.images[0]) || '',
        rating: p.rating || 0,
        review_count: parseInt(p.reviewCount) || 0,
      });
      setLoaded(true);
    }).catch(() => setLoaded(true));
  }, []);

  const saveBrandInfo = async () => {
    try {
      await api.updateProfile({
        logoURL: brand.logo_url,
        images: brand.banner_image_url ? [brand.banner_image_url] : [],
        rating: brand.rating,
        reviewCount: brand.review_count,
      });
      showToast('Brand info saved!');
      setExpanded(false);
    } catch {
      showToast('Failed to save brand info', 'error');
    }
  };

  const handleFileUpload = async (type, e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const url = await api.uploadImageToGCS(file);
      setBrand(prev => ({ ...prev, [type === 'logo' ? 'logo_url' : 'banner_image_url']: url }));
      showToast('Image uploaded!');
    } catch {
      showToast('Image upload failed', 'error');
    }
  };

  const hasSome = brand.logo_url || brand.banner_image_url;

  return (
    <div className="mb-12 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow">
      {/* Summary */}
      <div className="p-5 cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full border-2 border-gray-200 flex items-center justify-center bg-gray-50 overflow-hidden flex-shrink-0">
              {brand.logo_url ? (
                <img src={brand.logo_url} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                <svg className="w-7 h-7 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              )}
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Store Brand Info</h3>
              <div className="flex items-center gap-2 mt-1">
                {brand.rating > 0 && (
                  <span className="flex items-center gap-1 text-sm text-gray-600">
                    <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                    {brand.rating.toFixed(1)}
                  </span>
                )}
                {brand.review_count > 0 && (
                  <span className="text-sm text-gray-400">({brand.review_count})</span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${hasSome ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
              {hasSome ? 'Set' : 'Not set'}
            </span>
            <svg className={`w-5 h-5 text-gray-400 transition-transform ${expanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {/* Expanded Form */}
      {expanded && (
        <div className="border-t border-gray-100 p-6 space-y-5">
          {/* Logo */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Logo Image</label>
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-full border-2 border-gray-200 flex items-center justify-center bg-gray-50 overflow-hidden flex-shrink-0">
                {brand.logo_url ? (
                  <img src={brand.logo_url} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  <svg className="w-7 h-7 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                )}
              </div>
              <div className="flex-1 flex gap-2">
                <label className="flex-1 cursor-pointer">
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload('logo', e)} />
                  <div className="flex flex-col items-center justify-center p-2 bg-white border border-gray-200 rounded-lg hover:border-orange-400 transition">
                    <svg className="w-5 h-5 text-orange-500 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>
                    <span className="text-xs font-medium text-gray-600">Upload</span>
                  </div>
                </label>
              </div>
            </div>
            <input
              type="url"
              value={brand.logo_url}
              onChange={(e) => setBrand(prev => ({ ...prev, logo_url: e.target.value }))}
              className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
              placeholder="https://example.com/logo.png"
            />
          </div>

          {/* Banner */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Banner Image</label>
            <div className="flex gap-2 mb-2">
              <label className="flex-1 cursor-pointer">
                <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload('banner', e)} />
                <div className="flex flex-col items-center justify-center p-2 bg-white border border-gray-200 rounded-lg hover:border-orange-400 transition">
                  <svg className="w-5 h-5 text-orange-500 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>
                  <span className="text-xs font-medium text-gray-600">Upload</span>
                </div>
              </label>
            </div>
            {brand.banner_image_url && (
              <div className="w-full h-32 rounded-lg border border-gray-200 overflow-hidden">
                <img src={brand.banner_image_url} alt="Banner" className="w-full h-full object-cover" />
              </div>
            )}
            <input
              type="url"
              value={brand.banner_image_url}
              onChange={(e) => setBrand(prev => ({ ...prev, banner_image_url: e.target.value }))}
              className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
              placeholder="https://example.com/banner.png"
            />
          </div>

          {/* Rating & Review Count */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Rating</label>
              <input type="number" step="0.1" min="0" max="5" value={brand.rating || ''} onChange={(e) => setBrand(prev => ({ ...prev, rating: parseFloat(e.target.value) || 0 }))}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm" placeholder="3.8" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Review Count</label>
              <input type="number" min="0" value={brand.review_count || ''} onChange={(e) => setBrand(prev => ({ ...prev, review_count: parseInt(e.target.value) || 0 }))}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm" placeholder="e.g., 7000" />
            </div>
          </div>

          <button onClick={saveBrandInfo} className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-lg transition shadow-sm hover:shadow-md">
            Save Brand Info
          </button>
        </div>
      )}
    </div>
  );
}