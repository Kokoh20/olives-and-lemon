(function(){
  // --- Helpers for building a rich catalog with variants (sizes) ---
  const slugify = (s) => (s || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  const v2 = (medium, large, mediumLabel = 'Medium', largeLabel = 'Large') => ([
    { key: slugify(mediumLabel) || 'medium', name: mediumLabel, price: medium },
    { key: slugify(largeLabel) || 'large', name: largeLabel, price: large }
  ]);
  const single = (price, label = 'Regular') => ([{ key: slugify(label) || 'regular', name: label, price }]);

  const categoryImage = (cat) => ({
    'coffee-iced': 'assets/images/coffee6.jpg',
    'hot-drinks': 'assets/images/coffee7.jpg',
    'oat-milk': 'assets/images/coffee6.jpg',
    'frappuccino': 'assets/images/drink1.jpg',
    'coffee-special': 'assets/images/coffee6.jpg',
    'non-coffee': 'assets/images/drink1.jpg',
    'matcha-series': 'assets/images/coffee6.jpg',
    'juices': 'assets/images/drink1.jpg',
    'appetizers': 'assets/images/dessert3.jpg',
    'salad': 'assets/images/dessert3.jpg',
    'pasta': 'assets/images/cake16.jpg',
    'rice-meals': 'assets/images/cake11.jpg',
    'sandwich': 'assets/images/cake16.jpg'
  })[cat] || 'assets/images/coffee6.jpg';

  const create = (category, name, variants) => ({
    id: `${category}-${slugify(name)}`,
    name,
    category,
    variants,
    image: categoryImage(category)
  });

  // --- Build catalog from the picture menus ---
  const products = [
    // Coffee Based (Iced Coffee)
    create('coffee-iced', 'Cappuccino', v2(90,110)),
    create('coffee-iced', 'Vietnamese Latte', v2(90,110)),
    create('coffee-iced', 'Hazelnut Latte', v2(90,110)),
    create('coffee-iced', 'Macadamia', v2(90,110)),
    create('coffee-iced', 'Butter Scotch', v2(90,110)),
    create('coffee-iced', 'Mocha', v2(90,110)),
    create('coffee-iced', 'White Mocha', v2(90,110)),
    create('coffee-iced', 'French Vanilla', v2(90,110)),
    create('coffee-iced', 'Salted Caramel', v2(90,110)),

    // Frappuccino (16oz / 22oz)
    create('frappuccino', 'Biscoff', v2(140,160, '16oz Medium', '22oz Large')),
    create('frappuccino', 'Java Chips', v2(140,160, '16oz Medium', '22oz Large')),
    create('frappuccino', 'Caramel Macchiato', v2(140,160, '16oz Medium', '22oz Large')),
    create('frappuccino', 'Dark Mocha', v2(140,160, '16oz Medium', '22oz Large')),
    create('frappuccino', 'Milo Dinosaur', v2(140,160, '16oz Medium', '22oz Large')),
    create('frappuccino', 'Matcha', v2(140,160, '16oz Medium', '22oz Large')),
    create('frappuccino', 'Oreo', v2(140,160, '16oz Medium', '22oz Large')),
    create('frappuccino', 'Strawberry', v2(140,160, '16oz Medium', '22oz Large')),
    create('frappuccino', "Pulo't Frappe", v2(140,160, '16oz Medium', '22oz Large')),
    create('frappuccino', 'Homemade Chocolate', v2(155,175, '16oz Medium', '22oz Large')),
    create('frappuccino', 'Blueberry Frappe', v2(140,160, '16oz Medium', '22oz Large')),

    // Hot Drinks
    create('hot-drinks', 'Matcha', v2(140,160)),
    create('hot-drinks', "Pulo't", v2(140,160)),
    create('hot-drinks', 'Cappuccino', v2(140,160)),
    create('hot-drinks', 'Macadamia', v2(140,160)),
    create('hot-drinks', 'Mocha', v2(140,160)),
    create('hot-drinks', 'Vietnamese', v2(140,160)),
    create('hot-drinks', 'Hot Chocolate', v2(140,160)),
    create('hot-drinks', 'Espanner Latte', v2(149,160)),

    // Oat Milk Based
    create('oat-milk', 'Oat Latte', v2(125,145)),
    create('oat-milk', 'Spanish Oat Lattee', v2(125,145)),
    create('oat-milk', 'White Mocha Oat', v2(125,145)),
    create('oat-milk', 'Caramel Oat', v2(125,145)),

    // Coffee Special
    create('coffee-special', "Pulo't Coffee", v2(140,160)),
    create('coffee-special', 'Tiramisu', v2(130,150)),
    create('coffee-special', 'Barista Drink', v2(120,140)),
    create('coffee-special', 'Caramel Macchiato', v2(90,110)),
    create('coffee-special', 'Sea Salt Latte', v2(90,110)),
    create('coffee-special', 'Biscoff', v2(100,120)),
    create('coffee-special', 'Espanner Latte', v2(90,110)),

    // Non Coffee
    create('non-coffee', 'Cocoa Dark Chocolate', v2(90,110)),
    create('non-coffee', 'Chocolate Float', v2(90,110)),
    create('non-coffee', 'Strawberry Float', v2(90,110)),
    create('non-coffee', 'Blueberry Milk', v2(90,110)),
    create('non-coffee', 'Passion Fruit Tea', v2(90,110)),

    // Matcha Series
    create('matcha-series', 'Matcha Latte', v2(90,110)),
    create('matcha-series', 'Spanish Matcha', v2(100,129)),
    create('matcha-series', 'Oat Milk Matcha', v2(125,145)),
    create('matcha-series', 'Ice Cream Matcha', v2(120,120)),
    create('matcha-series', 'White Choco Matcha', v2(110,130)),
    create('matcha-series', 'Matcha Espanner', v2(100,120)),
    create('matcha-series', 'Dirty Matcha', v2(120,140)),
    create('matcha-series', 'Strawberry Matcha', v2(120,140)),
    create('matcha-series', 'Chocoberry Matcha', v2(120,140)),

    // Juices
    create('juices', 'Aloe Vera', v2(70,90)),
    create('juices', 'Lemonade', v2(65,85)),
    create('juices', 'Mango Lemonade', v2(85,105)),
    create('juices', 'Mandarin', v2(70,90)),
    create('juices', 'Frozen Lemonade Peppermint', v2(140,160)),
    create('juices', 'Citrus Sunset', v2(85,105)),

    // Appetizers
    create('appetizers', 'Nachos', single(170)),
    create('appetizers', 'Cheesy Quesadillas', single(150)),

    // Salad
    create('salad', 'Olives and Lemon Salad', single(200)),

    // Pasta
    create('pasta', 'Pesto Pasta', single(230)),
    create('pasta', 'Bolognese Pasta', single(180)),
    create('pasta', 'Lasagna', single(185)),
    create('pasta', 'Chicken Pasta', single(175)),
    create('pasta', 'Creamy Carbonara', single(170)),
    create('pasta', 'Spanish Sardines', single(170)),
    create('pasta', 'Oglio', single(170)),

    // Rice Meals
    create('rice-meals', 'Fish Fillet with Veggies', single(180)),
    create('rice-meals', 'Chicken Pesto', single(230)),
    create('rice-meals', 'Salisbury Steak (Double Patty)', single(165)),
    create('rice-meals', 'Mongolian Beef', single(190)),
    create('rice-meals', 'Steak and Fries', single(350)),

    // Sandwich
    create('sandwich', 'New Yorker', single(95)),
    create('sandwich', 'Grilled Cheese', single(90)),
    create('sandwich', 'Garlic Bread', single(60)),
    create('sandwich', 'Ham & Cheese', single(95))
  ];

  const extrasCatalog = [
    { key: 'kimchi', name: 'kimchi', price: 15 },
    { key: 'lettuce', name: 'lettuce', price: 15 },
    { key: 'corn', name: 'corn', price: 10 },
    { key: 'egg', name: 'sunny side up egg', price: 15 },
    { key: 'seaweeds', name: 'seaweeds', price: 10 },
    { key: 'pickles', name: 'pickles', price: 10 }
  ];

  const els = {
    productsGrid: document.getElementById('productsGrid'),
    categoryViewBtn: document.getElementById('categoryViewBtn'),
    productViewBtn: document.getElementById('productViewBtn'),
    categoryView: document.getElementById('categoryView'),
    productView: document.getElementById('productView'),
    cartCount: document.getElementById('cartCount'),
    cartTotal: document.getElementById('cartTotal'),
    searchInput: document.getElementById('searchInput'),
    searchBtn: document.getElementById('searchBtn'),
    filterBar: document.querySelector('.filter-bar'),
    categoriesGrid: document.querySelector('.categories-grid'),
    chips: null
  };

  // Cart state
  const CART_KEY = 'mauiz-cart-v1';
  const loadCart = () => { try { return JSON.parse(localStorage.getItem(CART_KEY) || '[]'); } catch { return []; } };
  const saveCart = (items) => localStorage.setItem(CART_KEY, JSON.stringify(items));

  const money = (n) => (n||0).toFixed(2);
  const getVariants = (p) => (Array.isArray(p.variants) && p.variants.length>0) ? p.variants : single(p.price || 0);
  const getMinMaxPrice = (p) => {
    const vars = getVariants(p);
    let min = Infinity, max = -Infinity;
    for(const v of vars){ min = Math.min(min, v.price); max = Math.max(max, v.price); }
    if(min === Infinity){ min = 0; max = 0; }
    return { min, max };
  };

  function cartTotals(){
    const cart = loadCart();
    let count = 0, total = 0;
    for(const item of cart){
      count += item.qty;
      const extrasTotal = (item.extras||[]).reduce((s,e)=> s + (e.price * e.qty), 0);
      const unitPrice = item.variant ? item.variant.price : item.price;
      total += (unitPrice + extrasTotal) * item.qty;
    }
    els.cartCount.textContent = count;
    els.cartTotal.textContent = money(total);
  }

  function renderProducts(filter='all', query=''){
    const list = products.filter(p => (filter==='all' || p.category===filter) && p.name.toLowerCase().includes(query.toLowerCase()));
    els.productsGrid.innerHTML = list.map(p => {
      const { min, max } = getMinMaxPrice(p);
      const priceText = (min===max) ? `₱${money(min)}` : `₱${money(min)} - ₱${money(max)}`;
      return `
      <article class="product-card" data-id="${p.id}" data-category="${p.category}">
        <div class="image"><img src="${p.image}" alt="${p.name}"></div>
        <div class="content">
          <div class="title">${p.name}</div>
          <div class="price">${priceText}</div>
          <button class="btn-add" data-add="${p.id}"><i class="fa-solid fa-cart-plus"></i> Add to cart</button>
        </div>
      </article>`;
    }).join('');

    els.productsGrid.querySelectorAll('[data-add]').forEach(btn =>{
      btn.addEventListener('click', () => openModal(btn.getAttribute('data-add')));
    });
  }

  
  els.categoryViewBtn.addEventListener('click', ()=>{
    els.categoryView.classList.remove('d-none');
    els.productView.classList.add('d-none');
    els.categoryViewBtn.classList.add('active');
    els.productViewBtn.classList.remove('active');
  });
  els.productViewBtn.addEventListener('click', ()=>{
    els.categoryView.classList.add('d-none');
    els.productView.classList.remove('d-none');
    els.categoryViewBtn.classList.remove('active');
    els.productViewBtn.classList.add('active');
  });

  
  // Category view is rendered dynamically; use event delegation
  els.categoriesGrid.addEventListener('click', (e)=>{
    const card = e.target.closest('.category-card');
    if(!card) return;
    const cat = card.getAttribute('data-category');
    els.productViewBtn.click();
    setActiveChip(cat);
    renderProducts(cat, els.searchInput.value);
  });

  
  function bindChips(){
    els.filterBar.querySelectorAll('.chip').forEach(ch => ch.addEventListener('click', () =>{
      const val = ch.getAttribute('data-filter');
      setActiveChip(val);
      renderProducts(val, els.searchInput.value);
    }));
  }
  function setActiveChip(value){
    els.filterBar.querySelectorAll('.chip').forEach(c=> c.classList.toggle('active', c.getAttribute('data-filter')===value));
  }

  
  function doSearch(){
    const active = document.querySelector('.chip.active')?.getAttribute('data-filter') || 'all';
    renderProducts(active, els.searchInput.value);
  }
  els.searchBtn.addEventListener('click', doSearch);
  els.searchInput.addEventListener('keydown', (e)=>{ if(e.key==='Enter'){ e.preventDefault(); doSearch(); }});

  
  const overlay = document.getElementById('modalOverlay');
  const modalTitle = document.getElementById('modalTitle');
  const qtyMinus = document.getElementById('qtyMinus');
  const qtyPlus = document.getElementById('qtyPlus');
  const qtyValue = document.getElementById('qtyValue');
  const extrasList = document.getElementById('extrasList');
  const itemNotes = document.getElementById('itemNotes');
  const modalBody = overlay.querySelector('.modal-body');
  const onClose = ()=> overlay.classList.add('d-none');
  document.getElementById('modalClose').addEventListener('click', onClose);
  document.getElementById('modalCancel').addEventListener('click', onClose);

  let currentProduct = null; let currentQty = 1; let extrasState = {}; let currentVariantKey = null;

  function openModal(productId){
    currentProduct = products.find(p=>p.id===productId);
    if(!currentProduct) return;
    currentQty = 1; qtyValue.textContent = String(currentQty);
    extrasState = {}; itemNotes.value='';
    const variants = getVariants(currentProduct);
    currentVariantKey = variants[0]?.key || 'regular';
    modalTitle.textContent = `${currentProduct.name}`;

    // Render variants selector just before the Extras section
    let variantsContainer = modalBody.querySelector('#variantsList');
    if(!variantsContainer){
      variantsContainer = document.createElement('div');
      variantsContainer.id = 'variantsList';
      variantsContainer.className = 'variants';
      const extrasSection = modalBody.querySelector('.extras');
      modalBody.insertBefore(variantsContainer, extrasSection ?? modalBody.firstChild);
    }
    variantsContainer.innerHTML = `
      <div class="variants-title">Choose Size</div>
      <div class="variants-options">
        ${variants.map(v => `
          <label class="variant-option">
            <input type="radio" name="variant" value="${v.key}" ${v.key===currentVariantKey ? 'checked' : ''}>
            <span>${v.name}</span>
            <strong>₱${money(v.price)}</strong>
          </label>
        `).join('')}
      </div>
    `;
    variantsContainer.querySelectorAll('input[name="variant"]').forEach(r =>{
      r.addEventListener('change', ()=>{ currentVariantKey = r.value; });
    });

    // Render extras
    extrasList.innerHTML = extrasCatalog.map(ex =>{
      return `
        <div class="extra-item" data-extra="${ex.key}">
          <div><span class="badge">${ex.name} + ₱${ex.price}</span></div>
          <div class="extra-counter">
            <button class="qty-btn" data-minus="${ex.key}">-</button>
            <span data-val="${ex.key}">0</span>
            <button class="qty-btn" data-plus="${ex.key}">+</button>
          </div>
        </div>`;
    }).join('');

    overlay.classList.remove('d-none');

    qtyMinus.onclick = ()=>{ if(currentQty>1){ currentQty--; qtyValue.textContent = String(currentQty); } };
    qtyPlus.onclick = ()=>{ currentQty++; qtyValue.textContent = String(currentQty); };

    extrasList.querySelectorAll('[data-minus]').forEach(btn=> btn.addEventListener('click', ()=> changeExtra(btn.getAttribute('data-minus'), -1)));
    extrasList.querySelectorAll('[data-plus]').forEach(btn=> btn.addEventListener('click', ()=> changeExtra(btn.getAttribute('data-plus'), +1)));
  }

  function changeExtra(key, delta){
    const val = Math.max(0, (extrasState[key]||0) + delta);
    extrasState[key] = val;
    const sp = extrasList.querySelector(`[data-val="${key}"]`);
    if(sp) sp.textContent = String(val);
  }

  document.getElementById('modalConfirm').addEventListener('click', ()=>{
    if(!currentProduct) return;
    const extrasArr = Object.entries(extrasState)
      .filter(([,qty])=> qty>0)
      .map(([k,qty])=>{
        const ex = extrasCatalog.find(e=>e.key===k);
        return { key:k, name:ex.name, price:ex.price, qty };
      });

    const variant = getVariants(currentProduct).find(v => v.key === currentVariantKey) || getVariants(currentProduct)[0];
    const cart = loadCart();
    cart.push({ id: currentProduct.id, name: currentProduct.name, price: variant.price, variant, qty: currentQty, extras: extrasArr, notes: itemNotes.value });
    saveCart(cart);
    cartTotals();
    overlay.classList.add('d-none');
  });

  // Render dynamic filter chips and category view
  const CATEGORY_LABELS = {
    'coffee-iced': 'Coffee Based (Iced Coffee)',
    'frappuccino': 'Frappuccino',
    'hot-drinks': 'Hot Drinks',
    'oat-milk': 'Oat Milk Based',
    'coffee-special': 'Coffee Special',
    'non-coffee': 'Non Coffee',
    'matcha-series': 'Matcha Series',
    'juices': 'Juices',
    'appetizers': 'Appetizers',
    'salad': 'Salad',
    'pasta': 'Pasta',
    'rice-meals': 'Rice Meals',
    'sandwich': 'Sandwich'
  };

  function computeCategories(){
    const map = new Map();
    for(const p of products){
      const entry = map.get(p.category) || { key: p.category, name: CATEGORY_LABELS[p.category] || p.category, count: 0 };
      entry.count += 1; map.set(p.category, entry);
    }
    return Array.from(map.values());
  }
  function renderChips(){
    const cats = computeCategories();
    els.filterBar.innerHTML = [
      '<div class="chip active" data-filter="all">All</div>',
      ...cats.map(c => `<div class="chip" data-filter="${c.key}">${c.name}</div>`)
    ].join('');
    bindChips();
  }
  function renderCategoryView(){
    const cats = computeCategories();
    els.categoriesGrid.innerHTML = cats.map(c => `
      <article class="category-card" data-category="${c.key}">
        <div class="icon"><i class="fa-solid fa-bowl-food"></i></div>
        <h3>${c.name}</h3>
        <p class="muted"><span class="badge bg-light text-dark">${c.count} products</span></p>
      </article>`
    ).join('');
  }

  renderChips();
  renderCategoryView();
  renderProducts('all','');
  cartTotals();
})();