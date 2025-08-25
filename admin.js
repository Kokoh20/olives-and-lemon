(function(){
  const els = {
    ordersList: document.getElementById('ordersList'),
    productsList: document.getElementById('productsList'),
    refreshOrders: document.getElementById('refreshOrders'),
    newProduct: document.getElementById('newProduct')
  };

  async function fetchJSON(url, opts){
    const res = await fetch(url, Object.assign({ headers: { 'Content-Type': 'application/json' } }, opts));
    if(!res.ok){ throw new Error('HTTP '+res.status); }
    return res.json();
  }

  async function loadOrders(){
    const data = await fetchJSON('orders.php');
    const list = data.orders||[];
    els.ordersList.innerHTML = list.map(o=>{
      const items = (o.items||[]).map(i=> `${i.qty}× ${i.name}`).join(', ');
      return `
        <div class="card">
          <div class="card-body d-flex align-items-center gap-3">
            <div class="flex-grow-1">
              <div class="d-flex align-items-center gap-2">
                <div class="badge text-bg-secondary">${o.status||'new'}</div>
                <div class="fw-semibold">${o.customer?.name||''}</div>
                <div class="text-muted small ms-auto">${new Date(o.createdAt).toLocaleString()}</div>
              </div>
              <div class="small text-muted">${items}</div>
            </div>
            <div class="btn-group btn-group-sm">
              <button class="btn btn-outline-secondary" data-status="preparing" data-id="${o.id}">Preparing</button>
              <button class="btn btn-outline-secondary" data-status="ready" data-id="${o.id}">Ready</button>
              <button class="btn btn-outline-secondary" data-status="completed" data-id="${o.id}">Completed</button>
            </div>
          </div>
        </div>`;
    }).join('');

    els.ordersList.querySelectorAll('[data-status]').forEach(btn=>{
      btn.addEventListener('click', async ()=>{
        const id = btn.getAttribute('data-id');
        const status = btn.getAttribute('data-status');
        await fetchJSON('orders.php', { method:'PATCH', body: JSON.stringify({ id, status }) });
        await loadOrders();
      });
    });
  }

  function productRow(p){
    const moods = (p.moods||[]).join(', ');
    return `
      <div class="card">
        <div class="card-body d-flex align-items-center gap-3">
          <div class="flex-grow-1">
            <div class="d-flex align-items-center gap-2">
              <div class="fw-semibold">${p.name}</div>
              <div class="text-muted small">₱${(p.price||0).toFixed(2)}</div>
              <div class="ms-auto small text-muted">${p.category||''}</div>
            </div>
            <div class="small text-muted">Moods: ${moods}</div>
          </div>
          <div class="btn-group btn-group-sm">
            <button class="btn btn-outline-secondary" data-edit="${p.id}">Edit</button>
            <button class="btn btn-outline-danger" data-delete="${p.id}">Delete</button>
          </div>
        </div>
      </div>`;
  }

  async function loadProducts(){
    const data = await fetchJSON('products.php');
    const list = data.products||[];
    els.productsList.innerHTML = list.map(productRow).join('');

    els.productsList.querySelectorAll('[data-delete]').forEach(btn=>{
      btn.addEventListener('click', async ()=>{
        const id = btn.getAttribute('data-delete');
        if(!confirm('Delete this product?')) return;
        await fetchJSON('products.php', { method:'DELETE', body: JSON.stringify({ id }) });
        await loadProducts();
      });
    });

    els.productsList.querySelectorAll('[data-edit]').forEach(btn=>{
      btn.addEventListener('click', async ()=>{
        const id = btn.getAttribute('data-edit');
        const name = prompt('Name');
        const price = parseFloat(prompt('Price')||'0');
        const category = prompt('Category');
        const image = prompt('Image URL');
        const moods = (prompt('Moods (comma-separated)')||'').split(',').map(s=>s.trim()).filter(Boolean);
        await fetchJSON('products.php', { method:'PATCH', body: JSON.stringify({ id, name, price, category, image, moods }) });
        await loadProducts();
      });
    });
  }

  els.newProduct.addEventListener('click', async ()=>{
    const id = prompt('ID (leave blank to auto-generate)')||undefined;
    const name = prompt('Name')||'Untitled';
    const price = parseFloat(prompt('Price')||'0');
    const category = prompt('Category')||'misc';
    const image = prompt('Image URL')||'';
    const moods = (prompt('Moods (comma-separated)')||'').split(',').map(s=>s.trim()).filter(Boolean);
    await fetchJSON('products.php', { method:'POST', body: JSON.stringify({ id, name, price, category, image, moods }) });
    await loadProducts();
  });

  els.refreshOrders.addEventListener('click', loadOrders);

  loadOrders();
  loadProducts();
})();

