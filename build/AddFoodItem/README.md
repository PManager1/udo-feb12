# UDO Restaurant Menu Management System

A professional-grade, Toast-style menu management system for restaurant owners with modifier groups, profit calculator, and 86ing functionality.

## 🎯 Features

### Core Functionality
- **Three-Tier Architecture**: Categories → Items → Modifier Groups (industry standard)
- **Modifier Inheritance**: Items inherit modifier groups from their category
- **Live Profit Calculator**: Shows real-time profit comparison with competitors (15% vs 30% commission)
- **Two-Tap 86ing**: Quickly toggle availability for items and categories
- **Multi-Option Photo Upload**: Upload file, paste URL, or use placeholder images
- **Search Functionality**: Debounced search across all menu items

### Data Model (Toast-Style)

#### Categories
```json
{
  "id": "cat_burgers",
  "name": "Burgers",
  "description": "Our signature burger collection",
  "color": "#f97316",
  "icon": "🍔",
  "modifier_group_ids": ["group_sides", "group_toppings"],
  "available": true
}
```

#### Modifier Groups
```json
{
  "id": "group_sides",
  "name": "Choose Your Side",
  "description": "Select one side dish",
  "min_selection": 1,
  "max_selection": 1,
  "required": true,
  "options": [
    {
      "name": "French Fries",
      "extra_price": 0.00,
      "available": true
    }
  ]
}
```

#### Items
```json
{
  "id": "item_classic_burger",
  "name": "Classic Cheeseburger",
  "description": "Juicy beef patty with American cheese...",
  "image_url": "https://example.com/burger.jpg",
  "base_price": 12.99,
  "category_id": "cat_burgers",
  "modifier_group_ids": ["group_sides", "group_toppings"],
  "available": true
}
```

## 🚀 Getting Started

### Installation

1. Navigate to the AddFood directory:
   ```bash
   cd public/AddFood
   ```

2. Open `index.html` in your browser:
   ```bash
   open index.html
   ```

   Or use a local server:
   ```bash
   python -m http.server 8000
   # Then visit http://localhost:8000/AddFood/
   ```

### File Structure

```
public/AddFood/
├── index.html              # Main application HTML
├── demo-data.js           # Sample data structure
├── data-manager.js        # localStorage operations
├── ui-components.js       # Rendering logic
├── event-handlers.js      # User interaction handlers
└── README.md             # This file
```

## 📖 User Guide

### 1. Dashboard View

The main dashboard shows all your menu categories with:
- Category name and icon
- Item count (available/total)
- Quick availability toggle (green = available, red = 86ed)
- Click to view items in that category

### 2. Creating Menu Items

1. Click "Add New Item" button
2. Choose photo upload method:
   - **Upload File**: Select from your device
   - **Image URL**: Paste a direct link
   - **Placeholder**: Use random food image
3. Fill in item details:
   - Name (required)
   - Category (required)
   - Base price (required) - **Live profit calculator shows your earnings**
   - Description (optional)
4. Select modifier groups (inherited from category)
5. Click "Save Item"

### 3. Managing Categories

1. Click "Manage Category" button
2. Update category name and description
3. Select modifier groups to apply to all items in this category
4. Click "Save Changes"

**Modifier Inheritance**: All items in a category automatically inherit the category's modifier groups. This saves time when adding similar items.

### 4. Creating Modifier Groups

1. Click "+ Create New Group" in the item form
2. Enter group name (e.g., "Burger Toppings")
3. Set selection rules:
   - **Min Selection**: Minimum options customer must choose (0 = optional)
   - **Max Selection**: Maximum options customer can choose
   - **Required**: If checked, forces min_selection = 1
4. Add options:
   - Option name (e.g., "Extra Cheese")
   - Extra price (e.g., 1.50)
   - Click "+ Add Option" for more
5. Click "Save Modifier Group"

### 5. Two-Tap 86ing (Availability)

**What is 86ing?**
In restaurant terminology, "86" means an item is out of stock and temporarily unavailable.

**How to use:**
- Toggle switch on category card → 86es entire category
- Toggle switch on item card → 86es individual item
- **Visual feedback**: Grayed out with 60% opacity
- **Toast notification**: Confirms the change

**Benefits:**
- Instantly hide out-of-stock items from customer view
- Two-tap: one to 86, one to restore
- No need to delete and recreate items

### 6. Live Profit Calculator

When adding or editing items, see real-time profit comparison:
- **UDO (15% commission)**: You keep 85% of the price
- **Competitor (30% commission)**: You keep 70% of the price
- **Savings**: Shows how much more you earn on UDO

**Example:**
```
Item Price: $12.99

You take home on UDO:    $11.04 (85%)
vs. competitor (30%):    $9.09  (70%)
Save $1.95 per order!
```

