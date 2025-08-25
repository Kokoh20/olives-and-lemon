(function(){
  const products = [
    { id: 'Macchiato', name: 'Macchiato', price: 99, category: 'rice-bowl', image: 'assets/images/coffee7.jpg' },
    { id: 'Chocolate Donuts', name: 'Chocolate Donuts', price: 99, category: 'rice-bowl', image: 'assets/images/dessert3.jpg' },
    { id: 'Salted Caramel', name: 'Salted Caramel', price: 88, category: 'rice-bowl', image: 'assets/images/drink1.jpg' },
    { id: 'Yema Cake', name: 'Yema Cake', price: 99, category: 'rice-bowl', image: 'assets/images/cake16.jpg' },
    { id: 'Latte', name: 'Latte', price: 99, category: 'rice-bowl', image: 'assets/images/coffee6.jpg' },
    { id: 'Mini Red Velvel Cake', name: 'Mini Red Velvel Cake', price: 99, category: 'rice-bowl', image: 'assets/images/cake11.jpg' }
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
    chips: null
  };

  // Cart state
  const CART_KEY = 'mauiz-cart-v1';
  const loadCart = () => { try { return JSON.parse(localStorage.getItem(CART_KEY) || '[]'); } catch { return []; } };
  const saveCart = (items) => localStorage.setItem(CART_KEY, JSON.stringify(items));

  const money = (n) => (n||0).toFixed(2);

  function cartTotals(){
    const cart = loadCart();
    let count = 0, total = 0;
    for(const item of cart){
      count += item.qty;
      const extrasTotal = (item.extras||[]).reduce((s,e)=> s + (e.price * e.qty), 0);
      total += (item.price + extrasTotal) * item.qty;
    }
    els.cartCount.textContent = count;
    els.cartTotal.textContent = money(total);
  }

  function renderProducts(filter='all', query=''){
    const list = products.filter(p => (filter==='all' || p.category===filter) && p.name.toLowerCase().includes(query.toLowerCase()));
    els.productsGrid.innerHTML = list.map(p => `
      <article class="product-card" data-id="${p.id}" data-category="${p.category}">
        <div class="image"><img src="${p.image}" alt="${p.name}"></div>
        <div class="content">
          <div class="title">${p.name}</div>
          <div class="price">₱${money(p.price)}</div>
          <button class="btn-add" data-add="${p.id}"><i class="fa-solid fa-cart-plus"></i> Add to cart</button>
        </div>
      </article>
    `).join('');

    
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

  
  document.querySelectorAll('.category-card').forEach(card =>{
    card.addEventListener('click', ()=>{
      const cat = card.getAttribute('data-category');
      els.productViewBtn.click();
      setActiveChip(cat);
      renderProducts(cat, els.searchInput.value);
    });
  });

  
  document.querySelectorAll('.chip').forEach(ch => ch.addEventListener('click', () =>{
    const val = ch.getAttribute('data-filter');
    setActiveChip(val);
    renderProducts(val, els.searchInput.value);
  }));
  function setActiveChip(value){
    document.querySelectorAll('.chip').forEach(c=> c.classList.toggle('active', c.getAttribute('data-filter')===value));
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
  const onClose = ()=> overlay.classList.add('d-none');
  document.getElementById('modalClose').addEventListener('click', onClose);
  document.getElementById('modalCancel').addEventListener('click', onClose);

  let currentProduct = null; let currentQty = 1; let extrasState = {};

  function openModal(productId){
    currentProduct = products.find(p=>p.id===productId);
    if(!currentProduct) return;
    currentQty = 1; qtyValue.textContent = String(currentQty);
    extrasState = {}; itemNotes.value='';
    modalTitle.textContent = `Select Quantity (pcs):`;

    
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

    const cart = loadCart();
    cart.push({ id: currentProduct.id, name: currentProduct.name, price: currentProduct.price, qty: currentQty, extras: extrasArr, notes: itemNotes.value });
    saveCart(cart);
    cartTotals();
    overlay.classList.add('d-none');
  });

  
  renderProducts('all','');
  cartTotals();
})();