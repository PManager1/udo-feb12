Perfect! I found the settings page with the token input section. Now I have a complete picture and can create a detailed implementation plan.

## Current State Analysis

**Settings Page (public/settings/index.html):**
- Has a "Token Account" section (lines 380-401)
- Token input field exists but the "Save token" button incorrectly calls `showDeleteModal()` instead of saving the token
- No actual token saving logic is implemented

**AddFood Page:**
- Uses localStorage only
- No backend API calls
- Has demo data that initializes on first load
- Categories should be visible but may have rendering issues

## Comprehensive Implementation Plan

### Phase 1: Fix Token Management in Settings Page

1. **Fix the "Save token" button** in settings/index.html:
   - Replace the incorrect `showDeleteModal()` call with a proper `saveToken()` function
   - Save token to localStorage with key `udo_auth_token`
   - Add validation to ensure token is not empty
   - Show success/error toast messages

2. **Add token display** to show if a token is currently saved:
   - Display masked version of saved token (e.g., `eyJ...xYz`)
   - Add "Clear Token" button to remove saved token
   - Show when token was last updated

### Phase 2: Create Token & API Management System

1. **Create `public/shared/token-manager.js`**:
   - Save token to localStorage
   - Retrieve token from localStorage
   - Clear token from localStorage
   - Validate token exists and is not empty
   - Helper to get Authorization header with token

2. **Create `public/AddFood/api-manager.js`**:
   - Initialize with token manager
   - Generic `fetch` wrapper that:
     - Automatically includes `Authorization: Bearer <token>` header
     - Handles errors gracefully
     - Falls back to localStorage if API fails
     - Shows loading states
   - Specific methods for:
     - `GET /restaurant/categories`
     - `POST /restaurant/categories`
     - `PUT /restaurant/categories/:id`
     - `DELETE /restaurant/categories/:id`
     - Same pattern for items and modifier groups

### Phase 3: Update Data Manager for API Integration

1. **Modify `public/AddFood/data-manager.js`**:
   - Add `useApiMode` flag (true if token exists, false otherwise)
   - Add methods to try API first, then fall back to localStorage:
     - `getCategories()` - try API, fallback to localStorage
     - `createCategory()` - save to both API and localStorage
     - `updateCategory()` - update both API and localStorage
     - Same pattern for items and modifier groups
   - Keep localStorage as cache for offline support
   - Add sync status tracking

### Phase 4: Fix Categories Visibility Issue

1. **Debug and fix categories rendering**:
   - Add console logging to track initialization
   - Verify demo data loads properly
   - Check for JavaScript errors
   - Ensure categories grid container exists and is visible
   - Add error handling in UI rendering

2. **Add visual indicators**:
   - Show connection status (Online/Offline)
   - Show data source (Backend/Local)
   - Show last sync time
   - Add "Refresh" button to manually sync

### Phase 5: Update UI Components & Event Handlers

1. **Update `public/AddFood/ui-components.js`**:
   - Add status badge showing API mode
   - Show loading indicators during API calls
   - Display sync status in header
   - Add error messages when API calls fail

2. **Update `public/AddFood/event-handlers.js`**:
   - Form submissions now call API (if token available)
   - Show success/error messages for API operations
   - Handle network errors gracefully
   - Auto-refresh data after successful API calls

### Phase 6: Testing & Verification

1. **Test token flow**:
   - Enter token in settings page
   - Verify it saves to localStorage
   - Check it's used in API calls
   - Test clearing token

2. **Test API integration**:
   - Verify categories load from backend
   - Test creating items via API
   - Test updating items via API
   - Test deleting items via API
   - Verify data persists in backend

3. **Test fallback to localStorage**:
   - Remove token and verify localStorage is used
   - Test offline behavior
   - Verify data persists locally

## Implementation Order (Priority)

1. **Fix token saving in settings** (quick win - 5 minutes)
2. **Create token-manager.js** (10 minutes)
3. **Create api-manager.js** (20 minutes)
4. **Fix categories visibility** (10 minutes)
5. **Update data-manager.js** (15 minutes)
6. **Add UI indicators** (10 minutes)
7. **Update event handlers** (10 minutes)
8. **Test everything** (15 minutes)

**Total estimated time: ~1.5 hours**

## Key Features to Implement

✅ **Token Management** - Save/retrieve token from settings
✅ **API Integration** - Connect to localhost:3030 endpoints
✅ **Automatic Headers** - Include `Authorization: Bearer <token>` in all requests
✅ **Offline Support** - Fallback to localStorage when API fails
✅ **Visual Feedback** - Show connection status and data source
✅ **Error Handling** - Graceful error messages and retry logic
✅ **Sync Indicators** - Show when data was last synced

## Ready to Implement?

This plan addresses both issues:
1. **Categories visibility** - Will debug and fix the rendering issue
2. **Backend integration** - Will use the token from settings to make API calls

Once you're satisfied with this plan, please **toggle to Act mode** so I can implement it. I'll start with the quick fixes (token saving and categories visibility) then move on to the full API integration system.

Do you have any questions or would you like me to proceed with this plan?