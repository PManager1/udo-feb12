// Search Overlay Loader — fetches items from backend API
async function loadSearchOverlay() {
  try {
    // 1. Determine correct base path based on current directory depth
    const pathParts = window.location.pathname.split('/').filter(Boolean);
    let depth = 0;
    for (const part of pathParts) {
      if (part.endsWith('.html')) {
        break;
      }
      depth++;
    }
    
    const basePath = '../'.repeat(depth);

    // 2. Fetch search overlay items from the backend API
    const response = await fetch(SEARCH_OVERLAY_API.publicItems);
    const json = await response.json();
    
    // Transform flat items list into grouped sections
    const data = { recentSearches: [], popularOnUDO: [], trendingNow: [] };
    if (json.items && Array.isArray(json.items)) {
      json.items.forEach(item => {
        const card = {
          href: item.href,
          label: item.label,
          image: item.image
        };
        if (item.section === 'recent_searches') {
          data.recentSearches.push(card);
        } else if (item.section === 'popular_on_udo') {
          data.popularOnUDO.push(card);
        } else if (item.section === 'trending_now') {
          data.trendingNow.push(card);
        }
      });
    }
    
    // 3. Create and insert the search overlay HTML structure
    const overlayHTML = `
      <div id="searchOverlay" class="hidden fixed left-0 right-0 top-0 z-[100] bg-black/20 backdrop-blur-sm">
        <div class="mx-4 pt-4 h-[70vh] bg-white shadow-2xl p-8 overflow-y-auto pointer-events-auto">
          <div class="flex items-center justify-between mb-8">
            <div class="flex-1 mr-4">
              <input
                type="text"
                id="overlaySearchInput"
                placeholder="What do you need done today?"
                class="w-full text-2xl font-light border-b-2 border-gray-200 py-4 focus:outline-none focus:border-orange-500 transition bg-[#DADAD3]"
                autofocus
              />
            </div>
            <button id="closeSearch" class="p-2 hover:bg-gray-100 rounded-full transition">
              <svg class="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div>
            <h3 class="text-xl font-bold text-gray-900 mb-2">Recent searches</h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3" id="recentSearchesGrid">
              <!-- Recent searches will be populated here -->
            </div>
            
            <h3 class="text-xl font-bold text-gray-900 mt-12 mb-2">Popular on UDO</h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3" id="popularOnUDOGrid">
              <!-- Popular items will be populated here -->
            </div>

            <h3 class="text-xl font-bold text-gray-900 mt-12 mb-2">Trending now</h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3" id="trendingNowGrid">
              <!-- Trending items will be populated here -->
            </div>
          </div>
        </div>
      </div>
    `;
    
    // 4. Insert it into the bottom of the body
    document.body.insertAdjacentHTML('beforeend', overlayHTML);
    
    // 5. Helper function to create suggestion cards
    const createSuggestionCard = (item) => {
      const href = basePath + item.href;
      return `
        <a href="${href}">
          <div class="group bg-gray-100 hover:bg-gray-200 rounded-2xl cursor-pointer transition overflow-hidden relative w-full h-[82.5px] flex items-center">
            <img src="${item.image}" alt="${item.label}" class="w-[30%] h-full object-cover rounded-l-2xl" />
            <span class="text-gray-900 flex-1 text-center text-lg font-medium">${item.label}</span>
            <button class="absolute top-1/2 -translate-y-1/2 right-0 w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition z-10">
              <svg class="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </a>
      `;
    };
    
    // 6. Populate the grids with data
    const recentGrid = document.getElementById('recentSearchesGrid');
    const popularGrid = document.getElementById('popularOnUDOGrid');
    const trendingGrid = document.getElementById('trendingNowGrid');
    
    if (recentGrid && data.recentSearches) {
      recentGrid.innerHTML = data.recentSearches.map(createSuggestionCard).join('');
    }
    
    if (popularGrid && data.popularOnUDO) {
      popularGrid.innerHTML = data.popularOnUDO.map(createSuggestionCard).join('');
    }

    if (trendingGrid && data.trendingNow) {
      trendingGrid.innerHTML = data.trendingNow.map(createSuggestionCard).join('');
    }

    // 7. Re-attach the event listeners now that elements exist
    const searchInput = document.getElementById('searchInput');
    const searchOverlay = document.getElementById('searchOverlay');
    const closeSearch = document.getElementById('closeSearch');
    const overlaySearchInput = document.getElementById('overlaySearchInput');

    if (searchInput) {
      searchInput.addEventListener('click', (e) => {
        e.preventDefault();
        searchOverlay.classList.remove('hidden');
        setTimeout(() => {
          searchOverlay.classList.add('active');
        }, 10);
        overlaySearchInput.focus();
      });
    }

    const hideOverlay = () => {
      searchOverlay.classList.remove('active');
      setTimeout(() => {
        searchOverlay.classList.add('hidden');
      }, 300);
    };

    if (closeSearch) {
      closeSearch.addEventListener('click', hideOverlay);
    }

    if (searchOverlay) {
      searchOverlay.addEventListener('click', (e) => {
        if (e.target === searchOverlay) {
          hideOverlay();
        }
      });
    }

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        hideOverlay();
      }
    });
  } catch (error) {
    console.error('Failed to load search overlay:', error);
  }
}

// Initialize when the page loads
document.addEventListener('DOMContentLoaded', loadSearchOverlay);