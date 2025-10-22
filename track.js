(function(){
  const result = document.getElementById('result');
  const input = document.getElementById('trackId');
  const btn = document.getElementById('trackBtn');

  const params = new URLSearchParams(location.search);
  const prefill = params.get('id');
  if(prefill){ input.value = prefill; track(); startPolling(prefill); }

  btn.addEventListener('click', track);

  function track(){
    const id = (input.value||'').trim();
    if(!id){ input.focus(); return; }
    fetch('orders.php?id='+encodeURIComponent(id))
      .then(r=> r.json())
      .then(data =>{
        if(!data || !data.order){ result.innerHTML = `<div class="alert alert-warning">Order not found.</div>`; return; }
        render(data.order);
      }).catch(err =>{
        console.error(err);
        result.innerHTML = `<div class="alert alert-danger">Network error. Please try again.</div>`;
      });
  }

  function fmtMoney(n){ return (n||0).toFixed(2); }

  function render(o){
    const steps = ['new','preparing','ready','completed'];
    const activeIdx = Math.max(0, steps.indexOf(o.status||'new'));
    const items = (o.items||[]).map(it =>{
      const extras = (it.extras||[]).map(e=> e.qty>0? `<span class="badge text-bg-light me-1">${e.name} x${e.qty}</span>`:'').join(' ');
      return `<div>${it.qty} x <strong>${it.name}</strong> - ₱ ${fmtMoney(it.price)}<div class="small text-muted">${extras}</div></div>`;
    }).join('');

    result.innerHTML = `
      <div class="card">
        <div class="card-body">
          <div class="d-flex align-items-center gap-2">
            <div class="fw-bold">Order #${o.id}</div>
            <span class="badge text-bg-secondary status-badge">${o.status||'new'}</span>
            <div class="ms-auto muted">${o.createdAt||''}</div>
          </div>
          <div class="timeline mt-2">
            ${steps.map((s,idx)=> `<div class="dot ${idx<=activeIdx? 'active':''}"></div>`).join('')}
          </div>
          <hr>
          <div class="row g-3">
            <div class="col-md-6">
              <div class="fw-bold mb-1">Items</div>
              ${items}
            </div>
            <div class="col-md-6">
              <div class="fw-bold mb-1">Customer</div>
              <div>${o.customer?.name||''}</div>
              <div class="muted">${o.customer?.phone||''}</div>
              ${o.customer?.address ? `<div class="muted">${o.customer.address}</div>`:''}
              <hr>
              <div class="d-flex justify-content-between"><div>Subtotal</div><div>₱ ${fmtMoney(o.totals?.subtotal||0)}</div></div>
              <div class="d-flex justify-content-between"><div>Discount</div><div>- ₱ ${fmtMoney(o.totals?.discount||0)}</div></div>
              <div class="d-flex justify-content-between fw-bold"><div>Payable</div><div>₱ ${fmtMoney(o.totals?.payable||0)}</div></div>
            </div>
          </div>
        </div>
      </div>`;
  }

  let pollTimer = null;
  function startPolling(id){
    if(pollTimer) clearInterval(pollTimer);
    pollTimer = setInterval(() =>{
      fetch('orders.php?id='+encodeURIComponent(id))
        .then(r=> r.json())
        .then(data =>{ if(data && data.order){ render(data.order); } })
        .catch(()=>{});
    }, 5000);
  }
})();