### 7. Search Functionality

- Type in the search bar (debounced 300ms)
- Searches across item names and descriptions
- Shows matching items with category badges
- Click item to navigate to its category

## 🔧 Technical Architecture

### Data Persistence
- **localStorage**: All data stored in browser's localStorage
- **Automatic initialization**: Demo data loads on first visit
- **Keys**: `udo_categories`, `udo_items`, `udo_modifier_groups`

### File Organization

1. **demo-data.js**: Sample data structure and initialization
2. **data-manager.js**: CRUD operations and localStorage wrapper
3. **ui-components.js**: All rendering logic (React-like components)
4. **event-handlers.js**: User interaction handlers and event listeners

### Key Design Patterns

**Modifier Inheritance**
```javascript
// Items inherit from category if no specific groups set
getItemModifierGroups(itemId) {
  if (item.modifier_group_ids.length > 0) {
    return item-specific groups;
  } else {
    return category.modifier_group_ids;
  }
}
```

**Two-Tap 86ing**
```javascript
toggleAvailability(type, id) {
  // One function handles both categories and items
  const newStatus = !currentStatus;
  updateEntity(type, id, { available: newStatus });
}
```

**Live Profit Calculation**
```javascript
updateProfitCalculator() {
  const price = parseFloat(input.value) || 0;
  const udoProfit = price * 0.85;  // 15% commission
  const competitorProfit = price * 0.70;  // 30% commission
  displayResults(udoProfit, competitorProfit);
}
```

## 🎨 UI/UX Features

### Animations
- **Fade-in**: Smooth content appearance
- **Slide-in-right**: Drawer and modal animations
- **Hover effects**: Card lift and shadow enhancement

### Responsive Design
- **Mobile-first**: Works on all screen sizes
- **Grid layouts**: 1-3 columns based on viewport
- **Touch-friendly**: Large tap targets for mobile

### Accessibility
- **Keyboard shortcuts**: ESC closes modals/drawers
- **Focus states**: Clear visual feedback
- **Semantic HTML**: Proper heading hierarchy

## 🔄 Backend Integration

The system is designed to easily integrate with a backend API:

### Current State
- Uses localStorage for demo purposes
- All CRUD operations are modular and ready for API calls

### Migration Path
1. Replace `DataManager` methods with API calls
2. Use the centralized `config.js` for endpoint URLs
3. Implement error handling and loading states
4. Add authentication tokens from localStorage JWT

### Example API Integration
```javascript
async createItem(itemData) {
  const response = await fetch(getRestaurantEndpoint('items'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getAuthToken()}`
    },
    body: JSON.stringify(itemData)
  });
  return response.json();
}
```

## 📊 Demo Data

The system comes pre-loaded with:
- **4 Categories**: Burgers, Sides & Fries, Drinks, Desserts
- **4 Modifier Groups**: Sides, Toppings, Dipping Sauces, Size Options
- **8 Items**: Complete menu with images, prices, and descriptions

**86ed Examples (for demonstration):**
- Desserts category (86ed)
- Chocolate Lava Cake item (86ed)
- Fresh Avocado modifier option (86ed)

## 🐛 Troubleshooting

### Issues & Solutions

**Problem: Changes not persisting**
- Solution: Check browser localStorage is enabled
- Solution: Clear localStorage and reload

**Problem: Images not showing**
- Solution: Check internet connection (demo uses Unsplash)
- Solution: Use local file upload or different URL

**Problem: Search not working**
- Solution: Ensure data is loaded (check browser console)
- Solution: Clear localStorage to reset demo data

### Browser Console
Open browser console (F12) to see:
- Initialization messages
- Error logs
- Data operation confirmations

## 🚀 Future Enhancements

### Planned Features
- [ ] Drag-and-drop modifier group reordering
- [ ] Bulk edit items in a category
- [ ] Import/export menu (CSV/JSON)
- [ ] Analytics dashboard (popular items, sales data)
- [ ] Multi-location support
- [ ] Tax configuration per location
- [ ] Print menu PDF generation

### Backend Features
- [ ] Real-time inventory tracking
- [ ] Automatic 86ing based on stock levels
- [ ] Modifier option inventory management
- [ ] Menu versioning and history
- [ ] Multi-language support

## 📝 License & Credits

Built for UDO Restaurant Management System
- Industry-standard Toast-style architecture
- Best practices from DoorDash, Uber Eats, Grubhub
- Modern JavaScript (ES6+) patterns

## 🤝 Support

For issues or questions:
1. Check this README
2. Review browser console for errors
3. Verify localStorage functionality
4. Contact UDO support team

---

**Last Updated**: April 9, 2026
**Version**: 1.0.0
**Status**: Production Ready ✅