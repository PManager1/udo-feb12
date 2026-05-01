import { useState, useEffect } from 'react';
import { useApp } from './MyStore';
import * as api from './api';

export default function ModifierGroupModal({ groupId, onClose }) {
  const { showToast, loadAllData } = useApp();

  const [form, setForm] = useState({ name: '', minSelection: 0, maxSelection: 1, isRequired: false });
  const [options, setOptions] = useState([]);
  const [saving, setSaving] = useState(false);
  const [loadingGroup, setLoadingGroup] = useState(!!groupId);
  const [advanced, setAdvanced] = useState(false);

  // Load group data if editing
  useEffect(() => {
    if (groupId) {
      setLoadingGroup(true);
      api.getModifierGroups().then(groups => {
        const group = groups.find(g => g.id === groupId);
        if (group) {
          setForm({
            name: group.name || '',
            minSelection: group.minSelection || 0,
            maxSelection: group.maxSelection || 1,
            isRequired: group.isRequired || false,
          });
          setOptions(group.options || []);
          setAdvanced((group.minSelection !== 0 && group.minSelection !== 1) || (group.maxSelection !== 1 && group.maxSelection !== 5));
        }
        setLoadingGroup(false);
      }).catch(() => setLoadingGroup(false));
    } else {
      setOptions([{ id: generateOptId(), name: '', extraPrice: 0, isAvailable: true, isDefault: false }]);
    }
  }, [groupId]);

  function generateOptId() {
    return 'opt_' + crypto.randomUUID().replace(/-/g, '').substring(0, 12);
  }

  const setSelectionType = (type) => {
    if (type === 'single') {
      setForm(prev => ({ ...prev, minSelection: 1, maxSelection: 1, isRequired: true }));
    } else {
      setForm(prev => ({ ...prev, minSelection: 0, maxSelection: 5, isRequired: false }));
    }
  };

  const addOption = () => {
    setOptions(prev => [...prev, { id: generateOptId(), name: '', extraPrice: 0, isAvailable: true, isDefault: false }]);
  };

  const removeOption = (index) => {
    setOptions(prev => prev.filter((_, i) => i !== index));
  };

  const updateOption = (index, field, value) => {
    setOptions(prev => {
      const arr = [...prev];
      arr[index] = { ...arr[index], [field]: value };
      return arr;
    });
  };

  const handleSave = async () => {
    if (!form.name.trim()) { showToast('Group name is required', 'error'); return; }
    const validOptions = options.filter(o => o.name.trim());
    if (validOptions.length === 0) { showToast('Add at least one option', 'error'); return; }

    setSaving(true);
    try {
      const groupData = {
        name: form.name,
        description: '',
        minSelection: parseInt(form.minSelection) || 0,
        maxSelection: parseInt(form.maxSelection) || 1,
        isRequired: form.isRequired,
        options: validOptions.map(o => ({
          ...o,
          extraPrice: parseFloat(o.extraPrice) || 0,
        })),
      };

      if (groupId) {
        await api.updateModifierGroup(groupId, groupData);
        showToast('Modifier group updated!');
      } else {
        await api.createModifierGroup(groupData);
        showToast('Modifier group created!');
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
    if (!confirm('Delete this modifier group? It will be removed from all items.')) return;
    try {
      await api.deleteModifierGroup(groupId);
      showToast('Modifier group deleted!');
      onClose();
      await loadAllData();
    } catch (err) {
      showToast(`Delete failed: ${err.message}`, 'error');
    }
  };

  const isSingle = form.minSelection === 1 && form.maxSelection === 1;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-[200]" onClick={onClose} />
      <div className="fixed inset-0 z-[201] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
            <h2 className="text-xl font-bold text-gray-900">{groupId ? 'Edit Modifier Group' : 'Add Modifier Group'}</h2>
            <div className="flex items-center gap-1">
              {groupId && (
                <button onClick={handleDelete} className="p-2 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-full transition" title="Delete modifier group">
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

          {loadingGroup ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="p-6 space-y-5">
              {/* Group Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Group Name *</label>
                <input type="text" value={form.name} onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="e.g., Size, Side, Drink" />
              </div>

              {/* Selection Type */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Selection Type</label>
                <div className="flex gap-3">
                  <button type="button" onClick={() => setSelectionType('single')}
                    className={`flex-1 py-2.5 px-4 rounded-lg border-2 font-semibold text-sm text-center transition ${
                      isSingle ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-gray-200 bg-white text-gray-600 hover:border-orange-300'
                    }`}>
                    Single Choice
                  </button>
                  <button type="button" onClick={() => setSelectionType('multiple')}
                    className={`flex-1 py-2.5 px-4 rounded-lg border-2 font-semibold text-sm text-center transition ${
                      !isSingle ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-gray-200 bg-white text-gray-600 hover:border-orange-300'
                    }`}>
                    Multiple Choice
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {isSingle ? 'Customer picks one option. Shows as radio buttons.' : 'Customer can pick multiple options. Shows as checkboxes.'}
                </p>
              </div>

              {/* Advanced settings */}
              <div>
                <button type="button" onClick={() => setAdvanced(!advanced)} className="text-sm text-orange-500 hover:text-orange-600 font-medium flex items-center gap-1">
                  <svg className={`w-4 h-4 transition-transform ${advanced ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  Advanced settings
                </button>
                {advanced && (
                  <div className="mt-3 grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Min</label>
                      <input type="number" min="0" value={form.minSelection} onChange={e => setForm(prev => ({ ...prev, minSelection: parseInt(e.target.value) || 0 }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Max</label>
                      <input type="number" min="1" value={form.maxSelection} onChange={e => setForm(prev => ({ ...prev, maxSelection: parseInt(e.target.value) || 1 }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
                    </div>
                    <div className="flex items-end">
                      <label className="flex items-center gap-2 cursor-pointer pb-2">
                        <input type="checkbox" checked={form.isRequired} onChange={e => setForm(prev => ({ ...prev, isRequired: e.target.checked }))}
                          className="w-4 h-4 text-orange-500 rounded border-gray-300 focus:ring-orange-500" />
                        <span className="text-xs font-semibold text-gray-600">Required</span>
                      </label>
                    </div>
                  </div>
                )}
              </div>

              {/* Options */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-semibold text-gray-700">Options</label>
                  <button type="button" onClick={addOption} className="text-sm text-orange-500 hover:text-orange-600 font-medium flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    Add Option
                  </button>
                </div>
                <div className="space-y-2">
                  {options.map((opt, idx) => (
                    <div key={opt.id || idx} className="flex items-center gap-2">
                      <input type="text" value={opt.name} onChange={e => updateOption(idx, 'name', e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                        placeholder="Option name" />
                      <div className="relative w-24">
                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                        <input type="number" step="0.01" value={opt.extraPrice || ''} onChange={e => updateOption(idx, 'extraPrice', e.target.value)}
                          className="w-full pl-6 pr-2 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                          placeholder="0.00" />
                      </div>
                      <button type="button" onClick={() => removeOption(idx)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>

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
                    groupId ? 'Update Group' : 'Create Group'
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