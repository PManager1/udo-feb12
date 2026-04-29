import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import API_BASE from '../config/api'

export default function AdminRestaurantOwners() {
  const [allRestaurants, setAllRestaurants] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedCard, setExpandedCard] = useState(null)

  
  useEffect(() => { loadData() }, [])

  async function loadData() {
    setLoading(true); setError(null)
    try {
      const res = await fetch(API_BASE + 'admin/restaurants')
      if (!res.ok) throw new Error(`Server returned ${res.status}`)
      const data = await res.json()
      setAllRestaurants(data.restaurants || [])
    } catch (err) {
      setError(err.message + ' — Make sure the server is running at ' + API_BASE)
    } finally { setLoading(false) }
  }

  function toggleCard(idx) {
    setExpandedCard(prev => prev === idx ? null : idx)
  }

  function enterStoreView(userId, storeName) {
    if (!confirm(`Enter store manager view for "${storeName}"?\n\nThis will open the merchant dashboard acting as this restaurant owner.`)) return
    localStorage.setItem('adminMode', 'true')
    localStorage.setItem('adminTargetUserId', userId)
    window.open('/merchant/', '_blank')
  }

  const stats = allRestaurants.reduce((acc, r) => ({
    items: acc.items + (r.items || []).length,
    categories: acc.categories + (r.categories || []).length
  }), { items: 0, categories: 0 })

  const filtered = searchQuery.trim()
    ? allRestaurants.filter(r => {
        const text = `${r.restaurantName || ''} ${r.storeAddress || ''} ${r.category || ''} ${r.storeType || ''} ${(r.items || []).map(i => i.name || '').join(' ')}`.toLowerCase()
        return text.includes(searchQuery.toLowerCase())
      })
    : allRestaurants

  function renderItems(items, categories) {
    if (!items || items.length === 0) return <p className="text-gray-400 text-sm text-center py-4">No menu items yet</p>
    const catMap = {}; (categories || []).forEach(c => { catMap[c._id] = c.name })
    const byCategory = {}; const uncategorized = []
    items.forEach(item => {
      const catName = catMap[item.categoryId] || catMap[item.categoryId?.$oid] || null
      if (catName) { if (!byCategory[catName]) byCategory[catName] = []; byCategory[catName].push(item) }
      else uncategorized.push(item)
    })
    return (
      <>
        {Object.entries(byCategory).map(([catName, catItems]) => (
          <div key={catName} className="mb-4">
            <h5 className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-1">
              <span className="w-2 h-2 bg-orange-400 rounded-full"></span>
              {catName} <span className="text-gray-400 font-normal">({catItems.length})</span>
            </h5>
            <div className="space-y-1">{catItems.map(renderItemRow)}</div>
          </div>
        ))}
        {uncategorized.length > 0 && (
          <div className="mb-4">
            <h5 className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-1">
              <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
              Uncategorized <span className="text-gray-400 font-normal">({uncategorized.length})</span>
            </h5>
            <div className="space-y-1">{uncategorized.map(renderItemRow)}</div>
          </div>
        )}
      </>
    )
  }

  function renderItemRow(item) {
    const name = item.name || 'Unnamed'; const price = item.basePrice || 0
    const image = item.imageUrl || item.imageURL || ''; const available = item.isAvailable !== false
    return (
      <div key={item._id || item.name} className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-orange-50">
        {image && <img src={image} alt={name} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" onError={e => e.target.style.display='none'} />}
        <div className="flex-1 min-w-0">
          <span className={`text-sm font-medium ${available ? 'text-gray-800' : 'line-through text-gray-400'}`}>{name}</span>
          {!available && <span className="ml-2 text-xs text-red-500 font-medium">86'd</span>}
        </div>
        <span className={`text-sm font-bold ${price > 0 ? 'text-green-600' : 'text-gray-400'}`}>${price.toFixed(2)}</span>
      </div>
    )
  }

  const days = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday']

  return (
    <>
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <Link to="/admin/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Restaurant Owners</h1>
              <p className="text-sm text-gray-500">View all restaurants, menus & manage stores</p>
            </div>
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <div className="bg-gray-50 border border-gray-200 rounded-full px-3 py-1 text-xs font-semibold">🏪 {allRestaurants.length} Restaurants</div>
          <div className="bg-gray-50 border border-gray-200 rounded-full px-3 py-1 text-xs font-semibold">🍔 {stats.items} Menu Items</div>
          <div className="bg-gray-50 border border-gray-200 rounded-full px-3 py-1 text-xs font-semibold">📂 {stats.categories} Categories</div>
          <div className="flex-1"></div>
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
            <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search restaurants, items..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm w-72 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100" />
          </div>
          <button onClick={loadData} className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
            </svg>
            Refresh
          </button>
        </div>

        {loading && (
          <div className="text-center py-16">
            <svg className="animate-spin w-10 h-10 text-orange-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
            </svg>
            <p className="text-gray-500">Loading restaurants...</p>
          </div>
        )}

        {error && (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">⚠️</div>
            <p className="text-gray-700 font-semibold mb-2">Failed to load data</p>
            <p className="text-sm text-gray-500 mb-4">{error}</p>
            <button onClick={loadData} className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg text-sm font-medium transition">Try Again</button>
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">🔍</div>
            <p className="text-gray-700 font-semibold mb-2">No results found</p>
            <p className="text-sm text-gray-500">Try adjusting your search query.</p>
          </div>
        )}

        <div className="space-y-4">
          {filtered.map((r, idx) => {
            const name = r.restaurantName || 'Unnamed Restaurant'
            const isExpanded = expandedCard === idx
            const items = r.items || []; const categories = r.categories || []
            const isPaused = r.emergencyPause || false
            const hours = r.storeHours || {}
            return (
              <div key={idx} onClick={() => toggleCard(idx)}
                className={`bg-white rounded-xl p-5 border cursor-pointer transition-all hover:shadow-md ${isExpanded ? 'border-orange-500 shadow-lg' : 'border-gray-200'}`}>
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-xl flex-shrink-0 flex items-center justify-center overflow-hidden ${r.logoURL ? '' : 'bg-orange-100'}`}>
                    {r.logoURL
                      ? <img src={r.logoURL} alt={name} className="w-full h-full object-cover rounded-xl" />
                      : <svg className="w-7 h-7 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-gray-900 truncate">{name}</h3>
                      {isPaused
                        ? <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-red-100 text-red-800">⏸ Paused</span>
                        : items.length > 0
                          ? <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-green-100 text-green-800">● Live</span>
                          : <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">No items</span>
                      }
                      {r.storeType && <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full capitalize">{r.storeType}</span>}
                      {r.category && <span className="text-xs bg-purple-50 text-purple-600 px-2 py-0.5 rounded-full capitalize">{r.category.replace(/-/g, ' ')}</span>}
                    </div>
                    <div className="flex items-center gap-4 mt-1 flex-wrap">
                      {r.phoneNumber && <span className="text-sm text-green-700 font-medium">📱 {r.phoneNumber}</span>}
                      {r.storeAddress && <span className="text-sm text-gray-500 truncate max-w-xs">{r.storeAddress}</span>}
                      {r.rating > 0 && <span className="text-xs text-gray-600">⭐ {r.rating.toFixed(1)} ({r.reviewCount || 0})</span>}
                      {r.deliveryTime > 0 && <span className="text-xs text-gray-600">🕐 {r.deliveryTime} min</span>}
                      <span className="text-xs font-semibold text-gray-600">📂 {categories.length} categories</span>
                      <span className="text-xs font-semibold text-gray-600">🍔 {items.length} items</span>
                    </div>
                  </div>
                  {r.userId && (
                    <button onClick={e => { e.stopPropagation(); enterStoreView(r.userId, name) }}
                      className="bg-gradient-to-br from-orange-500 to-orange-600 text-white font-semibold px-4 py-2 rounded-xl text-sm whitespace-nowrap flex items-center gap-2 hover:-translate-y-0.5 hover:shadow-lg transition-all">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                      Store Manager
                    </button>
                  )}
                  <svg className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/>
                  </svg>
                </div>

                <div className={`overflow-hidden transition-all duration-300 ${isExpanded ? 'max-h-[5000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                  <div className="border-t border-gray-100 mt-4 pt-4">
                    <div className="mb-4">
                      <p className="text-xs font-medium text-gray-500 mb-2">Store Hours</p>
                      <div className="flex flex-wrap gap-1">
                        {days.map(day => {
                          const time = hours[day]
                          return (
                            <span key={day} className={`text-xs border rounded px-2 py-1 ${time ? 'bg-gray-50 border-gray-200' : 'bg-red-50 border-red-200'}`}>
                              <span className={`font-medium capitalize ${time ? 'text-gray-700' : 'text-red-400'}`}>{day.slice(0,3)}</span>
                              <span className={`ml-1 ${time ? 'text-gray-500' : 'text-red-400'}`}>{time || 'Closed'}</span>
                            </span>
                          )
                        })}
                      </div>
                    </div>
                    <div className="mb-2">
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Menu Items</p>
                      {renderItems(items, categories)}
                    </div>
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <p className="text-xs text-gray-400">User ID: <code className="bg-gray-50 px-1 rounded">{r.userId || ''}</code></p>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </main>

      <div className="text-center text-xs text-gray-400 py-6 border-t border-gray-100 mt-8">
        UDO Admin · Restaurant Owners · Backend at <code className="bg-gray-100 px-1 rounded">localhost:3030</code>
      </div>
    </>
  )
}