// Demo Data - Toast-style Three-Tier System
// This data represents a restaurant menu with categories, items, and modifier groups

const DEMO_DATA = {
  // Categories - Top level organization
  categories: [
    {
      id: 'cat_burgers',
      name: 'Burgers',
      description: 'Our signature burger collection',
      color: '#f97316',
      icon: '🍔',
      modifier_group_ids: ['group_sides', 'group_toppings'], // Inherited by all items in this category
      available: true
    },
    {
      id: 'cat_sides',
      name: 'Sides & Fries',
      description: 'Crispy sides and appetizers',
      color: '#10b981',
      icon: '🍟',
      modifier_group_ids: ['group_dipping_sauces'],
      available: true
    },
    {
      id: 'cat_drinks',
      name: 'Drinks',
      description: 'Refreshments and beverages',
      color: '#3b82f6',
      icon: '🥤',
      modifier_group_ids: ['group_size_options'],
      available: true
    },
    {
      id: 'cat_desserts',
      name: 'Desserts',
      description: 'Sweet treats to finish',
      color: '#ec4899',
      icon: '🍰',
      modifier_group_ids: [],
      available: false // Example of 86ed category
    }
  ],

  // Modifier Groups - Reusable collections of options
  modifier_groups: [
    {
      id: 'group_sides',
      name: 'Choose Your Side',
      description: 'Select one side dish',
      min_selection: 1,
      max_selection: 1,
      required: true,
      options: [
        { id: 'opt_fries', name: 'French Fries', extraPrice: 0.00, available: true },
        { id: 'opt_sweet_potato', name: 'Sweet Potato Fries', extraPrice: 1.50, available: true },
        { id: 'opt_onion_rings', name: 'Onion Rings', extraPrice: 2.00, available: true },
        { id: 'opt_coleslaw', name: 'Coleslaw', extraPrice: 1.00, available: true }
      ]
    },
    {
      id: 'group_toppings',
      name: 'Add Extra Toppings',
      description: 'Customize your burger',
      min_selection: 0,
      max_selection: 5,
      required: false,
      options: [
        { id: 'opt_cheese', name: 'Extra Cheese', extraPrice: 1.50, available: true },
        { id: 'opt_bacon', name: 'Crispy Bacon', extraPrice: 2.00, available: true },
        { id: 'opt_jalapenos', name: 'Jalapeños', extraPrice: 0.75, available: true },
        { id: 'opt_avocado', name: 'Fresh Avocado', extraPrice: 2.50, available: false }, // Example of 86ed option
        { id: 'opt_eggs', name: 'Fried Egg', extraPrice: 1.75, available: true }
      ]
    },
    {
      id: 'group_dipping_sauces',
      name: 'Dipping Sauces',
      description: 'Choose your favorite sauces',
      min_selection: 0,
      max_selection: 3,
      required: false,
      options: [
        { id: 'opt_ketchup', name: 'Ketchup', extraPrice: 0.00, available: true },
        { id: 'opt_mustard', name: 'Mustard', extraPrice: 0.00, available: true },
        { id: 'opt_bbq', name: 'BBQ Sauce', extraPrice: 0.50, available: true },
        { id: 'opt_ranch', name: 'Ranch', extraPrice: 0.50, available: true },
        { id: 'opt_honey_mustard', name: 'Honey Mustard', extraPrice: 0.50, available: true }
      ]
    },
    {
      id: 'group_size_options',
      name: 'Size Options',
      description: 'Select your drink size',
      min_selection: 1,
      max_selection: 1,
      required: true,
      options: [
        { id: 'opt_small', name: 'Small (16oz)', extraPrice: 0.00, available: true },
        { id: 'opt_medium', name: 'Medium (20oz)', extraPrice: 0.50, available: true },
        { id: 'opt_large', name: 'Large (24oz)', extraPrice: 1.00, available: true }
      ]
    }
  ],

  // Food Items - The actual menu items
  items: [
    {
      id: 'item_classic_burger',
      name: 'Classic Cheeseburger',
      description: 'Juicy beef patty with American cheese, lettuce, tomato, and our special sauce',
      image_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800',
      base_price: 12.99,
      category_id: 'cat_burgers',
      modifier_group_ids: ['group_sides', 'group_toppings'], // Can inherit from category OR override
      available: true,
      created_at: '2026-01-15T10:00:00Z',
      updated_at: '2026-04-09T14:30:00Z'
    },
    {
      id: 'item_bacon_burger',
      name: 'Bacon Supreme Burger',
      description: 'Double beef patty, crispy bacon, cheddar cheese, caramelized onions, and BBQ sauce',
      image_url: 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=800',
      base_price: 16.99,
      category_id: 'cat_burgers',
      modifier_group_ids: ['group_sides', 'group_toppings'],
      available: true,
      created_at: '2026-01-20T11:30:00Z',
      updated_at: '2026-04-09T14:30:00Z'
    },
    {
      id: 'item_chicken_burger',
      name: 'Crispy Chicken Burger',
      description: 'Hand-breaded crispy chicken breast, pickles, and honey mustard sauce on brioche bun',
      image_url: 'https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=800',
      base_price: 14.99,
      category_id: 'cat_burgers',
      modifier_group_ids: ['group_sides', 'group_toppings'],
      available: true,
      created_at: '2026-02-01T09:00:00Z',
      updated_at: '2026-04-09T14:30:00Z'
    },
    {
      id: 'item_caesar_salad',
      name: 'Caesar Salad',
      description: 'Fresh romaine lettuce, parmesan cheese, croutons, and house Caesar dressing',
      image_url: 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9?w=800',
      base_price: 10.99,
      category_id: 'cat_sides',
      modifier_group_ids: ['group_dipping_sauces'],
      available: true,
      created_at: '2026-02-10T12:00:00Z',
      updated_at: '2026-04-09T14:30:00Z'
    },
    {
      id: 'item_loaded_fries',
      name: 'Loaded Fries',
      description: 'Crispy fries topped with cheese sauce, bacon bits, and green onions',
      image_url: 'https://images.unsplash.com/photo-1573080496987-a199f8cd75ec?w=800',
      base_price: 8.99,
      category_id: 'cat_sides',
      modifier_group_ids: ['group_dipping_sauces'],
      available: true,
      created_at: '2026-02-15T14:00:00Z',
      updated_at: '2026-04-09T14:30:00Z'
    },
    {
      id: 'item_cola',
      name: 'Cola',
      description: 'Refreshing classic cola',
      image_url: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=800',
      base_price: 2.99,
      category_id: 'cat_drinks',
      modifier_group_ids: ['group_size_options'],
      available: true,
      created_at: '2026-03-01T10:00:00Z',
      updated_at: '2026-04-09T14:30:00Z'
    },
    {
      id: 'item_lemonade',
      name: 'Fresh Lemonade',
      description: 'House-made lemonade with real lemon juice',
      image_url: 'https://images.unsplash.com/photo-1621263764928-df1444c5e859?w=800',
      base_price: 3.49,
      category_id: 'cat_drinks',
      modifier_group_ids: ['group_size_options'],
      available: true,
      created_at: '2026-03-05T11:00:00Z',
      updated_at: '2026-04-09T14:30:00Z'
    },
    {
      id: 'item_chocolate_cake',
      name: 'Chocolate Lava Cake',
      description: 'Warm chocolate cake with molten center, served with vanilla ice cream',
      image_url: 'https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=800',
      base_price: 7.99,
      category_id: 'cat_desserts',
      modifier_group_ids: [],
      available: false, // Example of 86ed item
      created_at: '2026-03-10T13:00:00Z',
      updated_at: '2026-04-09T14:30:00Z'
    }
  ]
};

// Initialize localStorage with demo data if not present
function initializeDemoData() {
  if (!localStorage.getItem('udo_categories')) {
    localStorage.setItem('udo_categories', JSON.stringify(DEMO_DATA.categories));
  }
  if (!localStorage.getItem('udo_modifier_groups')) {
    localStorage.setItem('udo_modifier_groups', JSON.stringify(DEMO_DATA.modifier_groups));
  }
  if (!localStorage.getItem('udo_items')) {
    localStorage.setItem('udo_items', JSON.stringify(DEMO_DATA.items));
  }
}

// Generate unique ID for new items
function generateId(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}