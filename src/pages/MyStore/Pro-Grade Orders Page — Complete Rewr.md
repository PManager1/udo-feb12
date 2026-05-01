## Pro-Grade Orders Page — Complete Rewrite ✅

### Search Features:
- **Live type-to-filter** — results update as you type, no Enter needed
- **Multi-field matching** — searches order #, customer name, phone, email, AND item names (e.g., "Fries" finds all orders with fries)
- **Partial matching** — "3406" finds phone numbers containing those digits
- **Yellow highlighting** — matched text is highlighted in yellow in results
- **Clear ✕ button** — one tap to wipe search
- **Result count** — "3 results" shown when searching
- **Smart "No Results"** — shows helpful message + "Clear Search" button
- **Recent searches** — last 5 searches saved as quick tags (stored in localStorage)

### Urgency & Visual Features:
- **🟢 Traffic Light System** — Green (<5m), Yellow (5-10m), Red+pulsing (>10m) timers on every card
- **Left border color** — matches urgency level for instant visual scanning
- **Hero Items** — "2× Big Mac, 1× Fries… +1 more" visible on card
- **Big action button** — "✓ Confirm Order", "🔥 Start Preparing", etc. with status-specific colors

### Tabs & Sorting:
- **⚡ Active** (default) — all in-progress orders
- **🚨 Needs Action** — pending + confirmed only
- **✅ Completed** — delivered
- **❌ Cancelled** — cancelled orders
- **Auto-sort by urgency** — oldest pending orders always float to top
- **Date chips**: This Shift (8h) · Today · This Week · All Time

### Audio:
- **🔔 Chime notification** — plays a pleasant ding when new pending orders arrive (Web Audio API, no external files)

### Auto-Refresh:
- Polls every 30 seconds automatically
- Urgency timers update every 30 seconds