import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import Signup from './pages/Signup'
import VerifyOtp from './pages/VerifyOtp'
import Settings from './pages/Settings'
import ProSettings from './pages/ProSettings'
import Admin from './pages/Admin'
import AdminRestaurantOwners from './pages/AdminRestaurantOwners'
import SearchOverlayAdmin from './pages/SearchOverlayAdmin'
import MyStore from './pages/MyStore/MyStore'
import StoreInfoPage from './pages/MyStore/StoreInfoPage'
import SettingsPage from './pages/MyStore/SettingsPage'
import OrdersPage from './pages/MyStore/OrdersPage'
import AnalyticsPage from './pages/MyStore/AnalyticsPage'
import ReviewsPage from './pages/MyStore/ReviewsPage'

function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login/" element={<Login />} />
        <Route path="/signup/" element={<Signup />} />
        <Route path="/verifyOtp" element={<VerifyOtp />} />
        <Route path="/settings/" element={<Settings />} />
        <Route path="/pro-settings/" element={<ProSettings />} />
        <Route path="/admin/" element={<Admin />} />
        <Route path="/admin/restaurant-owners/" element={<AdminRestaurantOwners />} />
        <Route path="/searchOverlayAdmin/" element={<SearchOverlayAdmin />} />
        <Route path="/mystore" element={<MyStore />} />
        <Route path="/mystore/" element={<MyStore />} />
        <Route path="/mystore/store-info" element={<StoreInfoPage />} />
        <Route path="/mystore/settings" element={<SettingsPage />} />
        <Route path="/mystore/orders" element={<OrdersPage />} />
        <Route path="/mystore/analytics" element={<AnalyticsPage />} />
        <Route path="/mystore/reviews" element={<ReviewsPage />} />
      </Routes>
    </div>
  )
}

export default App