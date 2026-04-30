import { useState, useEffect } from 'react';
import { useApp } from './MyStore';
import * as api from './api';

export default function ItemDrawer({ itemId, onClose }) {
  const { categories, modifierGroups, showToast, loadAllData, currentCategory, openCategoryDetail, showDashboard } = useApp();

  const [form, setForm] = useState({
    name: '', categoryId: '', basePrice: '', description: '', promoText: '', imageUrl: '',
  });
  const [itemImages, setItemImages] = useState([]);
  const [selectedModifiers, setSelectedModifiers] = useState([]);
  const [availableModifiers, setAvailableModifiers] = useState([]);
  const [saving, setSaving] = useState(false);
  const [loadingItem, setLoadingItem] = useState(!!itemId);

  // Load item data if editing
  useEffect(() => {
    if (itemId) {
      setLoadingItem(true);
      api.getItems().then(allItems => {
        const item = allItems.find(i => i.id === itemId);
        if (item) {
          setForm({
            name: item.name || '',
            categoryId: item.categoryId || item.category_id || '',
            basePrice: item.basePrice || item.base_price || '',
            description: item.description || '',
            promoText: item.promoText || item.promo_text || '',
            imageUrl: '',
          });
          // Parse images
          try {
            const parsed = JSON.parse(item.imageUrl || item.image_url || '[]');
            setItemImages(Array.isArray(parsed) ? parsed : [parsed].filter(Boolean));
          } catch {
            setItemImages([item.imageUrl || item.image_url].filter(Boolean));
          }
          // Set modifier IDs
          setSelectedModifiers(item.localModifierGroupIds || []);
        }
        setLoadingItem(false);
      }).catch(() => setLoadingItem(false));
    }
  }, [itemId]);

  // Update available modifiers when category changes
  useEffect(() => {
    if (form.categoryId) {
      const cat = categories.find(c => c.id === form.categoryId);
      const catModIds = cat?.inheritedModifierGroupIds || cat?.localModifierGroupIds || [];
      const catMods = catModIds.map(id => modifierGroups.find(g => g.id === id)).filter(Boolean);
      const unassigned = modifierGroups.filter(g => !catMods.find(c => c.id === g.id));
      setAvailableModifiers([...catMods, ...unassigned]);
    } else {
      setAvailableModifiers(modifierGroups);
    }
  }, [form.categoryId, categories, modifierGroups]);

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  // Image handling
  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    for (const file of files) {
      try {
        const url = await api.uploadImageToGCS(file);
        setItemImages(prev => [...prev, url]);
        showToast('Image uploaded!');
      } catch {
        showToast('Image upload failed', 'error');
      }
    }
    e.target.value = '';
  };

  const addImageUrl = () => {
    if (form.imageUrl && !itemImages.includes(form.imageUrl)) {
      setItemImages(prev => [...prev, form.imageUrl]);
      setForm(prev => ({ ...prev, imageUrl: '' }));
    }
  };

  const removeImage = (index) => {
    setItemImages(prev => prev.filter((_, i) => i !== index));
  };

  const moveImageLeft = (index) => {
    if (index <= 0) return;
    setItemImages(prev => {
      const arr = [...prev];
      [arr[index - 1], arr[index]] = [arr[index], arr[index - 1]];
      return arr;
    });
  };

  const moveImageRight = (index) => {
    if (index >= itemImages.length - 1) return;
    setItemImages(prev => {
      const arr = [...prev];
      [arr[index], arr[index + 1]] = [arr[index + 1], arr[index]];
      return arr;
    });
  };

  const setAsMain = (index) => {
    if (index <= 0) return;
    setItemImages(prev => {
      const arr = [...prev];
      const img = arr.splice(index, 1)[0];
      arr.unshift(img);
      return arr;
    });
  };

  // Save item
  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { showToast('Item name is required', 'error'); return; }
    setSaving(true);

    try {
      const itemData = {
        name: form.name,
        description: form.description,
        promoText: form.promoText,
        basePrice: parseFloat(form.basePrice) || 0,
        categoryId: form.categoryId,
        imageUrl: itemImages.length > 0 ? JSON.stringify(itemImages) : '',
        localModifierGroupIds: selectedModifiers,
        isAvailable: true,
      };

      if (itemId) {
        // Preserve availability when editing
        const allItems = await api.getItems();
        const existing = allItems.find(i => i.id === itemId);
        if (existing) itemData.isAvailable = existing.isAvailable !== undefined ? existing.isAvailable : true;
        await api.updateItem(itemId, itemData);
        showToast('Item updated!');
      } else {
        await api.createItem(itemData);
        showToast('Item created!');
      }

      onClose();
      await loadAllData();
      if (currentCategory) await openCategoryDetail(currentCategory);
    } catch (err) {
      showToast(`Error: ${err.message}`, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/40 z-[100]" onClick={onClose} />
      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-xl bg-white z-[101] shadow-2xl overflow-y-auto animate-[slideInRight_0.3s_ease-out]">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-xl font-bold text-gray-900">{itemId ? 'Edit Item' : 'Add New Item'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition">
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {loadingItem ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <form onSubmit={handleSave} className="p-6 space-y-6">
            {/* Images — TOP */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Food Images <span className="text-gray-400 font-normal">(multiple allowed)</span></label>

              {/* Gallery */}
              {itemImages.length > 0 && (
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {itemImages.map((url, idx) => (
                    <div key={idx} className="relative group">
                      <img src={url} alt="" className="w-full h-24 object-cover rounded-lg border border-gray-200" />
                      {idx === 0 && <span className="absolute bottom-1 left-1 bg-orange-500 text-white text-[9px] px-1.5 py-0.5 rounded font-bold">MAIN</span>}
                      <div className="absolute top-1 right-1 flex gap-0.5 opacity-0 group-hover:opacity-100 transition">
                        {idx > 0 && (
                          <button type="button" onClick={() => setAsMain(idx)} className="w-6 h-6 bg-white rounded-full shadow text-xs text-orange-500 hover:bg-orange-50">⭐</button>
                        )}
                        {idx > 0 && (
                          <button type="button" onClick={() => moveImageLeft(idx)} className="w-6 h-6 bg-white rounded-full shadow text-xs hover:bg-gray-100">◀</button>
                        )}
                        {idx < itemImages.length - 1 && (
                          <button type="button" onClick={() => moveImageRight(idx)} className="w-6 h-6 bg-white rounded-full shadow text-xs hover:bg-gray-100">▶</button>
                        )}
                        <button type="button" onClick={() => removeImage(idx)} className="w-6 h-6 bg-white rounded-full shadow text-xs text-red-500 hover:bg-red-50">✕</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Upload */}
              <label className="flex items-center justify-center gap-2 p-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-orange-400 cursor-pointer transition">
                <input type="file" accept="image/*" multiple className="hidden" onChange={handleFileUpload} />
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                <span className="text-sm text-gray-500 font-medium">Upload images</span>
              </label>

              {/* URL input */}
              <div className="flex gap-2 mt-2">
                <input type="url" value={form.imageUrl} onChange={e => handleChange('imageUrl', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Paste image URL..." />
                <button type="button" onClick={addImageUrl} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition">Add</button>
              </div>
            </div>

            {/* Item Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Item Name *</label>
              <input type="text" value={form.name} onChange={e => handleChange('name', e.target.value)} required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="e.g., Chicken Sandwich" />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Category</label>
              <select value={form.categoryId} onChange={e => handleChange('categoryId', e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white">
                <option value="">Select category...</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name || cat.title}</option>
                ))}
              </select>
            </div>

            {/* Price */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Price ($)</label>
              <input type="number" step="0.01" value={form.basePrice} onChange={e => handleChange('basePrice', e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="0.00" />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
              <textarea value={form.description} onChange={e => handleChange('description', e.target.value)} rows={3}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                placeholder="Describe this item..." />
            </div>

            {/* Promo Text */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Promo Text</label>
              <input type="text" value={form.promoText} onChange={e => handleChange('promoText', e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="e.g., Best Seller, New!" />
            </div>

            {/* Modifier Groups */}
            {availableModifiers.length > 0 && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Modifier Groups</label>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {availableModifiers.map(group => (
                    <label key={group.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition">
                      <input type="checkbox" checked={selectedModifiers.includes(group.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedModifiers(prev => [...prev, group.id]);
                          } else {
                            setSelectedModifiers(prev => prev.filter(id => id !== group.id));
                          }
                        }}
                        className="w-4 h-4 text-orange-500 rounded border-gray-300 focus:ring-orange-500" />
                      <div className="flex-1">
                        <span className="text-sm font-medium text-gray-900">{group.name}</span>
                        <span className="text-xs text-gray-500 ml-2">({group.options?.length || 0} options)</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Submit */}
            <div className="sticky bottom-0 bg-white pt-4 pb-2 border-t border-gray-100">
              <button type="submit" disabled={saving}
                className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-bold py-3 px-6 rounded-lg transition shadow-sm hover:shadow-md flex items-center justify-center gap-2">
                {saving ? (
                  <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />Saving...</>
                ) : (
                  itemId ? 'Update Item' : 'Create Item'
                )}
              </button>
            </div>
          </form>
        )}
      </div>

      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </>
  );
}