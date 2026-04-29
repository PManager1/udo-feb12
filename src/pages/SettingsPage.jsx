import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import tokenManager from '../utils/tokenManager'
import { USER_API } from '../config/api'

export default function SettingsPage() {
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' })
  const [deleteModal, setDeleteModal] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState('')
  const [tokenInput, setTokenInput] = useState('')
  const [tokenStatus, setTokenStatus] = useState(false)
  const [maskedToken, setMaskedToken] = useState('')
  const [tokenUpdatedAt, setTokenUpdatedAt] = useState('')

  // Collapsible sections
  const [sections, setSections] = useState({
    account: true, security: true, notifications: true,
    privacy: true, language: true
  })

  // Account form state
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [location, setLocation] = useState('')
  const [profileLoading, setProfileLoading] = useState(true)

  useEffect(() => {
    updateTokenDisplay()
    loadProfile()
  }, [])

  async function loadProfile() {
    const headers = tokenManager.getHeaders()
    if (!headers.Authorization) {
      setProfileLoading(false)
      return
    }

    try {
      const response = await fetch(USER_API.getProfile, { headers })
      if (!response.ok) throw new Error('Failed to load profile')
      const data = await response.json()

      // GetMe returns the user object directly or nested
      const user = data.user || data
      if (user.firstName) setFirstName(user.firstName)
      if (user.lastName) setLastName(user.lastName)
      if (user.email) setEmail(user.email)
      if (user.phoneNumber) setPhone(user.phoneNumber)
    } catch (error) {
      console.error('Error loading profile:', error)
    } finally {
      setProfileLoading(false)
    }
  }

  function updateTokenDisplay() {
    const hasToken = tokenManager.hasValidToken()
    setTokenStatus(hasToken)
    if (hasToken) {
      setMaskedToken(tokenManager.getMaskedToken(5) || '')
      const metadata = tokenManager.getTokenMetadata()
      if (metadata?.updatedAt) {
        setTokenUpdatedAt('Updated: ' + new Date(metadata.updatedAt).toLocaleString())
      }
    }
  }

  function showToast(message, type = 'success') {
    setToast({ show: true, message, type })
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000)
  }

  function toggleSection(name) {
    setSections(prev => ({ ...prev, [name]: !prev[name] }))
  }

  function saveToken() {
    const token = tokenInput.trim()
    if (!token) { showToast('Please enter a token', 'error'); return }
    if (!tokenManager.validateTokenFormat(token)) {
      showToast('Invalid token format. Token must be at least 10 characters.', 'error'); return
    }
    if (tokenManager.saveToken(token)) {
      updateTokenDisplay()
      setTokenInput('')
      showToast('Token saved successfully!')
    } else {
      showToast('Failed to save token', 'error')
    }
  }

  function clearToken() {
    if (confirm('Are you sure you want to clear the saved token?')) {
      if (tokenManager.clearToken()) {
        updateTokenDisplay()
        showToast('Token cleared successfully')
      }
    }
  }

  async function saveSettings(section) {
    if (section === 'account') {
      const headers = tokenManager.getHeaders()
      if (!headers.Authorization) {
        showToast('Please log in to save changes', 'error')
        return
      }

      try {
        const response = await fetch(USER_API.updateProfile, {
          method: 'PATCH',
          headers,
          body: JSON.stringify({
            firstName,
            lastName,
            email,
            phoneNumber: phone
          })
        })

        if (!response.ok) {
          const data = await response.json().catch(() => ({}))
          throw new Error(data.message || 'Failed to save')
        }

        const data = await response.json()
        // Update local state with returned user data
        const user = data.user || {}
        if (user.firstName) setFirstName(user.firstName)
        if (user.lastName) setLastName(user.lastName)
        if (user.email) setEmail(user.email)
        if (user.phoneNumber) setPhone(user.phoneNumber)

        showToast('Profile updated successfully!')
      } catch (error) {
        console.error('Error saving profile:', error)
        showToast(error.message || 'Failed to save changes', 'error')
      }
    } else {
      showToast('Settings saved successfully!')
    }
  }

  function confirmDelete() {
    if (deleteConfirm === 'DELETE') {
      alert('Account deletion initiated. You will receive a confirmation email.')
      setDeleteModal(false)
      setDeleteConfirm('')
    } else {
      alert('Please type "DELETE" to confirm account deletion.')
    }
  }

  return (
    <>
      {/* Nav */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="text-2xl font-bold">
              <span className="text-orange-500">U <span className="-mx-1"></span>-</span><span className="text-gray-800">DO</span>
            </Link>
            <div className="flex items-center space-x-4">
              <Link to="/" className="text-gray-700 hover:text-orange-500 transition-colors">Home</Link>
              <span className="text-gray-700 font-medium">Settings</span>
              <Link to="/login/" className="bg-orange-500 text-white px-4 py-2 rounded-full font-semibold hover:bg-orange-600 transition-colors">
                My Account
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Settings</h1>
          <p className="text-gray-600 text-lg">Manage your account settings and preferences</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden sticky top-24">
              <div className="h-24 bg-gradient-to-r from-orange-400 to-orange-600"></div>
              <div className="px-6 pb-6">
                <div className="relative -mt-12 mb-4">
                  <div className="w-24 h-24 rounded-full border-4 border-white shadow-lg overflow-hidden bg-orange-100">
                    <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop" alt="Profile" className="w-full h-full object-cover" />
                  </div>
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-1">{firstName} {lastName}</h2>
                <p className="text-gray-500 mb-4">{email}</p>
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="text-center"><p className="text-2xl font-bold text-gray-900">12</p><p className="text-xs text-gray-500">Bookings</p></div>
                  <div className="text-center"><p className="text-2xl font-bold text-gray-900">5</p><p className="text-xs text-gray-500">Reviews</p></div>
                  <div className="text-center"><p className="text-2xl font-bold text-gray-900">3</p><p className="text-xs text-gray-500">Saved</p></div>
                </div>
                <div className="space-y-2">
                  <Link to="/" className="flex items-center gap-3 w-full px-4 py-3 rounded-xl hover:bg-gray-50 transition-colors">
                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span className="text-gray-700 font-medium">View Profile</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Account Information */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:-translate-y-0.5 hover:shadow-lg transition-all">
              <div className="flex items-center justify-between mb-6 cursor-pointer" onClick={() => toggleSection('account')}>
                <div><h2 className="text-xl font-bold text-gray-900">Account Information</h2><p className="text-gray-500 text-sm">Update your personal details</p></div>
                <svg className={`w-6 h-6 transition-transform ${!sections.account ? '-rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
              </div>
              {sections.account && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><label className="block text-sm font-medium text-gray-700 mb-2">First Name</label><input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" /></div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label><input type="text" value={lastName} onChange={e => setLastName(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" /></div>
                  </div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" /></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label><input type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" /></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-2">Location</label><input type="text" value={location} onChange={e => setLocation(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" /></div>
                  <button onClick={() => saveSettings('account')} className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors">Save Changes</button>
                </div>
              )}
            </div>

            {/* Security */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:-translate-y-0.5 hover:shadow-lg transition-all">
              <div className="flex items-center justify-between mb-6 cursor-pointer" onClick={() => toggleSection('security')}>
                <div><h2 className="text-xl font-bold text-gray-900">Security</h2><p className="text-gray-500 text-sm">Manage your password and security</p></div>
                <svg className={`w-6 h-6 transition-transform ${!sections.security ? '-rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
              </div>
              {sections.security && (
                <div className="space-y-4">
                  <div><label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label><input type="password" placeholder="Enter current password" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" /></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-2">New Password</label><input type="password" placeholder="Enter new password" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" /></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label><input type="password" placeholder="Confirm new password" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" /></div>
                  <button onClick={() => saveSettings('security')} className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors">Update Password</button>
                </div>
              )}
            </div>

            {/* Notifications */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:-translate-y-0.5 hover:shadow-lg transition-all">
              <div className="flex items-center justify-between mb-6 cursor-pointer" onClick={() => toggleSection('notifications')}>
                <div><h2 className="text-xl font-bold text-gray-900">Notifications</h2><p className="text-gray-500 text-sm">Choose what notifications you receive</p></div>
                <svg className={`w-6 h-6 transition-transform ${!sections.notifications ? '-rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
              </div>
              {sections.notifications && (
                <div className="space-y-4">
                  {[
                    { title: 'Email Notifications', desc: 'Receive updates about your bookings via email', defaultChecked: true },
                    { title: 'Push Notifications', desc: 'Receive push notifications on your device', defaultChecked: true },
                    { title: 'SMS Notifications', desc: 'Receive text messages for important updates', defaultChecked: false },
                    { title: 'Marketing Emails', desc: 'Receive special offers and promotions', defaultChecked: true },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div><h3 className="font-semibold text-gray-900">{item.title}</h3><p className="text-sm text-gray-500">{item.desc}</p></div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" defaultChecked={item.defaultChecked} className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                      </label>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Privacy */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:-translate-y-0.5 hover:shadow-lg transition-all">
              <div className="flex items-center justify-between mb-6 cursor-pointer" onClick={() => toggleSection('privacy')}>
                <div><h2 className="text-xl font-bold text-gray-900">Privacy</h2><p className="text-gray-500 text-sm">Control your privacy settings</p></div>
                <svg className={`w-6 h-6 transition-transform ${!sections.privacy ? '-rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
              </div>
              {sections.privacy && (
                <div className="space-y-4">
                  {[
                    { title: 'Profile Visibility', desc: 'Make your profile visible to other users', checked: true },
                    { title: 'Show Location', desc: 'Display your location on your profile', checked: true },
                    { title: 'Allow Messages', desc: 'Let other users send you messages', checked: true },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div><h3 className="font-semibold text-gray-900">{item.title}</h3><p className="text-sm text-gray-500">{item.desc}</p></div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" defaultChecked={item.checked} className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                      </label>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Language & Region */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:-translate-y-0.5 hover:shadow-lg transition-all">
              <div className="flex items-center justify-between mb-6 cursor-pointer" onClick={() => toggleSection('language')}>
                <div><h2 className="text-xl font-bold text-gray-900">Language & Region</h2><p className="text-gray-500 text-sm">Set your language and regional preferences</p></div>
                <svg className={`w-6 h-6 transition-transform ${!sections.language ? '-rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
              </div>
              {sections.language && (
                <div className="space-y-4">
                  <div><label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                    <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500">
                      <option value="en">English</option><option value="es">Español</option><option value="fr">Français</option><option value="de">Deutsch</option>
                    </select>
                  </div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                    <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500">
                      <option value="usd">USD ($)</option><option value="eur">EUR (€)</option><option value="gbp">GBP (£)</option><option value="cad">CAD ($)</option>
                    </select>
                  </div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-2">Time Zone</label>
                    <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500">
                      <option value="est">Eastern Time (ET)</option><option value="cst">Central Time (CT)</option><option value="mst">Mountain Time (MT)</option><option value="pst">Pacific Time (PT)</option>
                    </select>
                  </div>
                  <button onClick={() => saveSettings('language')} className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors">Save Preferences</button>
                </div>
              )}
            </div>

            {/* Token Access */}
            <div className="bg-white rounded-2xl shadow-sm border border-red-200 p-6 hover:-translate-y-0.5 hover:shadow-lg transition-all">
              <div className="flex items-center justify-between mb-6">
                <div><h2 className="text-xl font-bold text-red-600">Token Account</h2><p className="text-gray-500 text-sm">Input Token here</p></div>
                {tokenStatus && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                    Token Saved
                  </span>
                )}
              </div>
              <div className="space-y-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-2">Input Token</label>
                  <input type="text" value={tokenInput} onChange={e => setTokenInput(e.target.value)} placeholder="Enter Token" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" />
                </div>
                {tokenStatus && (
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div><p className="text-sm text-gray-600">Saved Token:</p><p className="font-mono text-sm text-gray-800">{maskedToken}</p><p className="text-xs text-gray-500 mt-1">{tokenUpdatedAt}</p></div>
                      <button onClick={clearToken} className="text-red-500 hover:text-red-600 text-sm font-medium flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        Clear
                      </button>
                    </div>
                  </div>
                )}
                <button onClick={saveToken} className="bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors">Save Token</button>
              </div>
            </div>

            {/* Delete Account */}
            <div className="bg-white rounded-2xl shadow-sm border border-red-200 p-6 hover:-translate-y-0.5 hover:shadow-lg transition-all">
              <div className="mb-6"><h2 className="text-xl font-bold text-red-600">Delete Account</h2><p className="text-gray-500 text-sm">Permanently delete your account and data</p></div>
              <div className="space-y-4">
                <p className="text-gray-700">Warning: This action cannot be undone. All your data will be permanently deleted.</p>
                <button onClick={() => setDeleteModal(true)} className="bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors">Delete My Account</button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Delete Modal */}
      {deleteModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={e => { if (e.target === e.currentTarget) setDeleteModal(false) }}>
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="mb-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 text-center mb-2">Delete Account?</h3>
              <p className="text-gray-600 text-center">Are you sure? This action cannot be undone.</p>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Type "DELETE" to confirm</label>
              <input type="text" value={deleteConfirm} onChange={e => setDeleteConfirm(e.target.value)} placeholder="DELETE" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500" />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setDeleteModal(false)} className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 rounded-lg transition-colors">Cancel</button>
              <button onClick={confirmDelete} className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-3 rounded-lg transition-colors">Delete Account</button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast.show && (
        <div className={`fixed bottom-4 right-4 ${toast.type === 'error' ? 'bg-red-500' : 'bg-green-500'} text-white px-6 py-4 rounded-xl shadow-lg z-50 flex items-center gap-3`}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
          <span>{toast.message}</span>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-[#b0b0a8] text-gray-800 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="border-t border-gray-400 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-700 text-sm mb-4 md:mb-0">© 2026 UDo, Inc. All rights reserved.</p>
            <Link to="/" className="text-gray-600 hover:text-orange-500 transition font-medium">Back to Home</Link>
          </div>
        </div>
      </footer>
    </>
  )
}