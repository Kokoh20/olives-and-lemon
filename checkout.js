(function(){
  const CART_KEY = 'mauiz-cart-v1';
  const loadCart = () => { try { return JSON.parse(localStorage.getItem(CART_KEY) || '[]'); } catch { return []; } };
  const saveCart = (items) => localStorage.setItem(CART_KEY, JSON.stringify(items));
  const money = (n) => (n||0).toFixed(2);

  const els = {
    orderList: document.getElementById('orderList'),
    subtotal: document.getElementById('subtotal'),
    discount: document.getElementById('discount'),
    payable: document.getElementById('payable'),
    cartCount: document.getElementById('cartCount'),
    cartTotal: document.getElementById('cartTotal'),
    couponInput: document.getElementById('couponInput'),
    applyCoupon: document.getElementById('applyCoupon'),
    placeOrder: document.getElementById('placeOrder'),
    clearCartBtn: document.getElementById('clearCartBtn'),
    emptyCartMsg: document.getElementById('emptyCartMsg'),
    scheduleDate: document.getElementById('scheduleDate'),
    scheduleTime: document.getElementById('scheduleTime'),
    tableNumber: document.getElementById('tableNumber'),
    ecoTrackerToggle: document.getElementById('ecoTrackerToggle'),
    ecoCupsSavedCheckout: document.getElementById('ecoCupsSavedCheckout'),
    mysteryAddBtn: document.getElementById('mysteryAddBtn')
  };

  let couponValue = 0;

  function estimateQueueTime(count){
    // Smarter ETA: base 2 min/item, plus 1 min per 3 items, plus schedule lead-in
    if(!count) return 0;
    const base = count * 2;
    const congestion = Math.floor(count/3);
    const scheduledLead = getScheduledTimestamp() ? 5 : 0; // add small buffer if scheduled
    return Math.max(1, base + congestion + scheduledLead);
  }

  const ECO_CUP_KEY = 'eco-cups-saved-v1';
  const getEcoCount = () => Number(localStorage.getItem(ECO_CUP_KEY)||'0');
  const setEcoCount = (n) => localStorage.setItem(ECO_CUP_KEY, String(n));

  const SCHED_KEY = 'mauiz-schedule-v1';
  function saveSchedule(){
    const data = {
      date: els.scheduleDate?.value || '',
      time: els.scheduleTime?.value || '',
      table: els.tableNumber?.value || '',
      eco: !!(els.ecoTrackerToggle && els.ecoTrackerToggle.checked)
    };
    localStorage.setItem(SCHED_KEY, JSON.stringify(data));
  }
  function loadSchedule(){
    try { return JSON.parse(localStorage.getItem(SCHED_KEY)||'{}'); } catch { return {}; }
  }
  function getScheduledTimestamp(){
    if(!els.scheduleDate || !els.scheduleTime) return 0;
    const d = els.scheduleDate.value; const t = els.scheduleTime.value;
    if(!d || !t) return 0;
    const ts = new Date(`${d}T${t}:00`).getTime();
    return isNaN(ts) ? 0 : ts;
  }

  function updatePlaceOrderState(cart){
    const itemCount = cart.reduce((s,i)=> s + (i.qty||0), 0);
    const disabled = itemCount === 0;
    els.placeOrder.disabled = disabled;
    if(disabled){
      els.placeOrder.textContent = 'PLACE ORDER';
    } else {
      const eta = estimateQueueTime(itemCount);
      els.placeOrder.textContent = `Place Order • Ready in ~${eta} min`;
    }
  }

  function calc(cart){
    let sub = 0; let count = 0;
    for(const item of cart){
      const extrasTotal = (item.extras||[]).reduce((s,e)=> s + (e.price * e.qty), 0);
      sub += (item.price + extrasTotal) * item.qty;
      count += item.qty;
    }
    const discount = Math.min(couponValue, sub);
    const total = sub - discount;
    els.subtotal.textContent = money(sub);
    els.discount.textContent = money(discount);
    els.payable.textContent = money(total);
    els.cartCount.textContent = count;
    els.cartTotal.textContent = money(total);
  }

  function render(){
    const cart = loadCart();
    els.orderList.innerHTML = cart.map((item, idx)=>{
      const extras = (item.extras||[]).map(e=> e.qty>0 ? `<span class="badge text-bg-light me-1">${e.name}</span>` : '').join(' ');
      return `
        <div class="card">
          <div class="card-body d-flex align-items-start gap-3">
            <div class="flex-grow-1">
              <div class="d-flex align-items-center gap-2 mb-1">
                <div class="btn-group btn-group-sm" role="group" aria-label="qty">
                  <button type="button" class="btn btn-outline-secondary" data-minus="${idx}">-</button>
                  <button type="button" class="btn btn-outline-secondary" disabled>${item.qty}</button>
                  <button type="button" class="btn btn-outline-secondary" data-plus="${idx}">+</button>
                </div>
                <div class="ms-2 fw-bold">${item.name}</div>
                <div class="ms-auto">₱ ${(item.price).toFixed(2)}</div>
              </div>
              <div class="text-muted small">${extras || ''}</div>
              ${item.notes? `<div class="small mt-1">Notes: ${item.notes}</div>`:''}
            </div>
            <button class="btn btn-sm btn-link text-danger" data-remove="${idx}"><i class="fa-solid fa-xmark"></i></button>
          </div>
        </div>`;
    }).join('');

    els.orderList.querySelectorAll('[data-minus]').forEach(btn=> btn.addEventListener('click', ()=> changeQty(+btn.getAttribute('data-minus'), -1)));
    els.orderList.querySelectorAll('[data-plus]').forEach(btn=> btn.addEventListener('click', ()=> changeQty(+btn.getAttribute('data-plus'), +1)));
    els.orderList.querySelectorAll('[data-remove]').forEach(btn=> btn.addEventListener('click', ()=> removeItem(+btn.getAttribute('data-remove'))));

    // Empty message visibility
    if(els.emptyCartMsg){ els.emptyCartMsg.style.display = cart.length ? 'none' : 'block'; }

    updatePlaceOrderState(cart);
    calc(cart);
  }

  function changeQty(index, delta){
    const cart = loadCart();
    if(!cart[index]) return;
    cart[index].qty = Math.max(1, cart[index].qty + delta);
    saveCart(cart); render();
  }

  function removeItem(index){
    const cart = loadCart();
    cart.splice(index,1);
    saveCart(cart); render();
  }

  if(els.applyCoupon){
    els.applyCoupon.addEventListener('click', ()=>{
      const code = (els.couponInput.value || '').trim().toUpperCase();
      if(code === 'PROMO10') couponValue = 10; else if(code === 'PROMO20') couponValue = 20; else couponValue = 0;
      render();
    });
  }

  if(els.clearCartBtn){
    els.clearCartBtn.addEventListener('click', ()=>{
      saveCart([]);
      render();
    });
  }

  // Schedule and eco tracker wiring
  (function initSchedule(){
    const saved = loadSchedule();
    if(els.scheduleDate && saved.date) els.scheduleDate.value = saved.date;
    if(els.scheduleTime && saved.time) els.scheduleTime.value = saved.time;
    if(els.tableNumber && saved.table) els.tableNumber.value = saved.table;
    if(els.ecoTrackerToggle) els.ecoTrackerToggle.checked = !!saved.eco;
    if(els.ecoCupsSavedCheckout) els.ecoCupsSavedCheckout.textContent = String(getEcoCount());

    els.scheduleDate?.addEventListener('change', saveSchedule);
    els.scheduleTime?.addEventListener('change', saveSchedule);
    els.tableNumber?.addEventListener('input', saveSchedule);
    els.ecoTrackerToggle?.addEventListener('change', ()=>{
      saveSchedule();
      // If toggled here, we don't increase eco count yet; it's increased when adding items in shop.js
    });
  })();

  // Mystery drink add (adds a random product placeholder)
  if(els.mysteryAddBtn){
    els.mysteryAddBtn.addEventListener('click', ()=>{
      const cart = loadCart();
      const mystery = { id: 'mystery', name: 'Mystery Drink', price: 99, qty: 1, extras: [], notes: 'Barista choice', ecoCup: !!(els.ecoTrackerToggle && els.ecoTrackerToggle.checked) };
      cart.push(mystery);
      saveCart(cart);
      render();
    });
  }

  if(els.placeOrder){
    els.placeOrder.addEventListener('click', ()=>{
      const cart = loadCart();
      if(!cart.length) return;
      alert('Thank you! This demo confirms the order locally. Integrate backend to process payments and delivery.');
      localStorage.removeItem(CART_KEY);
      window.location.href = 'store.html';
    });
  }

  render();
})();