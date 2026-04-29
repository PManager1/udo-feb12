import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

export default function SignupPage() {
  const navigate = useNavigate()
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [nameError, setNameError] = useState(false)
  const [phoneError, setPhoneError] = useState(false)

  // Load saved data if returning
  useState(() => {
    const savedData = localStorage.getItem('signupStep1')
    if (savedData) {
      const data = JSON.parse(savedData)
      setFullName(data.fullName || '')
      setPhone(data.phone || '')
    }
  })

  function handlePhoneChange(e) {
    let value = e.target.value.replace(/\D/g, '')
    if (value.length > 0) {
      if (!value.startsWith('1')) value = '1' + value
      let formatted = '+1'
      if (value.length > 1) formatted += ' (' + value.substring(1, 4)
      if (value.length > 4) formatted += ') ' + value.substring(4, 7)
      if (value.length > 7) formatted += '-' + value.substring(7, 11)
      e.target.value = formatted
      setPhone(formatted)
    } else {
      setPhone('')
    }
    validatePhone(e.target.value)
  }

  function validatePhone(value) {
    const digits = (value || phone).replace(/\D/g, '')
    const isValid = digits.length === 11
    setPhoneError(digits.length > 0 && !isValid)
    return isValid
  }

  function validateName(value) {
    const v = (value || fullName).trim()
    const isValid = v.length >= 2
    setNameError(fullName.length > 0 && !isValid)
    return isValid
  }

  function handleSubmit(e) {
    e.preventDefault()
    const nameValid = validateName()
    const phoneValid = validatePhone()
    if (!nameValid) return
    if (!phoneValid) return

    const formData = {
      fullName: fullName.trim(),
      phone: phone
    }
    localStorage.setItem('signupStep1', JSON.stringify(formData))
    navigate('/signup/2')
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
            <Link to="/login/" className="text-gray-700 hover:text-orange-500 font-medium text-base transition">Sign in</Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 md:p-10">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-2">
              <span className="text-orange-500">U-</span><span className="text-black">DO</span>
            </h1>
            <h2 className="text-xl font-semibold text-gray-900">You're just a few steps away from getting started</h2>
            <p className="text-gray-600 mt-2">Verify your number to continue with UDO</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
              <input
                type="text"
                id="fullName"
                value={fullName}
                onChange={(e) => { setFullName(e.target.value); validateName(e.target.value) }}
                required
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition ${
                  nameError ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Jane Smith"
              />
              {nameError && <p className="text-red-500 text-sm mt-1">Please enter your name</p>}
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
              <input
                type="tel"
                id="phone"
                value={phone}
                onChange={handlePhoneChange}
                required
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition ${
                  phoneError ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="+1 (555) 123-4567"
              />
              {phoneError && <p className="text-red-500 text-sm mt-1">Please enter a valid phone number</p>}
            </div>

            <div className="space-y-3 text-gray-500">
              <p className="text-xs">Message and data rates may apply</p>
              <p className="text-sm">You can unsubscribe at any time</p>
              <p className="flex items-center gap-1 text-sm">
                <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                </svg>
                <span>Your information is Secure & protected</span>
              </p>
              <p className="text-sm mb-6">Trusted by over 100s of delivery drivers</p>
            </div>

            <div className="h-24 hidden md:block"></div>
            <div className="h-8 md:hidden"></div>

            <button
              type="submit"
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3.5 px-6 rounded-lg text-lg transition duration-300 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
            >
              Continue
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>

            <p className="text-center text-sm text-gray-600">You'll stay signed in for faster access</p>
            <p className="text-xs text-gray-500 text-center leading-relaxed">
              By continuing, I agree to the <Link to="/terms/" className="text-orange-500 hover:underline">User Terms</Link>,{' '}
              <Link to="/privacy/" className="text-orange-500 hover:underline">Privacy Policy</Link> and I authorize U-DO and its partner technology companies to send me text notifications.
            </p>
          </form>

          <p className="text-center text-gray-600 mt-6">
            Already have an account?{' '}
            <Link to="/login/" className="text-orange-500 font-semibold hover:underline">Sign in</Link>
          </p>
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