(function(){
  const money = (n) => (n||0).toFixed(2);

  // ORDERS
  const ordersList = document.getElementById('ordersList');
  const refreshOrders = document.getElementById('refreshOrders');

  async function loadOrders(){
    ordersList.innerHTML = '<div class="text-muted">Loading…</div>';
    try {
      const res = await fetch('orders.php', { headers: { 'Accept': 'application/json' } });
      const data = await res.json();
      const orders = Array.isArray(data.orders) ? data.orders : [];
      ordersList.innerHTML = orders.map(o=>{
        const total = o?.totals?.payable ?? 0;
        const items = (o.items||[]).map(i=>`${i.qty}x ${i.name}`).join(', ');
        return `
          <div class="card">
            <div class="card-body d-flex align-items-center gap-3">
              <div class="flex-grow-1">
                <div class="d-flex align-items-center gap-2">
                  <span class="badge text-bg-secondary">${o.status||'new'}</span>
                  <div class="fw-bold">${o.customer?.name||'Customer'}</div>
                  <div class="text-muted small">${new Date(o.createdAt).toLocaleString()}</div>
                  <div class="ms-auto fw-bold">₱ ${money(total)}</div>
                </div>
                <div class="small text-muted">${items}</div>
              </div>
              <select class="form-select form-select-sm" data-status="${o.id}">
                ${['new','preparing','ready','completed','cancelled'].map(s=>`<option value="${s}" ${s===(o.status||'new')?'selected':''}>${s}</option>`).join('')}
              </select>
              <button class="btn btn-sm btn-outline-danger" data-delete="${o.id}"><i class="fa-solid fa-trash"></i></button>
            </div>
          </div>`;
      }).join('');

      ordersList.querySelectorAll('[data-status]').forEach(sel=>{
        sel.addEventListener('change', async ()=>{
          const id = sel.getAttribute('data-status');
          const status = sel.value;
          await fetch(`orders.php?id=${encodeURIComponent(id)}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify({ status })
          });
        });
      });
      ordersList.querySelectorAll('[data-delete]').forEach(btn=>{
        btn.addEventListener('click', async ()=>{
          const id = btn.getAttribute('data-delete');
          if(!confirm('Delete this order?')) return;
          await fetch(`orders.php?id=${encodeURIComponent(id)}`, { method: 'DELETE', headers: { 'Accept': 'application/json' } });
          loadOrders();
        });
      });
    } catch(err){
      console.error(err);
      ordersList.innerHTML = '<div class="text-danger">Failed to load orders.</div>';
    }
  }

  refreshOrders?.addEventListener('click', loadOrders);

  // PRODUCTS
  const productsList = document.getElementById('productsList');
  const p_id = document.getElementById('p_id');
  const p_name = document.getElementById('p_name');
  const p_price = document.getElementById('p_price');
  const p_category = document.getElementById('p_category');
  const p_image = document.getElementById('p_image');
  const saveProduct = document.getElementById('saveProduct');
  const deleteProduct = document.getElementById('deleteProduct');
  const clearProduct = document.getElementById('clearProduct');
  const newProductBtn = document.getElementById('newProductBtn');

  function fillForm(p){
    p_id.value = p?.id || '';
    p_name.value = p?.name || '';
    p_price.value = p?.price || '';
    p_category.value = p?.category || '';
    p_image.value = p?.image || '';
  }

  async function loadProducts(){
    productsList.innerHTML = '<div class="text-muted">Loading…</div>';
    try {
      const res = await fetch('products.php', { headers: { 'Accept': 'application/json' } });
      const data = await res.json();
      const products = Array.isArray(data.products) ? data.products : [];
      productsList.innerHTML = products.map(p=>`
        <div class="card">
          <div class="card-body d-flex align-items-center gap-3">
            <div class="flex-grow-1">
              <div class="d-flex align-items-center gap-2">
                <img src="${p.image}" alt="${p.name}" style="width:40px;height:40px;object-fit:cover;border-radius:6px;"/>
                <div class="fw-bold">${p.name}</div>
                <span class="badge text-bg-light">${p.category}</span>
                <div class="ms-auto fw-bold">₱ ${money(p.price)}</div>
              </div>
              <div class="text-muted small">${p.id}</div>
            </div>
            <button class="btn btn-sm btn-outline-secondary" data-edit="${p.id}"><i class="fa-solid fa-pen"></i></button>
            <button class="btn btn-sm btn-outline-danger" data-del="${p.id}"><i class="fa-solid fa-trash"></i></button>
          </div>
        </div>
      `).join('');

      productsList.querySelectorAll('[data-edit]').forEach(btn=> btn.addEventListener('click', ()=>{
        const id = btn.getAttribute('data-edit');
        const prod = products.find(x=>x.id===id);
        if(prod) fillForm(prod);
      }));
      productsList.querySelectorAll('[data-del]').forEach(btn=> btn.addEventListener('click', async ()=>{
        const id = btn.getAttribute('data-del');
        if(!confirm('Delete this product?')) return;
        await fetch(`products.php?id=${encodeURIComponent(id)}`, { method: 'DELETE', headers: { 'Accept': 'application/json' } });
        loadProducts();
      }));
    } catch(err){
      console.error(err);
      productsList.innerHTML = '<div class="text-danger">Failed to load products.</div>';
    }
  }

  saveProduct?.addEventListener('click', async ()=>{
    const payload = {
      id: (p_id.value||'').trim(),
      name: (p_name.value||'').trim(),
      price: parseFloat(p_price.value||'0'),
      category: (p_category.value||'').trim(),
      image: (p_image.value||'').trim()
    };
    if(!payload.name || payload.price<=0){
      alert('Name and positive price are required');
      return;
    }
    const method = payload.id ? 'PATCH' : 'POST';
    const url = payload.id ? `products.php?id=${encodeURIComponent(payload.id)}` : 'products.php';
    await fetch(url, { method, headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }, body: JSON.stringify(payload) });
    loadProducts();
  });

  deleteProduct?.addEventListener('click', async ()=>{
    const id = (p_id.value||'').trim();
    if(!id){ alert('Enter an ID to delete'); return; }
    if(!confirm('Delete this product?')) return;
    await fetch(`products.php?id=${encodeURIComponent(id)}`, { method: 'DELETE', headers: { 'Accept': 'application/json' } });
    loadProducts();
  });

  clearProduct?.addEventListener('click', ()=> fillForm({}));
  newProductBtn?.addEventListener('click', ()=> fillForm({}));

  // initial
  loadOrders();
  loadProducts();
})();
