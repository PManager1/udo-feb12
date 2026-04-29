import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'

function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [mobileDropdownOpen, setMobileDropdownOpen] = useState(false)
  const [desktopDropdownOpen, setDesktopDropdownOpen] = useState(false)
  const [whyReadMore, setWhyReadMore] = useState(false)

  // User info state
  const [userName, setUserName] = useState('John Doe')
  const [userEmail, setUserEmail] = useState('john.doe@email.com')
  const [userInitials, setUserInitials] = useState('JD')

  const mobileDropdownRef = useRef(null)
  const desktopDropdownRef = useRef(null)

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (mobileDropdownRef.current && !mobileDropdownRef.current.contains(e.target)) {
        setMobileDropdownOpen(false)
      }
      if (desktopDropdownRef.current && !desktopDropdownRef.current.contains(e.target)) {
        setDesktopDropdownOpen(false)
      }
    }
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        setMobileDropdownOpen(false)
        setDesktopDropdownOpen(false)
      }
    }
    document.addEventListener('click', handleClickOutside)
    document.addEventListener('keydown', handleEsc)
    return () => {
      document.removeEventListener('click', handleClickOutside)
      document.removeEventListener('keydown', handleEsc)
    }
  }, [])

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [mobileMenuOpen])

  const handleSignOut = (e) => {
    e.preventDefault()
    localStorage.removeItem('jwt_token')
    localStorage.removeItem('user')
    localStorage.removeItem('loginEmail')
    localStorage.removeItem('userPhone')
    localStorage.removeItem('signupStep1')
    localStorage.removeItem('signupStep2')
    window.location.href = '/login/'
  }

  return (
    <>
      {/* Mobile Menu Overlay */}
      <div
        className={`flex lg:hidden relative ${mobileMenuOpen ? 'fixed inset-0 bg-white z-[9999] flex-col p-4 px-8 pb-8' : 'hidden'}`}
      >
        <button
          onClick={() => setMobileMenuOpen(false)}
          className="absolute top-4 right-4 p-2 text-gray-800 z-10"
        >
          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="w-full flex justify-center items-center mb-12">
          <div className="text-3xl font-bold">
            <span className="text-orange-500">U <span className="-mx-1"></span>-</span><span className="text-gray-800">DO</span>
          </div>
        </div>
        <nav className="flex flex-col gap-6 w-full">
          <Link to="/login/" className="text-2xl font-bold text-gray-800 border-b border-gray-100 pb-4 w-full">Sign in</Link>
          <Link to="/signup/" className="bg-orange-500 text-white text-xl font-bold py-4 px-8 rounded-full shadow-md text-center mt-4">Join</Link>
        </nav>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="absolute left-6 sm:left-12 top-1/2 -translate-y-1/2 z-[60] hover:opacity-90 transition">
          <Link to="/" className="text-3xl sm:text-4xl font-bold">
            <span className="text-orange-500">U <span className="-mx-1"></span>-</span><span className="text-gray-800">DO</span>
            <span className="ml-1 text-[0.55em] sm:text-[0.6em] font-medium text-black lowercase whitespace-nowrap">(you do) </span>
            <p className="text-sm text-gray-600 font-medium -mt-1">let someone do it for you</p>
          </Link>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
          <div className="w-48 hidden lg:block"></div>

          <div className="flex-1 max-w-3xl hidden lg:block">
            <div className="relative">
              <input
                type="text"
                placeholder="Search"
                className="w-full pl-5 pr-12 py-3.5 bg-[#DADAD3] border border-gray-300 rounded-full text-base focus:outline-none focus:ring-2 focus:ring-gray-400/50 transition shadow-sm cursor-pointer"
                readOnly
              />
              <button className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile buttons */}
          <div className="flex items-center gap-2 lg:hidden ml-auto">
            <button className="p-3 rounded-full hover:bg-gray-100 transition-colors">
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>

            {/* Mobile User Profile Dropdown */}
            <div className="relative" ref={mobileDropdownRef}>
              <button
                onClick={(e) => { e.stopPropagation(); setMobileDropdownOpen(!mobileDropdownOpen) }}
                className="flex items-center gap-2 px-2 py-1.5 rounded-full hover:bg-gray-100 transition-colors border border-gray-200"
              >
                <div className="w-7 h-7 bg-orange-500 rounded-full flex items-center justify-center text-white font-semibold text-xs">
                  {userInitials}
                </div>
                <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {mobileDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-gray-200 z-[100] overflow-hidden">
                  <div className="px-5 py-4 border-b border-gray-100">
                    <p className="text-sm font-semibold text-gray-900">{userName}</p>
                    <p className="text-xs text-gray-500">{userEmail}</p>
                  </div>
                  <div className="py-2">
                    <Link to="/settings/" className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition">
                      <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="text-sm font-medium text-gray-900">Profile Settings</span>
                    </Link>
                  </div>
                  <div className="border-t border-gray-100 pt-2">
                    <button onClick={handleSignOut} className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition text-red-600 w-full">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      <span className="text-sm font-medium">Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 rounded-lg hover:bg-gray-100 transition"
            >
              <svg className="w-8 h-8 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>

          {/* Desktop User Profile Dropdown */}
          <div className="hidden lg:flex items-center gap-6">
            <div className="relative" ref={desktopDropdownRef}>
              <button
                onClick={(e) => { e.stopPropagation(); setDesktopDropdownOpen(!desktopDropdownOpen) }}
                className="flex items-center gap-2 px-3 py-2 rounded-full hover:bg-gray-100 transition-colors border border-gray-200"
              >
                <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                  {userInitials}
                </div>
                <span className="text-sm font-medium text-gray-700">{userName}</span>
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {desktopDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 overflow-hidden">
                  <div className="px-5 py-4 border-b border-gray-100">
                    <p className="text-sm font-semibold text-gray-900">{userName}</p>
                    <p className="text-xs text-gray-500">{userEmail}</p>
                  </div>
                  <div className="py-2">
                    <Link to="/settings/" className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition">
                      <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="text-sm font-medium text-gray-900">Profile Settings</span>
                    </Link>
                  </div>
                  <div className="border-t border-gray-100 pt-2">
                    <button onClick={handleSignOut} className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition text-red-600 w-full">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      <span className="text-sm font-medium">Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full px-16 sm:px-24 lg:px-32 py-10 bg-white">
        {/* Big Title + Subtitle */}
        <div className="text-center mb-10">
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight mb-3">
            <div className="flex items-center justify-center sm:gap-4 relative">
              <div className="relative inline-flex items-center font-bold">
                <span>
                  <span className="font-extrabold text-[#E65100]">U-</span><span className="font-extrabold text-black">DO</span>
                </span>
                <span className="absolute left-full ml-1 text-[0.45em] sm:text-[0.5em] font-medium text-black lowercase whitespace-nowrap">
                  (you do)
                </span>
              </div>
            </div>
          </h1>
          <p className="text-xl sm:text-2xl text-black font-bold">
            Let someone do it for you.
          </p>
          <div className="mt-3 flex gap-4 justify-center flex-wrap">
            <Link to="/profiles-list/" className="inline-block bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-8 rounded-full text-lg transition duration-300 shadow-md hover:shadow-lg cursor-pointer">
              Browse Professionals
            </Link>
          </div>

          {/* Trust Badges */}
          <div className="mt-1 flex items-center justify-center gap-1.5 text-black text-sm whitespace-nowrap">
            <span className="font-medium">All pros verified</span>
            <svg className="w-4 h-4 text-green-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
            </svg>
            <svg className="w-4 h-4 text-blue-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
            </svg>
          </div>

          <p className="text-xl sm:text-2xl text-black font-light mt-6">
            Select the best. Skip the (middleman) commission.
          </p>
        </div>

        {/* Grid of image cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-5 md:gap-x-12 md:gap-y-6">
          <a href="/foods" className="group relative rounded-3xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 bg-white h-[351px] w-[96%] mx-auto cursor-pointer">
            <div className="absolute top-4 right-4 z-10">
              <span className="bg-orange-500 text-white text-[10px] font-bold px-3 py-1.5 rounded-full shadow-lg border border-orange-600 uppercase tracking-wider">now hiring</span>
            </div>
            <img src="/img/food/Pizza2.png" alt="Food delivery" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
            <div className="absolute bottom-5 left-5 text-white"><p className="text-xs uppercase tracking-wider opacity-90">Order now</p><p className="text-4xl font-semibold">Food delivery</p></div>
          </a>

          <a href="/profiles-list/?category=furniture-assembly" className="group relative rounded-3xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 bg-white h-[351px] w-[96%] mx-auto cursor-pointer">
            <img src="https://cdn.squareone.ca/wp-content/uploads/2022/03/31153420/what-is-a-couch.jpg?auto=format&fit=crop&w=800&q=80" alt="Furniture assembly" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
            <div className="absolute bottom-5 left-5 text-white"><p className="text-xs uppercase tracking-wider opacity-90">Trending now</p><p className="text-4xl font-semibold">Furniture assembly</p></div>
          </a>

          <a href="/profiles-list/?category=mount-art-shelves" className="group relative rounded-3xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 bg-white h-[351px] w-[96%] mx-auto cursor-pointer">
            <img src="https://images.unsplash.com/photo-1532453288672-3a27e9be9efd?auto=format&fit=crop&w=800&q=80" alt="Mount art or shelves" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
            <div className="absolute bottom-5 left-5 text-white"><p className="text-xs uppercase tracking-wider opacity-90">Home improvement</p><p className="text-4xl font-semibold">Mount art or shelves</p></div>
          </a>

          <a href="/mover" className="group relative rounded-3xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 bg-white h-[351px] w-[96%] mx-auto cursor-pointer">
            <img src="/img/movers/local-moving.jpg" alt="Movers" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
            <div className="absolute bottom-5 left-5 text-white"><p className="text-xs uppercase tracking-wider opacity-90">Professional help</p><p className="text-4xl font-semibold">Movers</p></div>
          </a>

          <a href="/profiles-list/?category=electrical-help" className="group relative rounded-3xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 bg-white h-[351px] w-[96%] mx-auto cursor-pointer">
            <img src="https://hnh-services.com/wp-content/uploads/2023/02/electrical-sdf23.png?auto=format&fit=crop&w=800&q=80" alt="Electrical help" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
            <div className="absolute bottom-5 left-5 text-white"><p className="text-xs uppercase tracking-wider opacity-90">Expert service</p><p className="text-4xl font-semibold">Electrical help</p></div>
          </a>

          <a href="/profiles-list/?category=plumbing-help" className="group relative rounded-3xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 bg-white h-[351px] w-[96%] mx-auto cursor-pointer">
            <img src="https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=800&q=80" alt="Plumbing help" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
            <div className="absolute bottom-5 left-5 text-white"><p className="text-xs uppercase tracking-wider opacity-90">Reliable service</p><p className="text-4xl font-semibold">Plumbing help</p></div>
          </a>

          <a href="/profiles-list/?category=cleaning-help" className="group relative rounded-3xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 bg-white h-[351px] w-[96%] mx-auto cursor-pointer">
            <img src="https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=800&q=80" alt="Cleaning help" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
            <div className="absolute bottom-5 left-5 text-white"><p className="text-xs uppercase tracking-wider opacity-90">Fresh & clean</p><p className="text-4xl font-semibold">Cleaning help</p></div>
          </a>
        </div>
      </main>

      {/* Client benefit section */}
      <section className="bg-orange-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-8 items-center">
            <div className="flex-1">
              <img src="/img/test/Client.webp" alt="Professional at work" className="w-full h-full object-cover rounded-2xl shadow-lg" />
            </div>
            <div className="flex-1 flex flex-col justify-center">
              <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">Get the Help You Need, When You Need It</h2>
              <p className="text-lg text-gray-600 leading-relaxed mb-8">
                <span className="text-base font-normal text-gray-700">Let somebody else do it for you. </span>
                Connect with local professionals for any task around your home. From furniture assembly to home repairs, we make it easy to find skilled help at fair prices. No middleman, no hidden fees, just quality service you can trust.
              </p>
              <Link to="/profiles-list/" className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-4 px-8 rounded-full text-lg transition duration-300 shadow-md hover:shadow-lg w-fit inline-block mt-8">
                Browse Professionals
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Why UDo? Section */}
      <section className="py-16 md:py-20 bg-gradient-to-b from-white to-orange-50/30">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6">
            Why <span className="text-orange-500">U</span>Do?
          </h2>
          <p className="text-xl md:text-2xl text-gray-700 font-light mb-8 max-w-3xl mx-auto">
            No commissions. Pros keep 100% of what they earn. You get fair prices without middleman fees or big tech cuts.
          </p>
          <p className="text-2xl md:text-3xl font-semibold text-gray-800 mb-8 max-w-4xl mx-auto">
            Why does everything have to be about corporate greed?
          </p>
          <div className="text-left md:text-center">
            {whyReadMore && (
              <div className="max-h-[800px] md:max-h-[600px] overflow-hidden">
                <div className="prose prose-lg mx-auto mt-8">
                  <p className="mb-6 text-gray-700">
                    A huge part of today's workforce is navigating the gig economy — relying on app-based tasks and freelance gigs instead of traditional jobs — often facing unpredictable income and a constant struggle.
                  </p>
                  <p className="mb-6 text-gray-700">
                    We believe everyone deserves financial stability and dignity of putting food on the table. That's why we built UDo: to level the playing field, empower gig workers to build sustainable livelihoods, and free them (and you) from corporate pressures.
                  </p>
                  <div className="my-10 p-6 md:p-8 bg-orange-50 rounded-2xl border border-orange-100">
                    <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">📱 Why use the UDo App?</h3>
                    <p className="text-lg leading-relaxed text-gray-700">
                      When you find a pro through Google, big tech takes a cut.
                      <strong>With UDo, that money stays with you and the worker.</strong><br /><br />
                      We bypass expensive search ads and middleman fees — so pros keep <span className="font-bold text-orange-600">100%</span> of what they earn, and you skip the hidden premium just to find help.
                    </p>
                  </div>
                  <p className="text-xl md:text-2xl font-semibold text-gray-800 mt-8">
                    Don't stress it. <span className="text-orange-500">UDo</span> it.
                  </p>
                  <p className="text-lg text-gray-600">Too busy? 👉 UDo it. Need help? 👉 UDo it.</p>
                </div>
              </div>
            )}
            <button
              onClick={() => setWhyReadMore(!whyReadMore)}
              className="inline-block mt-6 cursor-pointer text-orange-500 hover:text-orange-600 font-medium text-lg transition flex items-center justify-center gap-2 group mx-auto"
            >
              <span>{whyReadMore ? 'Show less' : 'Read more about our mission'}</span>
              <svg className={`w-5 h-5 transition-transform ${whyReadMore ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        </div>
      </section>

      {/* Sign up as Professional */}
      <section className="bg-white py-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-8 items-center">
            <div className="flex-1 flex flex-col justify-center">
              <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">Sign up and start earning today.</h2>
              <p className="text-lg text-gray-600 leading-relaxed mb-8">
                Join our professional network and connect with customers. Set your own rates, choose your jobs, and keep 100% of what you earn—no middleman, no commissions.
              </p>
              <a href="/join-as-professional/" className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-4 px-8 rounded-full text-lg transition duration-300 shadow-md hover:shadow-lg w-fit inline-block">
                Join as Professional
              </a>
            </div>
            <div className="flex-1">
              <img src="/img/girl4.png" alt="Professional at work" className="w-full h-full object-cover rounded-2xl shadow-lg" />
            </div>
          </div>
        </div>
      </section>

      {/* Download Section */}
      <section className="bg-gray-50 py-16 px-6">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900 italic">
            Its fun letting someone do it for you. <br />
            Stop scrolling, start 'UDo-ing.' Grab the app and reclaim your weekend.
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-200 flex flex-col lg:flex-row items-center justify-between gap-6 hover:shadow-md transition-all w-full">
              <div className="flex-1 text-center lg:text-left">
                <span className="text-blue-600 font-bold text-sm uppercase tracking-widest">For You</span>
                <h3 className="text-2xl font-extrabold text-gray-900 mt-1">Download UDo</h3>
                <p className="text-gray-600 mt-3 text-base leading-relaxed">Let somebody do it for you. Skip the "Google Tax" and book directly.</p>
                <div className="mt-6 flex justify-center lg:justify-start gap-4">
                  <div className="h-11 w-32 bg-[#CC5500] hover:bg-[#A84400] rounded-xl flex items-center justify-center text-white text-[10px] font-bold">App Store</div>
                  <div className="h-11 w-32 bg-[#CC5500] hover:bg-[#A84400] rounded-xl flex items-center justify-center text-white text-[10px] font-bold">Google Play</div>
                </div>
              </div>
              <div className="hidden lg:flex flex-col items-center bg-gray-50 p-4 rounded-2xl border border-gray-100">
                <div className="w-28 h-28 bg-white rounded-lg mb-3 flex items-center justify-center border-2 border-dashed border-gray-200 text-gray-400 text-xs">QR Code</div>
                <p className="text-[10px] uppercase tracking-tighter font-black text-gray-400">Scan to download</p>
              </div>
            </div>
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-200 flex flex-col lg:flex-row items-center justify-between gap-6 hover:shadow-md transition-all w-full">
              <div className="flex-1 text-center lg:text-left">
                <span className="text-green-600 font-bold text-sm uppercase tracking-widest">For Pros</span>
                <h3 className="text-2xl font-extrabold text-gray-900 mt-1">Download UDo Pro</h3>
                <p className="text-gray-600 mt-3 text-base leading-relaxed">Keep 100% of what you earn. No middleman, no commissions.</p>
                <div className="mt-6 flex justify-center lg:justify-start gap-4">
                  <div className="h-11 w-32 bg-[#CC5500] hover:bg-[#A84400] rounded-xl flex items-center justify-center text-white text-[10px] font-bold">App Store</div>
                  <div className="h-11 w-32 bg-[#CC5500] hover:bg-[#A84400] rounded-xl flex items-center justify-center text-white text-[10px] font-bold">Google Play</div>
                </div>
              </div>
              <div className="hidden lg:flex flex-col items-center bg-gray-50 p-4 rounded-2xl border border-gray-100">
                <div className="w-28 h-28 bg-white rounded-lg mb-3 flex items-center justify-center border-2 border-dashed border-gray-200 text-gray-400 text-xs text-center">QR Code</div>
                <p className="text-[10px] uppercase tracking-tighter font-black text-gray-400">Scan to download</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#b0b0a8] text-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
            <div>
              <h3 className="text-2xl font-bold mb-4">
                <span className="text-orange-500">U <span className="-mx-1"></span>-</span><span className="text-gray-800">DO</span>
              </h3>
              <p className="text-gray-700 text-sm leading-relaxed">
                <span className="text-base font-normal text-gray-700">UDO: Let somebody else do it for you.</span>
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4 text-gray-800">Quick Links</h4>
              <ul className="space-y-2">
                <li><Link to="/" className="text-gray-700 hover:text-orange-500 transition">Home</Link></li>
                <li><Link to="/profiles-list/" className="text-gray-700 hover:text-orange-500 transition">Services</Link></li>
                <li><a href="/join-as-professional/" className="text-gray-700 hover:text-orange-500 transition">Join as Pro</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4 text-gray-800">Support</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-700 hover:text-orange-500 transition">Help Center</a></li>
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
              <div className="relative">
                <select className="w-full bg-white text-gray-800 border border-gray-400 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer appearance-none pr-8">
                  <option value="en">English</option>
                  <option value="es">Español</option>
                  <option value="fr">Français</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-400 mt-10 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-700 text-sm mb-4 md:mb-0">© 2026 UDo, Inc. All rights reserved.</p>
            <div className="flex space-x-6">
              <a href="https://x.com/GetABirdy" target="_blank" className="text-gray-600 hover:text-orange-500 transition">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
              </a>
              <a href="https://www.instagram.com/getbirdy/" target="_blank" className="text-gray-600 hover:text-orange-500 transition">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.072 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              </a>
              <a href="https://www.facebook.com/birdyapp" target="_blank" className="text-gray-600 hover:text-orange-500 transition">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z"/></svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </>
  )
}

export default HomePage