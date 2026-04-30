// Demo data for restaurant menu management system
// Using placeholder URLs to keep localStorage size manageable

const demoData = {
  settings: {
    restaurant_name: "UDO Demo Restaurant",
    commission_rate: 0.15, // 15% commission
    competitor_rate: 0.30, // 30% competitor rate
    currency: "$",
    default_category: "cat_american"
  },
  
  categories: [
    {
      id: "cat_american",
      name: "American",
      description: "Classic American cuisine",
      image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400",
      display_order: 1,
      inherited_modifier_group_ids: ["group_sides_std", "group_drink_sizes"],
      is_active: true,
      item_count: 4
    },
    {
      id: "cat_italian",
      name: "Italian",
      description: "Authentic Italian dishes",
      image: "https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=400",
      display_order: 2,
      inherited_modifier_group_ids: ["group_pizza_toppings", "group_drink_sizes"],
      is_active: true,
      item_count: 3
    },
    {
      id: "cat_mexican",
      name: "Mexican",
      description: "Spicy Mexican favorites",
      image: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400",
      display_order: 3,
      inherited_modifier_group_ids: ["group_spice_level", "group_drink_sizes"],
      is_active: true,
      item_count: 3
    }
  ],
  
  items: [
    {
      id: "item_burger_001",
      name: "Chicken Burger",
      description: "Crispy chicken breast with fresh lettuce, tomato, and special sauce",
      base_price: 12.99,
      category_id: "cat_american",
      image_url: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400",
      is_available: true,
      local_modifier_group_ids: [],
      excluded_modifier_group_ids: [],
      created_at: "2026-04-09",
      updated_at: "2026-04-09"
    },
    {
      id: "item_burger_002",
      name: "Cheese Burger",
      description: "Juicy beef patty with melted cheddar cheese, pickles, and onions",
      base_price: 11.99,
      category_id: "cat_american",
      image_url: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400",
      is_available: true,
      local_modifier_group_ids: [],
      excluded_modifier_group_ids: [],
      created_at: "2026-04-09",
      updated_at: "2026-04-09"
    },
    {
      id: "item_burger_003",
      name: "Classic Hot Dog",
      description: "All-beef hot dog with mustard, ketchup, and relish",
      base_price: 8.99,
      category_id: "cat_american",
      image_url: "https://images.unsplash.com/photo-1550547660-d9450f859349?w=400",
      is_available: true,
      local_modifier_group_ids: [],
      excluded_modifier_group_ids: [],
      created_at: "2026-04-09",
      updated_at: "2026-04-09"
    },
    {
      id: "item_burger_004",
      name: "Chicken Wings",
      description: "Crispy wings tossed in your choice of sauce",
      base_price: 13.99,
      category_id: "cat_american",
      image_url: "https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=400",
      is_available: false, // 86'd item
      local_modifier_group_ids: [],
      excluded_modifier_group_ids: [],
      created_at: "2026-04-09",
      updated_at: "2026-04-09"
    },
    {
      id: "item_pizza_001",
      name: "Margherita Pizza",
      description: "Classic pizza with fresh mozzarella, tomatoes, and basil",
      base_price: 14.99,
      category_id: "cat_italian",
      image_url: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400",
      is_available: true,
      local_modifier_group_ids: [],
      excluded_modifier_group_ids: [],
      created_at: "2026-04-09",
      updated_at: "2026-04-09"
    },
    {
      id: "item_pizza_002",
      name: "Spaghetti Carbonara",
      description: "Creamy pasta with pancetta, eggs, and parmesan",
      base_price: 16.99,
      category_id: "cat_italian",
      image_url: "https://images.unsplash.com/photo-1612874742237-6526221588e3?w=400",
      is_available: true,
      local_modifier_group_ids: [],
      excluded_modifier_group_ids: [],
      created_at: "2026-04-09",
      updated_at: "2026-04-09"
    },
    {
      id: "item_pizza_003",
      name: "Bruschetta",
      description: "Grilled bread topped with fresh tomatoes and garlic",
      base_price: 9.99,
      category_id: "cat_italian",
      image_url: "https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?w=400",
      is_available: true,
      local_modifier_group_ids: [],
      excluded_modifier_group_ids: [],
      created_at: "2026-04-09",
      updated_at: "2026-04-09"
    },
    {
      id: "item_mexican_001",
      name: "Street Tacos",
      description: "Three authentic tacos with your choice of meat",
      base_price: 11.99,
      category_id: "cat_mexican",
      image_url: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400",
      is_available: true,
      local_modifier_group_ids: [],
      excluded_modifier_group_ids: [],
      created_at: "2026-04-09",
      updated_at: "2026-04-09"
    },
    {
      id: "item_mexican_002",
      name: "Burrito Bowl",
      description: "Rice, beans, protein, and all your favorite toppings",
      base_price: 13.99,
      category_id: "cat_mexican",
      image_url: "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=400",
      is_available: true,
      local_modifier_group_ids: [],
      excluded_modifier_group_ids: [],
      created_at: "2026-04-09",
      updated_at: "2026-04-09"
    },
    {
      id: "item_mexican_003",
      name: "Cheese Enchiladas",
      description: "Three cheese enchiladas smothered in red sauce",
      base_price: 12.99,
      category_id: "cat_mexican",
      image_url: "https://images.unsplash.com/photo-1534352956036-cd81e27d522c?w=400",
      is_available: false, // 86'd item
      local_modifier_group_ids: [],
      excluded_modifier_group_ids: [],
      created_at: "2026-04-09",
      updated_at: "2026-04-09"
    }
  ],
  
  modifier_groups: [
    {
      id: "group_sides_std",
      name: "Choose a Side",
      description: "Select one side dish",
      min_selection: 1,
      max_selection: 1,
      is_required: true,
      display_order: 1,
      options: [
        {
          id: "opt_fries",
          name: "French Fries",
          extraPrice: 0.00,
          is_available: true,
          is_default: true
        },
        {
          id: "opt_rings",
          name: "Onion Rings",
          extraPrice: 2.00,
          is_available: true,
          is_default: false
        },
        {
          id: "opt_salad",
          name: "Garden Salad",
          extraPrice: 1.50,
          is_available: true,
          is_default: false
        }
      ]
    },
    {
      id: "group_drink_sizes",
      name: "Drink Size",
      description: "Choose your drink size",
      min_selection: 0,
      max_selection: 1,
      is_required: false,
      display_order: 2,
      options: [
        {
          id: "opt_drink_small",
          name: "Small",
          extraPrice: 0.00,
          is_available: true,
          is_default: true
        },
        {
          id: "opt_drink_medium",
          name: "Medium",
          extraPrice: 0.50,
          is_available: true,
          is_default: false
        },
        {
          id: "opt_drink_large",
          name: "Large",
          extraPrice: 1.00,
          is_available: true,
          is_default: false
        }
      ]
    },
    {
      id: "group_pizza_toppings",
      name: "Pizza Toppings",
      description: "Add extra toppings to your pizza",
      min_selection: 0,
      max_selection: 5,
      is_required: false,
      display_order: 1,
      options: [
        {
          id: "opt_pepperoni",
          name: "Pepperoni",
          extraPrice: 1.50,
          is_available: true,
          is_default: false
        },
        {
          id: "opt_mushrooms",
          name: "Mushrooms",
          extraPrice: 1.00,
          is_available: true,
          is_default: false
        },
        {
          id: "opt_olives",
          name: "Olives",
          extraPrice: 1.00,
          is_available: true,
          is_default: false
        },
        {
          id: "opt_extra_cheese",
          name: "Extra Cheese",
          extraPrice: 2.00,
          is_available: true,
          is_default: false
        }
      ]
    },
    {
      id: "group_spice_level",
      name: "Spice Level",
      description: "How spicy would you like it?",
      min_selection: 1,
      max_selection: 1,
      is_required: true,
      display_order: 1,
      options: [
        {
          id: "opt_mild",
          name: "Mild",
          extraPrice: 0.00,
          is_available: true,
          is_default: true
        },
        {
          id: "opt_medium",
          name: "Medium",
          extraPrice: 0.00,
          is_available: true,
          is_default: false
        },
        {
          id: "opt_hot",
          name: "Hot",
          extraPrice: 0.00,
          is_available: true,
          is_default: false
        },
        {
          id: "opt_extra_hot",
          name: "Extra Hot",
          extraPrice: 0.50,
          is_available: true,
          is_default: false
        }
      ]
    }
  ]
};