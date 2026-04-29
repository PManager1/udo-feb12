# Backend GET Endpoints to Add

Add these three GET endpoints to your Go backend to fix the 404 errors.

## 1. Routes File (routes.go or similar)

Add these three lines to your `RestMenuRoutes` function, right after the existing category/item/modifier routes:

```go
// Category CRUD endpoints (ADD THIS LINE)
authRouter.HandleFunc("/categories", restMenuController.GetCategories).Methods("GET")

// Item CRUD endpoints (ADD THIS LINE)
authRouter.HandleFunc("/items", restMenuController.GetItems).Methods("GET")

// Modifier Group CRUD endpoints (ADD THIS LINE)
authRouter.HandleFunc("/modifier-groups", restMenuController.GetModifierGroups).Methods("GET")
```

## 2. Controller File (rest_menu_controller.go or similar)

Add these three methods to your `RestMenuController`:

### GetCategories - Fetch all categories
```go
// GetCategories retrieves all categories for the restaurant
func (c *RestMenuController) GetCategories(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	restaurantID := ctx.Value("restaurantID").(string)

	categories, err := c.service.GetCategories(ctx, restaurantID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(categories)
}
```

### GetItems - Fetch all items
```go
// GetItems retrieves all items for the restaurant
func (c *RestMenuController) GetItems(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	restaurantID := ctx.Value("restaurantID").(string)
	
	// Optional: Filter by category_id if provided
	categoryID := r.URL.Query().Get("category_id")

	items, err := c.service.GetItems(ctx, restaurantID, categoryID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(items)
}
```

### GetModifierGroups - Fetch all modifier groups
```go
// GetModifierGroups retrieves all modifier groups for the restaurant
func (c *RestMenuController) GetModifierGroups(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	restaurantID := ctx.Value("restaurantID").(string)

	groups, err := c.service.GetModifierGroups(ctx, restaurantID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(groups)
}
```

## 3. Service Layer (service layer if you have one)

If you have a service layer, add these methods there too:

```go
func (s *RestMenuService) GetCategories(ctx context.Context, restaurantID string) ([]Category, error) {
	filter := bson.M{"restaurant_id": restaurantID}
	cursor, err := s.collection.Find(ctx, filter)
	if err != nil {
		return nil, err
	}
	
	var categories []Category
	if err = cursor.All(ctx, &categories); err != nil {
		return nil, err
	}
	
	return categories, nil
}

func (s *RestMenuService) GetItems(ctx context.Context, restaurantID, categoryID string) ([]Item, error) {
	filter := bson.M{"restaurant_id": restaurantID}
	if categoryID != "" {
		filter["category_id"] = categoryID
	}
	
	cursor, err := s.collection.Find(ctx, filter)
	if err != nil {
		return nil, err
	}
	
	var items []Item
	if err = cursor.All(ctx, &items); err != nil {
		return nil, err
	}
	
	return items, nil
}

func (s *RestMenuService) GetModifierGroups(ctx context.Context, restaurantID string) ([]ModifierGroup, error) {
	filter := bson.M{"restaurant_id": restaurantID}
	cursor, err := s.collection.Find(ctx, filter)
	if err != nil {
		return nil, err
	}
	
	var groups []ModifierGroup
	if err = cursor.All(ctx, &groups); err != nil {
		return nil, err
	}
	
	return groups, nil
}
```

## What This Fixes:

✅ GET /rest/categories - Lists all categories
✅ GET /rest/items - Lists all items (with optional category_id filter)
✅ GET /rest/items?category_id=xxx - Lists items for specific category
✅ GET /rest/modifier-groups - Lists all modifier groups
✅ No more 404 errors in frontend
✅ Standard REST API pattern
✅ Real-time data (no cache)

## After Adding These:

1. Restart your Go backend server
2. Refresh the frontend /addfood page
3. All 404 errors will be gone!
4. Categories will load properly
5. Modifier groups will load properly
6. Everything works like a real production app! 🚀