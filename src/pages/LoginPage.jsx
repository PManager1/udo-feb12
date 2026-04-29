import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AUTH_API } from '../config/api'

export default function LoginPage() {
  const navigate = useNavigate()
  const [phoneNumber, setPhoneNumber] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ text: '', type: '' })

  function formatPhoneNumber(value) {
    const digits = value.replace(/\D/g, '')
    if (digits.length > 10) return value.substring(0, 12)
    let formatted = ''
    for (let i = 0; i < digits.length && i < 10; i++) {
      if (i === 3 || i === 6) formatted += '-'
      formatted += digits[i]
    }
    return formatted
  }

  function isValidPhone(value) {
    return value.replace(/\D/g, '').length === 10
  }

  function handlePhoneChange(e) {
    const formatted = formatPhoneNumber(e.target.value)
    setPhoneNumber(formatted)
    if (message.text) setMessage({ text: '', type: '' })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!isValidPhone(phoneNumber)) {
      setMessage({ text: 'Please enter a valid 10-digit phone number', type: 'error' })
      return
    }

    setLoading(true)
    const cleanedNumber = phoneNumber.replace(/\D/g, '')
    const finalNumber = '+1' + cleanedNumber

    console.log('Sending OTP to:', finalNumber)
    console.log('API URL:', AUTH_API.sendOtp)

    try {
      const response = await fetch(AUTH_API.sendOtp, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: finalNumber })
      })

      const responseText = await response.text()
      console.log('Response:', response.status, responseText)

      if (!response.ok) {
        let errorData
        try { errorData = JSON.parse(responseText) } catch { 
          throw new Error(`Server error: ${response.status}`) 
        }
        throw new Error(errorData.message || 'Failed to send OTP')
      }

      let data
      try { data = JSON.parse(responseText) } catch {
        throw new Error('Invalid response from server')
      }

      console.log('OTP sent:', data)
      localStorage.setItem('phoneNumber', phoneNumber)
      setMessage({ text: 'OTP sent successfully! Redirecting...', type: 'success' })

      setTimeout(() => {
        navigate(`/verifyOtp?phone=${encodeURIComponent(phoneNumber)}`)
      }, 1500)

    } catch (error) {
      console.error('Error sending OTP:', error)
      setMessage({ text: error.message || 'Failed to send OTP. Please try again.', type: 'error' })
      setLoading(false)
    }
  }

  return (
    <>
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="absolute left-6 sm:left-12 top-1/2 -translate-y-1/2 z-[60] hover:opacity-90 transition">
          <Link to="/" className="text-3xl sm:text-4xl font-bold">
            <span className="text-orange-500">U <span className="-mx-1"></span>-</span><span className="text-gray-800">DO</span>
          </Link>
          <p className="text-sm text-gray-600 font-medium -mt-1">let someone do it for you</p>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
          <div className="w-48 hidden lg:block"></div>
          <div className="flex-1 max-w-3xl hidden lg:block">
            <div className="relative">
              <input type="text" placeholder="Search" readOnly
                className="w-full pl-5 pr-12 py-3.5 bg-[#DADAD3] border border-gray-300 rounded-full text-base focus:outline-none focus:ring-2 focus:ring-gray-400/50 transition shadow-sm cursor-pointer" />
              <button className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2 lg:hidden ml-auto">
            <button className="p-3 rounded-full hover:bg-gray-100 transition-colors">
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>
          <div className="hidden lg:flex items-center gap-3">
            <Link to="/signup/" className="text-gray-700 hover:text-orange-500 font-medium text-base transition">Sign up</Link>
          </div>
        </div>
      </header>

      {/* Sign In Section */}
      <main className="flex-1 flex items-center justify-center px-4 py-12 relative">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 md:p-10 relative">
          <div className="text-center mb-8 mt-4">
            <h1 className="text-4xl font-bold mb-2">
              <span className="text-orange-500">U-</span><span className="text-black">DO</span>
            </h1>
            <h2 className="text-2xl font-semibold text-gray-900">Sign in with your phone</h2>
            <p className="text-gray-600 mt-2">We'll send you a verification code</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div>
              <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
              <input
                type="tel"
                id="phoneNumber"
                value={phoneNumber}
                onChange={handlePhoneChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
                placeholder="123-456-7890"
                maxLength={12}
                autoComplete="tel"
              />
            </div>

            {/* Message */}
            {message.text && (
              <div className={`mt-4 text-center p-4 rounded-xl text-sm font-medium ${
                message.type === 'error' ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'
              }`}>
                {message.text}
              </div>
            )}

            <div className="h-48 hidden md:block"></div>
            <div className="h-12 md:hidden"></div>

            <button
              type="submit"
              disabled={!isValidPhone(phoneNumber) || loading}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3.5 px-6 rounded-lg text-lg transition duration-300 shadow-md hover:shadow-lg flex items-center justify-center gap-2 disabled:bg-gray-300 disabled:cursor-not-allowed disabled:hover:shadow-none"
            >
              <span>{loading ? 'Sending...' : 'Send me OTP'}</span>
              {loading && (
                <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-gray-500 text-sm leading-relaxed">
              By providing your phone number, you agree to receive a one-time text message from UDo for account verification. Message and data rates may apply. View our <Link to="/privacy/" className="text-blue-600 font-medium hover:text-blue-800 transition">Privacy Policy</Link>.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[#b0b0a8] text-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
            <div>
              <h3 className="text-2xl font-bold mb-4">
                <span className="text-orange-500">U-</span><span className="text-black">DO</span>
              </h3>
              <p className="text-gray-700 text-sm leading-relaxed">UDO Let someone else do it for you.</p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4 text-gray-800">Quick Links</h4>
              <ul className="space-y-2">
                <li><Link to="/" className="text-gray-700 hover:text-orange-500 transition">Home</Link></li>
                <li><Link to="/profiles-list/" className="text-gray-700 hover:text-orange-500 transition">Services</Link></li>
                <li><Link to="/join-as-professional/" className="text-gray-700 hover:text-orange-500 transition">Join as Pro</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4 text-gray-800">Support</h4>
              <ul className="space-y-2">
                <li><Link to="/contact-us/" className="text-gray-700 hover:text-orange-500 transition">Help Center</Link></li>
                <li><Link to="/safety/" className="text-gray-700 hover:text-orange-500 transition">Safety</Link></li>
                <li><Link to="/contact-us/" className="text-gray-700 hover:text-orange-500 transition">Contact Us</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4 text-gray-800">Legal</h4>
              <ul className="space-y-2">
                <li><Link to="/terms/" className="text-gray-700 hover:text-orange-500 transition">Terms of Service</Link></li>
                <li><Link to="/privacy/" className="text-gray-700 hover:text-orange-500 transition">Privacy Policy</Link></li>
                <li><Link to="/trademark/" className="text-gray-700 hover:text-orange-500 transition">Trademark</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4 text-gray-800">Language</h4>
              <select className="w-full bg-white text-gray-800 border border-gray-400 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer">
                <option value="en">English</option>
                <option value="es">Español</option>
                <option value="fr">Français</option>
              </select>
            </div>
          </div>
          <div className="border-t border-gray-400 mt-10 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-700 text-sm mb-4 md:mb-0">© 2026 UDo, Inc. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </>
  )
}