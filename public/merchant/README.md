# UDO Merchant Store Builder

A best-in-class merchant portal store builder with mobile-first design, live preview, and intelligent UX features.

## Features

✅ **Mobile-First Design**
- Split-screen layout (60% editor, 40% preview) on desktop
- Floating preview button with overlay on mobile
- Thumb zone navigation for one-handed use

✅ **Smart Defaults**
- 4 business types with pre-configured categories:
  - Cafe: Popular Items, Drinks, Pastries, Breakfast
  - Restaurant: Appetizers, Mains, Sides, Desserts
  - Grocery: Essentials, Snacks, Beverages
  - Flower Shop: Fresh Flowers, Arrangements, Gifts

✅ **3-Click Rule**
- Add products in 3 clicks
- Apply standard hours with 1 click
- Emergency pause toggle for instant control

✅ **Google Places Autocomplete** 🆕
- Type-ahead address suggestions
- Automatically fills complete addresses
- Reduces typing errors

✅ **Autosave**
- Debounced saves (500ms)
- localStorage persistence
- Toast notifications

✅ **Real-Time Validation**
- Inline error highlighting
- Shake animation on errors
- Price of $0 immediately flagged

✅ **Micro-interactions**
- Confetti when activating products
- Smooth transitions
- Drag-and-drop visual feedback

## Setup Instructions

### 1. Google Places API Key (Required for Address Autocomplete)

To enable the address autocomplete feature, you need to:

1. **Get a Google API Key**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing one
   - Navigate to APIs & Services → Credentials
   - Click "Create Credentials" → "API Key"

2. **Enable Places API**
   - Go to APIs & Services → Library
   - Search for "Places API"
   - Click "Enable"

3. **Restrict API Key (Recommended)**
   - Edit your API key
   - Under "Application restrictions", select:
     - **HTTP referrers** for production, or
     - **None** for local development
   - Under "API restrictions", select "Places API"

4. **Update the API Key in index.html**
   - Open `public/merchant/index.html`
   - Find line 14:
     ```html
     <script src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=places&callback=initAutocomplete" async defer></script>
     ```
   - Replace `YOUR_API_KEY` with your actual API key:
     ```html
     <script src="https://maps.googleapis.com/maps/api/js?key=AIzaSy...&libraries=places&callback=initAutocomplete" async defer></script>
     ```

### 2. Free Usage Limits

Google Places API free tier:
- **$200 credit/month** = ~28,000 address autocomplete requests
- After that: $2.85 per 1,000 requests
- Perfect for small to medium merchants

**Note:** If you don't add an API key, the address field will still work with manual entry - just without autocomplete suggestions.

## File Structure

```
public/merchant/
├── index.html              # Main HTML with Google Places API
├── README.md              # This file
├── css/
│   └── styles.css         # All custom styles
└── js/
    ├── storage.js         # localStorage & smart defaults
    ├── validation.js      # Real-time validation
    ├── ui.js             # UI rendering & management
    └── app.js            # Main application logic
```

## Usage

1. Open `public/merchant/index.html` in a browser
2. Enter store information:
   - Store Name
   - Store Type (triggers smart defaults)
   - Store Address (with autocomplete if API key added)
   - Store Hours (or click "Apply Standard Hours")
3. Add products:
   - Click "Quick Add Product"
   - Enter name, price, and optional photo
   - Click "Add Product"
4. Toggle product status: Draft → Active → Out of Stock
5. Click "Publish Store" when ready

## Browser Compatibility

- Chrome/Edge (recommended)
- Firefox
- Safari
- Mobile browsers (iOS Safari, Chrome Mobile)

## Data Persistence

All data is stored in `localStorage` under the key `udo_merchant_store`. Data persists across:
- Page refreshes
- Browser sessions
- Browser restarts (until cleared)

## Development

The store builder is built with:
- Vanilla JavaScript (no framework required)
- Tailwind CSS (via CDN)
- Google Places API (optional)
- localStorage for data persistence

## Troubleshooting

**Address autocomplete not working?**
- Check browser console for API key errors
- Verify Places API is enabled in Google Cloud Console
- Ensure API key has proper restrictions

**Data not saving?**
- Check browser localStorage permissions
- Verify browser supports localStorage
- Check console for error messages

**Mobile preview not showing?**
- Ensure viewport meta tag is present
- Check for CSS conflicts
- Try on actual mobile device or browser dev tools

## Support

For issues or questions, please refer to the main UDO documentation or contact the development team.