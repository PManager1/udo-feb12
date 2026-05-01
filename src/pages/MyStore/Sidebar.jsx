import { useNavigate, useLocation } from 'react-router-dom';

const navItems = [
  { label: 'Menu Items', icon: '🍔', path: '/mystore' },
  { label: 'Orders', icon: '📋', path: '/mystore/orders' },
  { label: 'Analytics', icon: '📊', path: '/mystore/analytics' },
  { label: 'Reviews', icon: '⭐', path: '/mystore/reviews' },
  { label: 'Profit Calculator', icon: '💰', path: '/mystore/profit-calculator' },
];

const sidebarActions = [
  { label: 'Store Information', icon: '🏪', path: '/mystore/store-info' },
  { label: 'Settings', icon: '⚙️', path: '/mystore/settings' },
];

export default function Sidebar({ collapsed, setCollapsed }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNav = (path) => {
    navigate(path);
    setCollapsed(true); // auto-close on mobile after navigation
  };

  // Shared sidebar content
  const sidebarContent = (
    <>
      {/* Close / Collapse toggle */}
      <button
        onClick={() => setCollapsed(true)}
        className="p-3 flex items-center justify-center hover:bg-gray-100 transition border-b border-gray-100"
        title="Close sidebar"
      >
        <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7M19 19l-7-7 7-7" />
        </svg>
      </button>

      {/* Nav links */}
      <nav className="py-2">
        {navItems.map((item) => {
          const isActive = !item.disabled && location.pathname === item.path;
          return (
            <button
              key={item.label}
              onClick={() => !item.disabled && handleNav(item.path)}
              disabled={item.disabled}
              className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition
                ${isActive
                  ? 'bg-orange-50 text-orange-600 border-r-2 border-orange-500'
                  : item.disabled
                    ? 'text-gray-300 cursor-not-allowed'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }
              `}
              title={item.label}
            >
              <span className="text-lg flex-shrink-0">{item.icon}</span>
              <span>{item.label}</span>
              {item.disabled && (
                <span className="ml-auto text-[10px] bg-gray-100 text-gray-400 px-1.5 py-0.5 rounded">Soon</span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Actions */}
      <div className="py-2 border-t border-gray-100">
        {sidebarActions.map((item) => (
          <button
            key={item.label}
            onClick={() => handleNav(item.path)}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            title={item.label}
          >
            <span className="text-lg flex-shrink-0">{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </div>

      {/* Upload menu */}
      <div className="p-3 border-t border-gray-100">
        <label className="flex items-center gap-2 px-3 py-2 text-sm text-gray-500 hover:text-orange-500 hover:bg-orange-50 rounded-lg cursor-pointer transition">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          Upload Menu
          <input type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" />
        </label>
      </div>
    </>
  );

  return (
    <>
      {/* === MOBILE: Overlay sidebar === */}
      {/* Backdrop */}
      {!collapsed && (
        <div
          className="fixed inset-0 bg-black/40 z-[90] md:hidden"
          onClick={() => setCollapsed(true)}
        />
      )}
      {/* Slide-in panel */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-200 z-[95] flex flex-col transition-transform duration-300 md:hidden ${
          collapsed ? '-translate-x-full' : 'translate-x-0'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* === DESKTOP: Inline sidebar === */}
      {/* Collapsed: small floating open button */}
      {collapsed && (
        <button
          onClick={() => setCollapsed(false)}
          className="hidden md:block fixed top-0 left-0 z-[100] p-3 bg-white hover:bg-gray-100 border-r border-b border-gray-200 transition"
          title="Open sidebar"
        >
          <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
          </svg>
        </button>
      )}

      {/* Expanded: inline sidebar */}
      {!collapsed && (
        <aside className="hidden md:flex w-56 bg-white border-r border-gray-200 flex-col transition-all duration-300 flex-shrink-0">
          {sidebarContent}
        </aside>
      )}
    </>
  );
}