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
    placeOrder: document.getElementById('placeOrder')
  };

  let couponValue = 0;

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

  els.applyCoupon.addEventListener('click', ()=>{
    const code = (els.couponInput.value || '').trim().toUpperCase();
    
    if(code === 'PROMO10') couponValue = 10; else if(code === 'PROMO20') couponValue = 20; else couponValue = 0;
    render();
  });

  els.placeOrder.addEventListener('click', ()=>{
    const cart = loadCart();
    if (cart.length === 0) {
      alert('Your cart is empty.');
      return;
    }
    const name = document.getElementById('customerName')?.value.trim() || '';
    const phone = document.getElementById('phoneNumber')?.value.trim() || '';
    const address = document.getElementById('deliveryAddress')?.value.trim() || '';
    const type = document.querySelector('input[name="otype"]:checked')?.value || 'pickup';

    if (!name || !phone) {
      alert('Please provide your name and phone number.');
      return;
    }

    const subtotal = parseFloat(els.subtotal.textContent) || 0;
    const discount = parseFloat(els.discount.textContent) || 0;
    const payable = parseFloat(els.payable.textContent) || 0;

    const payload = {
      customer: { name, phone, address, type },
      items: cart,
      totals: { subtotal, discount, payable }
    };

    fetch('orders.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).then(r => r.json()).then(data =>{
      if (data && data.ok) {
        localStorage.removeItem(CART_KEY);
        const id = data.order && data.order.id;
        if (id) {
          window.location.href = 'track.html?id=' + encodeURIComponent(id);
        } else {
          window.location.href = 'store.html';
        }
      } else {
        alert(data && data.error ? 'Failed: ' + data.error : 'Failed to place order');
      }
    }).catch(err =>{
      console.error(err);
      alert('Network error while placing order.');
    });
  });

  render();
})();