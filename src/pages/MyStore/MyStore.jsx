import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import StoreBrandInfo from './StoreBrandInfo';
import ItemDrawer from './ItemDrawer';
import CategoryModal from './CategoryModal';
import ModifierGroupModal from './ModifierGroupModal';
import Toast from './Toast';
import { hasValidToken, handleSignOut } from './tokenHelper';
import * as api from './api';

// Context for sharing state across components
const AppContext = createContext(null);
export const useApp = () => useContext(AppContext);

export default function MyStore() {
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [syncStatus, setSyncStatus] = useState('checking'); // checking | online | offline | error

  // Data
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [modifierGroups, setModifierGroups] = useState([]);
  const [restaurantName, setRestaurantName] = useState('Restaurant Name');
  const [logoUrl, setLogoUrl] = useState('');

  // Views
  const [currentCategory, setCurrentCategory] = useState(null); // null = dashboard, id = category detail
  const [categoryItems, setCategoryItems] = useState([]);

  // Toast
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  // Drawers/Modals
  const [itemDrawerOpen, setItemDrawerOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [modifierModalOpen, setModifierModalOpen] = useState(false);
  const [editingModifierGroup, setEditingModifierGroup] = useState(null);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  }, []);

  // Load all data
  const loadAllData = useCallback(async () => {
    try {
      const [cats, allItems, groups, profile] = await Promise.all([
        api.getCategories().catch(() => []),
        api.getItems().catch(() => []),
        api.getModifierGroups().catch(() => []),
        api.getProfile().catch(() => ({})),
      ]);
      setCategories(cats);
      setItems(allItems);
      setModifierGroups(groups);
      const name = profile.restaurantName || profile.storeName || profile.name || 'Restaurant Name';
      setRestaurantName(name);
      if (profile.logoURL || profile.logo) setLogoUrl(profile.logoURL || profile.logo);
      setSyncStatus('online');
    } catch (err) {
      console.error('Failed to load data:', err);
      setSyncStatus('error');
    } finally {
      setLoading(false);
    }
  }, []);

  // Init
  useEffect(() => {
    if (!hasValidToken()) {
      navigate('/login/');
      return;
    }
    localStorage.removeItem('udo-signed-out');
    api.healthCheck().then(ok => setSyncStatus(ok ? 'online' : 'offline'));
    loadAllData();
  }, [navigate, loadAllData]);

  // Search
  const filteredItems = searchQuery
    ? items.filter(i =>
        (i.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (i.description || '').toLowerCase().includes(searchQuery.toLowerCase())
      )
    : items;

  // Category detail view
  const openCategoryDetail = useCallback(async (catId) => {
    setCurrentCategory(catId);
    try {
      const catItems = await api.getItemsByCategory(catId);
      setCategoryItems(catItems);
    } catch {
      setCategoryItems(items.filter(i => (i.categoryId || i.category_id) === catId));
    }
  }, [items]);

  const showDashboard = useCallback(() => {
    setCurrentCategory(null);
    setCategoryItems([]);
  }, []);

  // Logo upload
  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const url = await api.uploadImageToGCS(file);
      await api.updateProfile({ logoURL: url });
      setLogoUrl(url);
      showToast('Logo updated!');
    } catch (err) {
      showToast('Failed to upload logo', 'error');
    }
  };

  // Delete item
  const handleDeleteItem = async (id) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    try {
      await api.deleteItem(id);
      showToast('Item deleted!');
      loadAllData();
      if (currentCategory) openCategoryDetail(currentCategory);
    } catch {
      showToast('Failed to delete item', 'error');
    }
  };

  // Toggle availability
  const handleToggleAvailability = async (type, id) => {
    try {
      if (type === 'item') {
        await api.toggleItemAvailability(id);
      } else if (type === 'category') {
        const cat = categories.find(c => c.id === id);
        const newStatus = !(cat?.available ?? cat?.isActive ?? false);
        await api.updateCategory(id, { available: newStatus });
      }
      showToast('Availability updated');
      loadAllData();
    } catch {
      showToast('Failed to toggle availability', 'error');
    }
  };

  // Open item drawer
  const openItemDrawer = (itemId = null) => {
    setEditingItem(itemId);
    setItemDrawerOpen(true);
  };
  const closeItemDrawer = () => {
    setItemDrawerOpen(false);
    setEditingItem(null);
  };

  // Open category modal
  const openCategoryModal = (catId = null) => {
    setEditingCategory(catId);
    setCategoryModalOpen(true);
  };
  const closeCategoryModal = () => {
    setCategoryModalOpen(false);
    setEditingCategory(null);
  };

  // Open modifier modal
  const openModifierModal = (groupId = null) => {
    setEditingModifierGroup(groupId);
    setModifierModalOpen(true);
  };
  const closeModifierModal = () => {
    setModifierModalOpen(false);
    setEditingModifierGroup(null);
  };

  const contextValue = {
    categories, items: filteredItems, modifierGroups, restaurantName, logoUrl,
    currentCategory, categoryItems, allItems: items,
    showToast, loadAllData, openCategoryDetail, showDashboard,
    handleDeleteItem, handleToggleAvailability, handleLogoUpload,
    openItemDrawer, closeItemDrawer, openCategoryModal, closeCategoryModal,
    openModifierModal, closeModifierModal,
  };

  // Sync status indicator
  const syncIcon = syncStatus === 'online'
    ? { bg: 'bg-green-100', dot: 'bg-green-500 animate-pulse', text: 'text-green-700', label: 'Online' }
    : syncStatus === 'error'
    ? { bg: 'bg-red-100', dot: 'bg-red-500', text: 'text-red-700', label: 'Error' }
    : { bg: 'bg-gray-100', dot: 'bg-gray-400', text: 'text-gray-600', label: syncStatus === 'offline' ? 'Offline' : 'Checking...' };

  const currentCatObj = currentCategory ? categories.find(c => c.id === currentCategory) : null;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f9f7f5]">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 font-medium">Loading menu...</p>
        </div>
      </div>
    );
  }

  return (
    <AppContext.Provider value={contextValue}>
      <div className="min-h-screen flex bg-[#f9f7f5]">
        {/* Sidebar */}
        <Sidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />

        {/* Main content area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
              {/* Logo + Restaurant */}
              <div className="flex items-center gap-3 flex-shrink-0">
                <label className="relative cursor-pointer group" title="Click to upload logo">
                  <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                  {logoUrl ? (
                    <img src={logoUrl} alt="Logo" className="w-10 h-10 rounded-full object-cover border-2 border-gray-200 group-hover:opacity-80 transition" />
                  ) : (
                    <div className="w-10 h-10 rounded-full border-2 border-dashed border-gray-300 bg-gray-50 flex items-center justify-center group-hover:border-orange-400 transition">
                      <svg className="w-5 h-5 text-gray-400 group-hover:text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                </label>
                <div>
                  <a href="/merchant/" className="text-sm font-bold text-orange-500 hover:text-orange-600 transition">{restaurantName}</a>
                </div>
              </div>

              {/* Search */}
              <div className="flex-1 max-w-xl">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search menu items..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-5 pr-12 py-3 bg-[#DADAD3] border border-gray-300 rounded-full text-base focus:outline-none focus:ring-2 focus:ring-gray-400/50 transition shadow-sm"
                  />
                  <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>

              {/* Right side */}
              <div className="flex items-center gap-4 flex-shrink-0">
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${syncIcon.bg} ${syncIcon.text}`}>
                  <div className={`w-2 h-2 rounded-full ${syncIcon.dot}`} />
                  <span>{syncIcon.label}</span>
                </div>
                <span className="text-sm text-gray-600 hidden lg:inline">UDO: 15%</span>
                <button onClick={handleSignOut} className="text-gray-700 hover:text-orange-500 font-medium text-sm transition">Sign out</button>
              </div>
            </div>
          </header>

          {/* Content */}
          <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
            {/* Category Detail View */}
            {currentCatObj ? (
              <div>
                <button onClick={showDashboard} className="mb-6 flex items-center gap-2 text-gray-600 hover:text-orange-500 font-medium transition">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Back to Dashboard
                </button>
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">{currentCatObj.icon || '🍽️'} {currentCatObj.name || currentCatObj.title}</h1>
                    <p className="text-gray-600 mt-1">{currentCatObj.description || ''}</p>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => openCategoryModal(currentCatObj.id)} className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2 px-4 rounded-lg transition">
                      Manage Category
                    </button>
                    <button onClick={() => openItemDrawer(null)} className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-lg transition">
                      Add Item
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {categoryItems.map(item => (
                    <ItemCard key={item.id} item={item} onEdit={() => openItemDrawer(item.id)} onDelete={() => handleDeleteItem(item.id)} onToggle={() => handleToggleAvailability('item', item.id)} />
                  ))}
                  {categoryItems.length === 0 && (
                    <div className="col-span-full text-center py-12 text-gray-400">No items in this category yet</div>
                  )}
                </div>
              </div>
            ) : (
              /* Dashboard View */
              <div>
                {/* Title bar */}
                <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center mb-8 gap-4">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">My Store</h1>
                    <p className="text-gray-600 mt-1">Manage your menu items and modifiers</p>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => openCategoryModal(null)} className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 px-6 rounded-full text-lg transition shadow-sm hover:shadow-md flex items-center gap-2">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                      Add Category
                    </button>
                    <button onClick={() => openItemDrawer(null)} className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-full text-lg transition shadow-sm hover:shadow-md flex items-center gap-2">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                      Add New Item
                    </button>
                  </div>
                </div>

                {/* Store Brand Info */}
                <StoreBrandInfo />


                {/* All Menu Items */}
                <div className="mb-12">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">All Menu Items</h2>
                    <span className="text-sm text-gray-600">{filteredItems.length} items</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredItems.map(item => (
                      <ItemCard key={item.id} item={item} onEdit={() => openItemDrawer(item.id)} onDelete={() => handleDeleteItem(item.id)} onToggle={() => handleToggleAvailability('item', item.id)} />
                    ))}
                    {filteredItems.length === 0 && (
                      <div className="col-span-full text-center py-12 text-gray-400">
                        {searchQuery ? 'No items match your search' : 'No items yet — click "Add New Item" to get started!'}
                      </div>
                    )}
                  </div>
                </div>

                {/* Categories */}
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Categories</h2>
                    <span className="text-sm text-gray-600">{categories.length} categories</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {categories.map(cat => {
                      const catItemCount = items.filter(i => (i.categoryId || i.category_id) === cat.id).length;
                      return (
                        <div key={cat.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden"
                          onClick={() => openCategoryDetail(cat.id)}>
                          <div className="h-32 flex items-center justify-center text-5xl" style={{ background: `${cat.color || '#f97316'}15` }}>
                            {cat.icon || '🍽️'}
                          </div>
                          <div className="p-4">
                            <h3 className="font-bold text-gray-900">{cat.name || cat.title}</h3>
                            <p className="text-sm text-gray-500 mt-1">{catItemCount} item{catItemCount !== 1 ? 's' : ''}</p>
                            {cat.description && <p className="text-xs text-gray-400 mt-1 line-clamp-2">{cat.description}</p>}
                            <div className="flex gap-2 mt-3">
                              <button onClick={(e) => { e.stopPropagation(); openCategoryModal(cat.id); }} className="text-xs text-orange-500 hover:text-orange-600 font-medium">Edit</button>
                              <button onClick={(e) => { e.stopPropagation(); handleToggleAvailability('category', cat.id); }}
                                className={`text-xs font-medium ${(cat.available ?? cat.isActive) ? 'text-green-600' : 'text-red-500'}`}>
                                {(cat.available ?? cat.isActive) ? 'Active' : 'Inactive'}
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    {categories.length === 0 && (
                      <div className="col-span-full text-center py-12 text-gray-400">No categories yet — click "Add Category" to get started!</div>
                    )}
                  </div>
                </div>

                {/* Modifier Groups */}
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Modifier Groups</h2>
                    <button onClick={() => openModifierModal(null)} className="text-sm text-orange-500 hover:text-orange-600 font-bold flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                      Add Modifier Group
                    </button>
                  </div>
                  {modifierGroups.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {modifierGroups.map(group => (
                        <div key={group.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition cursor-pointer"
                          onClick={() => openModifierModal(group.id)}>
                          <div className="flex items-center justify-between">
                            <h3 className="font-bold text-gray-900">{group.name}</h3>
                            <span className="text-xs text-gray-400">{group.options?.length || 0} options</span>
                          </div>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {group.options?.slice(0, 4).map(opt => (
                              <span key={opt.id} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{opt.name}{opt.extraPrice > 0 ? ` +$${opt.extraPrice}` : ''}</span>
                            ))}
                            {(group.options?.length || 0) > 4 && <span className="text-xs text-gray-400">+{(group.options?.length || 0) - 4} more</span>}
                          </div>
                          <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                            <span>{group.minSelection === 1 && group.maxSelection === 1 ? 'Single' : `Min ${group.minSelection}, Max ${group.maxSelection}`}</span>
                            {group.isRequired && <span className="text-orange-500 font-medium">Required</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-400 text-center py-8">No modifier groups yet — create one to add options like sizes, toppings, etc.</p>
                  )}
                </div>
              </div>
            )}
          </main>
        </div>

        {/* Drawers & Modals */}
        {itemDrawerOpen && (
          <ItemDrawer itemId={editingItem} onClose={closeItemDrawer} />
        )}
        {categoryModalOpen && (
          <CategoryModal categoryId={editingCategory} onClose={closeCategoryModal} />
        )}
        {modifierModalOpen && (
          <ModifierGroupModal groupId={editingModifierGroup} onClose={closeModifierModal} />
        )}

        {/* Toast */}
        {toast.show && <Toast message={toast.message} type={toast.type} />}
      </div>
    </AppContext.Provider>
  );
}

// Item Card component with image carousel
function ItemCard({ item, onEdit, onDelete, onToggle }) {
  const [slideIdx, setSlideIdx] = useState(0);
  const images = (() => {
    try {
      const parsed = JSON.parse(item.imageUrl || item.image_url || '[]');
      return Array.isArray(parsed) ? parsed : [parsed];
    } catch { return [item.imageUrl || item.image_url].filter(Boolean); }
  })();

  const isAvailable = item.isAvailable !== undefined ? item.isAvailable : (item.available !== false);
  const price = item.basePrice || item.base_price || 0;
  const name = item.name || 'Untitled';
  const promo = item.promoText || item.promo_text || '';

  const prevSlide = (e) => { e.stopPropagation(); setSlideIdx(i => (i - 1 + images.length) % images.length); };
  const nextSlide = (e) => { e.stopPropagation(); setSlideIdx(i => (i + 1) % images.length); };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 overflow-hidden group">
      <div className="relative h-40 bg-gray-100 overflow-hidden">
        {images.length > 0 ? (
          <div className="relative w-full h-full">
            <div className="flex transition-transform duration-300 h-full" style={{ transform: `translateX(-${slideIdx * 100}%)` }}>
              {images.map((url, i) => (
                <img key={i} src={url} alt={`${name} ${i + 1}`} className="w-full h-full object-cover flex-shrink-0" />
              ))}
            </div>
            {/* Carousel arrows */}
            {images.length > 1 && (
              <>
                <button onClick={prevSlide}
                  className="carousel-arrow left absolute left-1.5 top-1/2 -translate-y-1/2 w-7 h-7 bg-white/80 hover:bg-white rounded-full shadow flex items-center justify-center opacity-0 group-hover:opacity-100 transition text-gray-600 text-sm">
                  ‹
                </button>
                <button onClick={nextSlide}
                  className="carousel-arrow right absolute right-1.5 top-1/2 -translate-y-1/2 w-7 h-7 bg-white/80 hover:bg-white rounded-full shadow flex items-center justify-center opacity-0 group-hover:opacity-100 transition text-gray-600 text-sm">
                  ›
                </button>
                {/* Dots */}
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                  {images.map((_, i) => (
                    <button key={i} onClick={(e) => { e.stopPropagation(); setSlideIdx(i); }}
                      className={`w-2 h-2 rounded-full transition ${i === slideIdx ? 'bg-orange-500 scale-110' : 'bg-white/80'}`} />
                  ))}
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        {/* Availability toggle */}
        <button onClick={(e) => { e.stopPropagation(); onToggle(); }}
          className={`absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center transition shadow z-10 ${
            isAvailable ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
          {isAvailable ? (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          )}
        </button>
        {/* Promo badge */}
        {promo && (
          <span className="absolute bottom-2 left-2 bg-orange-500 text-white text-[11px] font-bold px-2 py-0.5 rounded-full shadow z-10">{promo}</span>
        )}
        {/* Image count badge */}
        {images.length > 1 && (
          <span className="absolute top-2 left-2 bg-black/50 text-white text-[11px] px-1.5 py-0.5 rounded-full z-10">{images.length} photos</span>
        )}
      </div>
      <div className="p-4">
        <div className="flex justify-between items-start">
          <h3 className="font-bold text-gray-900 text-sm line-clamp-1">{name}</h3>
          <span className="text-orange-500 font-bold text-sm ml-2 flex-shrink-0">${parseFloat(price).toFixed(2)}</span>
        </div>
        {item.description && (
          <p className="text-xs text-gray-500 mt-1 line-clamp-2">{item.description}</p>
        )}
        <div className="flex gap-6 mt-3">
          <button onClick={onEdit} className="text-xs text-orange-500 hover:text-orange-600 font-medium transition">Edit</button>
          <span className="text-gray-300">|</span>
          <button onClick={onDelete} className="text-xs text-red-400 hover:text-red-600 font-medium transition">Delete</button>
        </div>
      </div>
    </div>
  );
}
