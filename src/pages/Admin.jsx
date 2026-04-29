import { useState } from 'react'
import { Link } from 'react-router-dom'
import API_BASE from '../config/api'

export default function Admin() {
  const [expandedCard, setExpandedCard] = useState(null)
  const [responseBoxes, setResponseBoxes] = useState({})
  const [pushTitle, setPushTitle] = useState('')
  const [pushMessage, setPushMessage] = useState('')
  const [pushStatus, setPushStatus] = useState(null)

  function toggleCard(id) {
    setExpandedCard(prev => prev === id ? null : id)
  }

  async function tryEndpoint(method, path, key) {
    // Toggle off if already open
    if (responseBoxes[key]?.open) {
      setResponseBoxes(prev => ({ ...prev, [key]: { ...prev[key], open: false } }))
      return
    }

    // Show loading
    setResponseBoxes(prev => ({ ...prev, [key]: { open: true, loading: true } }))

    try {
      const url = API_BASE + path.replace(/^\//, '')
      const res = await fetch(url, { method })
      const contentType = res.headers.get('content-type') || ''
      let body
      try { body = await res.json() } catch { body = await res.text() }

      setResponseBoxes(prev => ({
        ...prev,
        [key]: { open: true, loading: false, status: res.status, ok: res.ok, body, method, path }
      }))
    } catch (err) {
      setResponseBoxes(prev => ({
        ...prev,
        [key]: { open: true, loading: false, error: err.message }
      }))
    }
  }

  function syntaxHighlight(json) {
    return json.replace(
      /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
      function (match) {
        let cls = 'text-amber-600'
        if (/^"/.test(match)) { cls = /:$/.test(match) ? 'text-sky-700' : 'text-green-600' }
        else if (/true|false/.test(match)) { cls = 'text-purple-600' }
        else if (/null/.test(match)) { cls = 'text-gray-400' }
        return `<span class="${cls}">${match}</span>`
      }
    )
  }

  function ResponseBox({ rkey }) {
    const box = responseBoxes[rkey]
    if (!box || !box.open) return null

    if (box.loading) {
      return (
        <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
            </svg>
            Calling {box.method || ''}...
          </div>
        </div>
      )
    }

    if (box.error) {
      return (
        <div className="mt-2 p-3 bg-red-50 rounded-lg border border-red-200">
          <div className="text-xs font-bold text-red-600 mb-1">Request Failed</div>
          <div className="text-xs text-red-500">{box.error}</div>
        </div>
      )
    }

    const statusColor = box.ok ? 'text-green-600' : 'text-red-600'
    const statusBg = box.ok ? 'bg-green-50' : 'bg-red-50'
    const formatted = typeof box.body === 'string' ? box.body : syntaxHighlight(JSON.stringify(box.body, null, 2))

    return (
      <div className="mt-2 rounded-lg border border-gray-200 overflow-hidden">
        <div className={`flex items-center justify-between px-3 py-2 ${statusBg} border-b border-gray-200`}>
          <div className="flex items-center gap-2">
            <span className={`text-xs font-bold ${statusColor}`}>HTTP {box.status}</span>
            <span className="text-xs text-gray-500">{box.method} {box.path}</span>
          </div>
          <button onClick={() => navigator.clipboard.writeText(typeof box.body === 'string' ? box.body : JSON.stringify(box.body, null, 2))}
            className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
            Copy
          </button>
        </div>
        <pre className="p-3 text-xs overflow-x-auto bg-white max-h-64 overflow-y-auto"><code dangerouslySetInnerHTML={{ __html: formatted }} /></pre>
      </div>
    )
  }

  function sendPushNotification() {
    if (!pushTitle && !pushMessage) {
      setPushStatus({ type: 'warn', text: '⚠️ Please enter a title or message before sending.' })
      return
    }
    setPushStatus({ type: 'sending', text: 'Sending notification…' })
    setTimeout(() => {
      setPushStatus({ type: 'success', text: `✅ Notification queued! "${pushTitle || 'No title'}" — ${pushMessage || 'No body'}` })
    }, 800)
  }

  function EndpointRow({ method, path, label, tryable }) {
    const methodColors = {
      GET: 'bg-blue-100 text-blue-800', POST: 'bg-green-100 text-green-800',
      PUT: 'bg-yellow-100 text-yellow-800', PATCH: 'bg-purple-100 text-purple-800',
      DELETE: 'bg-red-100 text-red-800'
    }
    const key = `${path}-${method}`
    return (
      <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
        <span className={`text-[10px] font-bold tracking-wider px-2 py-0.5 rounded min-w-[52px] text-center ${methodColors[method]}`}>{method}</span>
        <code className="text-xs text-gray-600 flex-1 truncate">{path}</code>
        {label && <span className="text-[10px] text-gray-400 ml-1">{label}</span>}
        {tryable && (
          <button onClick={(e) => { e.stopPropagation(); tryEndpoint(method, path, key) }}
            className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-lg font-medium transition">Try It</button>
        )}
      </div>
    )
  }

  function AdminCard({ id, icon, iconBg, iconColor, title, description, badge, badgeColor, badgeBg, children }) {
    const isExpanded = expandedCard === id
    return (
      <div onClick={() => toggleCard(id)}
        className={`bg-white rounded-xl p-5 border cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-lg ${isExpanded ? 'border-orange-500 shadow-lg' : 'border-gray-200'}`}>
        <div className="flex items-start gap-4">
          <div className={`w-12 h-12 ${iconBg} rounded-xl flex items-center justify-center flex-shrink-0`}>
            {icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">{title}</h3>
              <svg className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/>
              </svg>
            </div>
            <p className="text-sm text-gray-500 mt-1">{description}</p>
            {badge && <span className={`inline-block mt-2 text-xs font-medium ${badgeColor} ${badgeBg} px-2 py-1 rounded-full`}>{badge}</span>}
          </div>
        </div>
        <div className={`border-t border-gray-100 mt-4 overflow-hidden transition-all duration-300 ${isExpanded ? 'max-h-[2000px] opacity-100 pt-4 pb-2' : 'max-h-0 opacity-0'}`}>
          {children}
        </div>
      </div>
    )
  }

  return (
    <>
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">UDO Admin Dashboard</h1>
              <p className="text-sm text-gray-500">All admin tools & management pages in one place</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Content Management */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <span className="w-2 h-2 bg-orange-500 rounded-full inline-block"></span>
            Content Management
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <AdminCard id="search-overlay" title="Search Overlay Items" description="Toggle search suggestions on/off. Manage recent, popular & trending items."
              badge="LIVE" badgeColor="text-purple-600" badgeBg="bg-purple-50"
              icon={<svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>}
              iconBg="bg-purple-100">
              <Link to="/searchOverlayAdmin/" className="inline-flex items-center gap-2 text-sm font-medium text-orange-600 hover:text-orange-700 mb-3">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
                Open Admin Page →
              </Link>
              <div className="space-y-2">
                <EndpointRow method="GET" path="/admin/search-overlay-items" tryable />
                <ResponseBox rkey="/admin/search-overlay-items-GET" />
                <EndpointRow method="PATCH" path="/admin/search-overlay-items/{id}/toggle" label="Needs body" />
              </div>
            </AdminCard>

            <AdminCard id="add-food" title="Add Food Item" description="Add new food items to restaurant menus with images and pricing."
              badge="PAGE" badgeColor="text-orange-600" badgeBg="bg-orange-50"
              icon={<svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>}
              iconBg="bg-orange-100">
              <Link to="/AddFoodItem/" className="inline-flex items-center gap-2 text-sm font-medium text-orange-600 hover:text-orange-700 mb-3">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
                Open Page →
              </Link>
            </AdminCard>

            <AdminCard id="food-categories" title="Food Categories" description="Manage shared food categories that appear on /addfooditem. Edit, delete, and toggle on/off."
              badge="PAGE" badgeColor="text-amber-600" badgeBg="bg-amber-50"
              icon={<svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>}
              iconBg="bg-amber-100">
              <Link to="/foodcategories/" className="inline-flex items-center gap-2 text-sm font-medium text-orange-600 hover:text-orange-700 mb-3">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
                Open Admin Page →
              </Link>
              <div className="space-y-2">
                <EndpointRow method="GET" path="/food-categories" label="(public)" tryable />
                <ResponseBox rkey="/food-categories-GET" />
                <EndpointRow method="POST" path="/rest/food-categories" label="Needs body" />
                <EndpointRow method="PUT" path="/rest/food-categories/{id}" label="Needs body + ID" />
                <EndpointRow method="DELETE" path="/rest/food-categories/{id}" label="Needs ID" />
                <EndpointRow method="PATCH" path="/rest/food-categories/{id}/toggle" label="Needs body" />
              </div>
            </AdminCard>

            <AdminCard id="restaurant-owners" title="Restaurant Owners" description="View all users and their linked restaurants. Click to expand restaurant details."
              badge="PAGE" badgeColor="text-teal-600" badgeBg="bg-teal-50"
              icon={<svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>}
              iconBg="bg-teal-100">
              <Link to="/admin/restaurant-owners/" className="inline-flex items-center gap-2 text-sm font-medium text-orange-600 hover:text-orange-700 mb-3">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
                Open Restaurant Owners →
              </Link>
            </AdminCard>

            <AdminCard id="merchant" title="Merchant Dashboard" description="Manage merchant profiles, menus, and service listings."
              badge="PAGE" badgeColor="text-green-600" badgeBg="bg-green-50"
              icon={<svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>}
              iconBg="bg-green-100">
              <Link to="/merchant/" className="inline-flex items-center gap-2 text-sm font-medium text-orange-600 hover:text-orange-700 mb-3">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
                Open Page →
              </Link>
            </AdminCard>
          </div>
        </div>

        {/* Backend API */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <span className="w-2 h-2 bg-blue-500 rounded-full inline-block"></span>
            Backend API Endpoints
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <AdminCard id="users" title="Users Management" description="CRUD operations for users and profiles."
              icon={<svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" /></svg>}
              iconBg="bg-blue-100">
              <div className="space-y-2">
                <EndpointRow method="GET" path="/admin/users" tryable />
                <ResponseBox rkey="/admin/users-GET" />
                <EndpointRow method="POST" path="/admin/users" label="Needs body" />
                <EndpointRow method="GET" path="/admin/users/{id}/profile" label="Needs ID" />
                <EndpointRow method="PUT" path="/admin/users/{id}/profile-image" label="Needs body" />
              </div>
            </AdminCard>

            <AdminCard id="categories" title="Categories" description="Manage service categories with toggle on/off."
              icon={<svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>}
              iconBg="bg-yellow-100">
              <div className="space-y-2">
                <EndpointRow method="GET" path="/admin/categories" tryable />
                <ResponseBox rkey="/admin/categories-GET" />
                <EndpointRow method="POST" path="/admin/categories" label="Needs body" />
                <EndpointRow method="PATCH" path="/admin/categories/{id}/toggle" label="Needs body" />
                <EndpointRow method="GET" path="/categories" tryable />
                <ResponseBox rkey="/categories-GET" />
              </div>
            </AdminCard>

            <AdminCard id="restaurants" title="Restaurants" description="Browse and filter restaurants by category."
              badge="API" badgeColor="text-blue-600" badgeBg="bg-blue-50"
              icon={<svg className="w-6 h-6 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>}
              iconBg="bg-rose-100">
              <div className="space-y-2">
                <EndpointRow method="GET" path="/restaurants" label="(public)" tryable />
                <ResponseBox rkey="/restaurants-GET" />
                <EndpointRow method="GET" path="/restaurants?category=fast-food" label="(filter)" tryable />
                <ResponseBox rkey="/restaurants?category=fast-food-GET" />
                <EndpointRow method="GET" path="/restaurants/{id}" label="Needs ID" />
              </div>
            </AdminCard>

            <AdminCard id="push" title="Push Notifications" description="Send push notifications to iOS users."
              icon={<svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>}
              iconBg="bg-red-100">
              <div className="space-y-3" onClick={e => e.stopPropagation()}>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Title</label>
                  <input type="text" value={pushTitle} onChange={e => setPushTitle(e.target.value)} placeholder="e.g. New feature available!"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Message</label>
                  <textarea value={pushMessage} onChange={e => setPushMessage(e.target.value)} rows="3" placeholder="Type the notification message…"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none" />
                </div>
                <button onClick={sendPushNotification}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold text-sm py-2.5 px-4 rounded-lg transition flex items-center justify-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                  Send Push Notification
                </button>
                {pushStatus && (
                  <div className={`p-3 rounded-lg text-sm ${pushStatus.type === 'success' ? 'bg-green-50 text-green-700' : pushStatus.type === 'warn' ? 'bg-yellow-50 text-yellow-700' : 'bg-blue-50 text-blue-700'}`}>
                    {pushStatus.text}
                  </div>
                )}
                <div className="pt-3 border-t border-gray-100 space-y-2">
                  <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold mb-2">API Endpoint</p>
                  <EndpointRow method="POST" path="/admin/send-push-notification" label="Needs body" />
                </div>
              </div>
            </AdminCard>

            <AdminCard id="search-api" title="Search Overlay API" description="CRUD + toggle for search overlay items."
              icon={<svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>}
              iconBg="bg-purple-100">
              <div className="space-y-2">
                <EndpointRow method="GET" path="/admin/search-overlay-items" tryable />
                <ResponseBox rkey="/admin/search-overlay-items-GET-card2" />
                <EndpointRow method="GET" path="/search-overlay-items" label="(public)" tryable />
                <ResponseBox rkey="/search-overlay-items-GET" />
                <EndpointRow method="PATCH" path="/admin/search-overlay-items/{id}/toggle" label="Needs body" />
              </div>
            </AdminCard>

            <AdminCard id="profile-images" title="Profile Images" description="Update provider profile images."
              icon={<svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
              iconBg="bg-indigo-100">
              <div className="space-y-2">
                <EndpointRow method="PUT" path="/admin/users/{id}/profile-image" label="Needs body + ID" />
              </div>
            </AdminCard>
          </div>
        </div>

        {/* Quick Links */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full inline-block"></span>
            Quick Links
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {[
              { to: '/dashboard/', emoji: '📊', label: 'Dashboard' },
              { to: '/', emoji: '🏠', label: 'Home Page' },
              { to: '/login/', emoji: '🔐', label: 'Login' },
              { to: '/signup/', emoji: '📝', label: 'Signup' },
              { to: '/profiles-list/', emoji: '👥', label: 'Profiles' },
              { to: '/food-delivery/', emoji: '🍔', label: 'Food Delivery' },
            ].map(link => (
              <Link key={link.to} to={link.to} className="bg-white border border-gray-200 rounded-lg p-3 text-center hover:border-orange-400 transition">
                <div className="text-2xl mb-1">{link.emoji}</div>
                <div className="text-xs font-medium text-gray-700">{link.label}</div>
              </Link>
            ))}
          </div>
        </div>

        <div className="text-center text-xs text-gray-400 py-6 border-t border-gray-100">
          UDO Admin Dashboard · Backend API at <code className="bg-gray-100 px-1 rounded">localhost:3030</code>
        </div>
      </main>
    </>
  )
}