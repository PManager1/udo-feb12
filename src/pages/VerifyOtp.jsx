import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { AUTH_API } from '../config/api'
import tokenManager from '../utils/tokenManager'

export default function VerifyOtpPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const phone = searchParams.get('phone') || ''

  const [otp, setOtp] = useState(['', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ text: '', type: '' })
  const inputRefs = useRef([])

  useEffect(() => {
    if (!phone) {
      navigate('/login/')
      return
    }
    // Focus first input on mount
    inputRefs.current[0]?.focus()
  }, [phone, navigate])

  function handleChange(index, value) {
    if (!/^\d*$/.test(value)) return // Only digits

    const newOtp = [...otp]

    // Handle paste or single character
    if (value.length > 1) {
      // Pasting multiple digits
      const digits = value.slice(0, 4)
      for (let i = 0; i < 4; i++) {
        newOtp[i] = digits[i] || ''
      }
      setOtp(newOtp)
      const nextEmpty = newOtp.findIndex(d => d === '')
      const focusIndex = nextEmpty === -1 ? 3 : nextEmpty
      inputRefs.current[focusIndex]?.focus()
    } else {
      newOtp[index] = value
      setOtp(newOtp)
      // Auto-advance to next input
      if (value && index < 3) {
        inputRefs.current[index + 1]?.focus()
      }
    }

    if (message.text) setMessage({ text: '', type: '' })
  }

  function handleKeyDown(index, e) {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  function handlePaste(e) {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 4)
    const newOtp = [...otp]
    for (let i = 0; i < 4; i++) {
      newOtp[i] = pasted[i] || ''
    }
    setOtp(newOtp)
    const nextEmpty = newOtp.findIndex(d => d === '')
    const focusIndex = nextEmpty === -1 ? 3 : nextEmpty
    inputRefs.current[focusIndex]?.focus()
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const code = otp.join('')
    if (code.length !== 4) {
      setMessage({ text: 'Please enter the 4-digit code', type: 'error' })
      return
    }

    setLoading(true)
    const cleanedNumber = phone.replace(/\D/g, '')
    const finalNumber = '+1' + cleanedNumber

    try {
      const response = await fetch(AUTH_API.verifyOtp, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: finalNumber, otp: code })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Verification failed')
      }

      console.log('OTP verified:', data)

      // Save token
      if (data.token) {
        tokenManager.saveToken(data.token)
      }

      setMessage({ text: 'Verified! Redirecting...', type: 'success' })

      setTimeout(() => {
        navigate('/')
      }, 1000)

    } catch (error) {
      console.error('Error verifying OTP:', error)
      setMessage({ text: error.message || 'Verification failed. Please try again.', type: 'error' })
      setLoading(false)
    }
  }

  async function handleResend() {
    setMessage({ text: '', type: '' })
    const cleanedNumber = phone.replace(/\D/g, '')
    const finalNumber = '+1' + cleanedNumber

    try {
      const response = await fetch(AUTH_API.sendOtp, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: finalNumber })
      })

      if (!response.ok) throw new Error('Failed to resend')
      setMessage({ text: 'New code sent!', type: 'success' })
      setOtp(['', '', '', ''])
      inputRefs.current[0]?.focus()
    } catch {
      setMessage({ text: 'Failed to resend. Try again.', type: 'error' })
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

      {/* Verify OTP Section */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 md:p-10">
          <div className="text-center mb-8 mt-4">
            <h1 className="text-4xl font-bold mb-2">
              <span className="text-orange-500">U-</span><span className="text-black">DO</span>
            </h1>
            <h2 className="text-2xl font-semibold text-gray-900">Enter your code</h2>
            <p className="text-gray-600 mt-2">
              We sent a verification code to<br />
              <span className="font-medium text-gray-900">{phone}</span>
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            {/* OTP Input */}
            <div className="flex justify-center gap-3 mb-6" onPaste={handlePaste}>
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={el => inputRefs.current[i] = el}
                  type="text"
                  inputMode="numeric"
                  maxLength={4}
                  value={digit}
                  onChange={e => handleChange(i, e.target.value)}
                  onKeyDown={e => handleKeyDown(i, e)}
                  className="w-12 h-14 text-center text-2xl font-bold border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
                />
              ))}
            </div>

            {/* Message */}
            {message.text && (
              <div className={`mb-4 text-center p-4 rounded-xl text-sm font-medium ${
                message.type === 'error' ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'
              }`}>
                {message.text}
              </div>
            )}

            <button
              type="submit"
              disabled={otp.join('').length !== 4 || loading}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3.5 px-6 rounded-lg text-lg transition duration-300 shadow-md hover:shadow-lg flex items-center justify-center gap-2 disabled:bg-gray-300 disabled:cursor-not-allowed disabled:hover:shadow-none"
            >
              <span>{loading ? 'Verifying...' : 'Verify'}</span>
              {loading && (
                <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-500 text-sm">
              Didn't get a code?{' '}
              <button onClick={handleResend} className="text-orange-500 font-medium hover:text-orange-600 transition">
                Resend
              </button>
            </p>
          </div>

          <div className="mt-4 text-center">
            <Link to="/login/" className="text-gray-500 text-sm hover:text-gray-700 transition">
              ← Back to login
            </Link>
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
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4 text-gray-800">Support</h4>
              <ul className="space-y-2">
                <li><Link to="/contact-us/" className="text-gray-700 hover:text-orange-500 transition">Help Center</Link></li>
                <li><Link to="/contact-us/" className="text-gray-700 hover:text-orange-500 transition">Contact Us</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4 text-gray-800">Legal</h4>
              <ul className="space-y-2">
                <li><Link to="/terms/" className="text-gray-700 hover:text-orange-500 transition">Terms of Service</Link></li>
                <li><Link to="/privacy/" className="text-gray-700 hover:text-orange-500 transition">Privacy Policy</Link></li>
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