import { useState, useEffect } from 'react';
import { useApp } from './MyStore';
import * as api from './api';

export default function CategoryModal({ categoryId, onClose }) {
  const { modifierGroups, showToast, loadAllData } = useApp();

  const [form, setForm] = useState({ name: '', description: '', icon: '🍽️', color: '#f97316' });
  const [selectedModifiers, setSelectedModifiers] = useState([]);
  const [foodCategories, setFoodCategories] = useState([]);
  const [saving, setSaving] = useState(false);
  const [loadingCat, setLoadingCat] = useState(!!categoryId);

  // Load food categories for browser
  useEffect(() => {
    api.getFoodCategories().then(setFoodCategories).catch(() => {});
  }, []);

  // Load category data if editing
  useEffect(() => {
    if (categoryId) {
      setLoadingCat(true);
      api.getCategories().then(cats => {
        const cat = cats.find(c => c.id === categoryId);
        if (cat) {
          setForm({
            name: cat.name || cat.title || '',
            description: cat.description || '',
            icon: cat.icon || '🍽️',
            color: cat.color || '#f97316',
          });
          setSelectedModifiers(cat.inheritedModifierGroupIds || cat.localModifierGroupIds || cat.modifier_group_ids || cat.modifierGroupIds || []);
        }
        setLoadingCat(false);
      }).catch(() => setLoadingCat(false));
    }
  }, [categoryId]);

  const selectFoodCategory = (name, icon) => {
    setForm(prev => ({ ...prev, name, icon: icon || '🍽️' }));
  };

  const handleSave = async () => {
    if (!form.name.trim()) { showToast('Category name is required', 'error'); return; }
    setSaving(true);
    try {
      const catData = {
        name: form.name,
        description: form.description,
        icon: form.icon,
        color: form.color,
        modifier_group_ids: selectedModifiers,
      };

      if (categoryId) {
        await api.updateCategory(categoryId, catData);
        showToast('Category updated!');
      } else {
        await api.createCategory(catData);
        showToast('Category created!');
      }
      onClose();
      await loadAllData();
    } catch (err) {
      showToast(`Error: ${err.message}`, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this category? Items in it will become uncategorized.')) return;
    try {
      await api.deleteCategory(categoryId);
      showToast('Category deleted!');
      onClose();
      await loadAllData();
    } catch (err) {
      showToast(`Delete failed: ${err.message}`, 'error');
    }
  };

  const iconOptions = ['🍽️', '🍕', '🍔', '🌮', '🍣', '🥗', '🍝', '🥩', '🍰', '☕', '🥤', '🍜', '🥪', '🍗', '🧁', '🍦'];

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-[100]" onClick={onClose} />
      <div className="fixed inset-0 z-[101] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
            <h2 className="text-xl font-bold text-gray-900">{categoryId ? 'Edit Category' : 'Add Category'}</h2>
            <div className="flex items-center gap-1">
              {categoryId && (
                <button onClick={handleDelete} className="p-2 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-full transition" title="Delete category">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              )}
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition">
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {loadingCat ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="p-6 space-y-5">
              {/* Food Category Browser (only when creating) */}
              {!categoryId && foodCategories.length > 0 && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Quick Pick</label>
                  <div className="grid grid-cols-4 gap-2">
                    {foodCategories.map(cat => (
                      <button key={cat.id || cat.name} type="button" onClick={() => selectFoodCategory(cat.name, cat.icon)}
                        className="flex flex-col items-center gap-1 p-2 rounded-lg border border-gray-200 hover:border-orange-400 hover:bg-orange-50 transition cursor-pointer text-center">
                        <span className="text-xl">{cat.icon || '🍽️'}</span>
                        <span className="text-[11px] font-medium text-gray-700 leading-tight">{cat.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Category Name *</label>
                <input type="text" value={form.name} onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="e.g., Burgers" />
              </div>

              {/* Icon */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Icon</label>
                <div className="flex flex-wrap gap-2">
                  {iconOptions.map(icon => (
                    <button key={icon} type="button" onClick={() => setForm(prev => ({ ...prev, icon }))}
                      className={`w-10 h-10 rounded-lg border-2 flex items-center justify-center text-xl transition ${
                        form.icon === icon ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-orange-300'
                      }`}>
                      {icon}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Color</label>
                <div className="flex items-center gap-3">
                  <input type="color" value={form.color} onChange={e => setForm(prev => ({ ...prev, color: e.target.value }))}
                    className="w-10 h-10 rounded-lg border border-gray-300 cursor-pointer" />
                  <input type="text" value={form.color} onChange={e => setForm(prev => ({ ...prev, color: e.target.value }))}
                    className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm" />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
                <textarea value={form.description} onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))} rows={2}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                  placeholder="Optional category description..." />
              </div>

              {/* Modifier Groups */}
              {modifierGroups.length > 0 && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Modifier Groups</label>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {modifierGroups.map(group => (
                      <label key={group.id} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition">
                        <input type="checkbox" checked={selectedModifiers.includes(group.id)}
                          onChange={(e) => {
                            if (e.target.checked) setSelectedModifiers(prev => [...prev, group.id]);
                            else setSelectedModifiers(prev => prev.filter(id => id !== group.id));
                          }}
                          className="w-4 h-4 text-orange-500 rounded border-gray-300 focus:ring-orange-500" />
                        <span className="text-sm font-medium text-gray-900">{group.name}</span>
                        <span className="text-xs text-gray-400 ml-auto">{group.options?.length || 0} opts</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button onClick={onClose} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-6 rounded-lg transition">
                  Cancel
                </button>
                <button onClick={handleSave} disabled={saving}
                  className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-bold py-3 px-6 rounded-lg transition shadow-sm hover:shadow-md flex items-center justify-center gap-2">
                  {saving ? (
                    <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />Saving...</>
                  ) : (
                    categoryId ? 'Update Category' : 'Create Category'
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}