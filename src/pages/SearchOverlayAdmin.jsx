import { useState, useEffect } from 'react'
import { SEARCH_OVERLAY_API } from '../config/api'

export default function SearchOverlayAdmin() {
  const [allItems, setAllItems] = useState([])
  const [currentFilter, setCurrentFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [formMode, setFormMode] = useState('add')
  const [formOriginalId, setFormOriginalId] = useState('')
  const [toast, setToast] = useState(null)
  const [form, setForm] = useState({ id: '', label: '', href: '', image: '', section: 'recent_searches', sort_order: 1 })

  useEffect(() => { loadItems() }, [])

  function showToastMsg(message, type = 'success') {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  async function loadItems() {
    setLoading(true)
    try {
      const res = await fetch(SEARCH_OVERLAY_API.adminItems)
      const json = await res.json()
      setAllItems(json.items || [])
    } catch { showToastMsg('Failed to load items', 'error') }
    finally { setLoading(false) }
  }

  function getFiltered() {
    let filtered = currentFilter === 'all' ? [...allItems] : allItems.filter(i => i.section === currentFilter)
    filtered.sort((a, b) => a.section !== b.section ? a.section.localeCompare(b.section) : a.sort_order - b.sort_order)
    return filtered
  }

  function filterSection(section) { setCurrentFilter(section) }

  async function toggleItem(id, isActive) {
    try {
      const res = await fetch(`${SEARCH_OVERLAY_API.adminItems}/${id}/toggle`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: isActive })
      })
      const json = await res.json()
      if (json.success) {
        setAllItems(prev => prev.map(i => i.id === id ? { ...i, is_active: isActive } : i))
        showToastMsg(`Item ${isActive ? 'enabled' : 'disabled'}`)
      } else { showToastMsg(json.message || 'Failed to toggle', 'error'); loadItems() }
    } catch { showToastMsg('Failed to toggle item', 'error'); loadItems() }
  }

  function showAddModal() {
    setFormMode('add'); setFormOriginalId('')
    setForm({ id: '', label: '', href: '', image: '', section: 'recent_searches', sort_order: 1 })
    setShowModal(true)
  }

  function editItem(id) {
    const item = allItems.find(i => i.id === id)
    if (!item) return
    setFormMode('edit'); setFormOriginalId(id)
    setForm({ id: item.id, label: item.label, href: item.href, image: item.image, section: item.section, sort_order: item.sort_order })
    setShowModal(true)
  }

  async function handleFormSubmit(e) {
    e.preventDefault()
    const payload = { ...form, sort_order: parseInt(form.sort_order) || 1, is_active: true }
    try {
      let url, method
      if (formMode === 'add') { url = SEARCH_OVERLAY_API.adminItems; method = 'POST' }
      else {
        url = `${SEARCH_OVERLAY_API.adminItems}/${formOriginalId}`; method = 'PUT'
        const existing = allItems.find(i => i.id === formOriginalId)
        if (existing) payload.is_active = existing.is_active
      }
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      const json = await res.json()
      if (json.success || res.ok) { showToastMsg(formMode === 'add' ? 'Item created!' : 'Item updated!'); setShowModal(false); loadItems() }
      else showToastMsg(json.message || 'Failed to save', 'error')
    } catch { showToastMsg('Failed to save item', 'error') }
  }

  async function deleteItem(id) {
    if (!confirm('Delete this item? This cannot be undone.')) return
    try {
      const res = await fetch(`${SEARCH_OVERLAY_API.adminItems}/${id}`, { method: 'DELETE' })
      const json = await res.json()
      if (json.success) { showToastMsg('Item deleted'); loadItems() }
      else showToastMsg(json.message || 'Failed to delete', 'error')
    } catch { showToastMsg('Failed to delete item', 'error') }
  }

  const filtered = getFiltered()
  const sectionConfig = {
    recent_searches: { class: 'bg-blue-100 text-blue-800', label: 'Recent' },
    popular_on_udo: { class: 'bg-amber-100 text-amber-800', label: 'Popular' },
    trending_now: { class: 'bg-purple-100 text-purple-800', label: 'Trending' }
  }
  const filters = ['all', 'recent_searches', 'popular_on_udo', 'trending_now']

  return (
    <>
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Search Overlay Admin</h1>
            <p className="text-sm text-gray-500 mt-1">Toggle items on/off to control what appears in the search overlay</p>
          </div>
          <div className="flex gap-3">
            <button onClick={loadItems} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 transition">↻ Refresh</button>
            <button onClick={showAddModal} className="px-4 py-2 bg-orange-500 hover:bg-orange-600 rounded-lg text-sm font-medium text-white transition">+ Add Item</button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 mt-6">
        <div className="flex gap-2">
          {filters.map(f => (
            <button key={f} onClick={() => filterSection(f)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${currentFilter === f ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
              {f === 'all' ? 'All' : f === 'recent_searches' ? 'Recent Searches' : f === 'popular_on_udo' ? 'Popular on UDO' : 'Trending Now'}
            </button>
          ))}
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-6 py-6">
        {loading && <div className="text-center py-12 text-gray-400">Loading items...</div>}
        {!loading && filtered.length === 0 && <div className="text-center py-12 text-gray-400">No items found.</div>}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(item => {
            const sec = sectionConfig[item.section] || { class: 'bg-gray-100 text-gray-800', label: item.section }
            return (
              <div key={item.id} className={`bg-white rounded-xl border border-gray-200 p-4 transition-all hover:shadow-md ${!item.is_active ? 'opacity-50' : ''}`}>
                <div className="flex items-start gap-3">
                  <img src={item.image} alt={item.label} className="w-16 h-16 rounded-lg object-cover flex-shrink-0 bg-gray-100"
                    onError={e => e.target.src="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='64' height='64'><rect fill='%23f3f4f6' width='64' height='64'/><text x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%239ca3af' font-size='12'>No img</text></svg>"} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900 truncate">{item.label}</h3>
                      <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full ${sec.class}`}>{sec.label}</span>
                    </div>
                    <p className="text-xs text-gray-500 truncate">{item.href}</p>
                    <p className="text-xs text-gray-400 mt-1">Order: {item.sort_order} · ID: {item.id}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                  <div className="flex items-center gap-2">
                    <label className="relative w-12 h-[26px] cursor-pointer">
                      <input type="checkbox" checked={item.is_active} onChange={e => toggleItem(item.id, e.target.checked)}
                        className="sr-only peer" />
                      <span className="absolute inset-0 bg-gray-300 rounded-full transition peer-checked:bg-green-500"></span>
                      <span className="absolute left-[3px] bottom-[3px] w-5 h-5 bg-white rounded-full transition peer-checked:translate-x-[22px]"></span>
                    </label>
                    <span className={`text-xs font-medium ${item.is_active ? 'text-green-600' : 'text-gray-400'}`}>
                      {item.is_active ? 'Active' : 'Disabled'}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => editItem(item.id)} className="p-1.5 hover:bg-gray-100 rounded-lg transition" title="Edit">
                      <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                    </button>
                    <button onClick={() => deleteItem(item.id)} className="p-1.5 hover:bg-red-50 rounded-lg transition" title="Delete">
                      <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </main>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={e => { if (e.target === e.currentTarget) setShowModal(false) }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">{formMode === 'add' ? 'Add New Item' : 'Edit Item'}</h2>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-gray-100 rounded-full">
                <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ID</label>
                <input type="text" required value={form.id} disabled={formMode === 'edit'} onChange={e => setForm(f => ({ ...f, id: e.target.value }))}
                  placeholder="e.g. recent-plumbing" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm disabled:bg-gray-100" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Label</label>
                <input type="text" required value={form.label} onChange={e => setForm(f => ({ ...f, label: e.target.value }))}
                  placeholder="e.g. Plumbing" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Link (href)</label>
                <input type="text" required value={form.href} onChange={e => setForm(f => ({ ...f, href: e.target.value }))}
                  placeholder="e.g. profiles-list/" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Image Path</label>
                <input type="text" required value={form.image} onChange={e => setForm(f => ({ ...f, image: e.target.value }))}
                  placeholder="e.g. img/plumbing.webp" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Section</label>
                <select required value={form.section} onChange={e => setForm(f => ({ ...f, section: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm">
                  <option value="recent_searches">Recent Searches</option>
                  <option value="popular_on_udo">Popular on UDO</option>
                  <option value="trending_now">Trending Now</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sort Order</label>
                <input type="number" value={form.sort_order} min="1" onChange={e => setForm(f => ({ ...f, sort_order: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm" />
              </div>
              <div className="flex gap-3 mt-6">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 transition">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-orange-500 hover:bg-orange-600 rounded-lg text-sm font-medium text-white transition">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 px-6 py-3 rounded-lg text-white font-medium z-[1000] ${toast.type === 'error' ? 'bg-red-500' : 'bg-green-500'}`}>
          {toast.message}
        </div>
      )}
    </>
  )
}