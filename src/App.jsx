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
import AddFoodItem from './pages/AddFoodItem/AddFoodItem'

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
        <Route path="/addfooditem" element={<AddFoodItem />} />
        <Route path="/addfooditem/" element={<AddFoodItem />} />
        <Route path="/AddFoodItem" element={<AddFoodItem />} />
        <Route path="/AddFoodItem/" element={<AddFoodItem />} />
      </Routes>
    </div>
  )
}

export default App