// Modal open/close logic
const modal      = document.getElementById('product-modal');
const closeBtn   = modal.querySelector('.modal-close');
const overlay    = modal.querySelector('.modal-overlay');
const qtySpan    = modal.querySelector('#modal-qty');
const incBtn     = modal.querySelector('#modal-qty-inc');
const decBtn     = modal.querySelector('#modal-qty-dec');
const addBtn     = modal.querySelector('#modal-add');

// Helpers to populate modal fields
function openModal(card) {
  modal.setAttribute('aria-hidden','false');
  // pull data from card
  const { title, price, img, desc, sizes, toppings } = card.dataset;
  modal.querySelector('#modal-title').textContent = title;
  modal.querySelector('#modal-price').textContent = price;
  modal.querySelector('#modal-desc').textContent = desc;
  modal.querySelector('#modal-img').src = img;
  modal.querySelector('#modal-img').alt = title;

  // sizes
  const sizesEl = modal.querySelector('#modal-sizes');
  sizesEl.innerHTML = '';
  JSON.parse(sizes).forEach(s => {
    const btn = document.createElement('button');
    btn.textContent = `${s.label} – $${s.price}`;
    btn.dataset.price = s.price;
    btn.className = 'sizes-btn';  // style similarly to your .sizes button
    sizesEl.appendChild(btn);
  });

  // toppings
  const topEl = modal.querySelector('#modal-toppings');
  topEl.querySelectorAll('label').forEach(l=>l.remove());
  JSON.parse(toppings).forEach(t => {
    const lbl = document.createElement('label');
    lbl.innerHTML = `<input type="checkbox" value="${t}"> ${t}`;
    topEl.appendChild(lbl);
  });

  qtySpan.textContent = '1';
}

// close modal
function closeModal() {
  modal.setAttribute('aria-hidden','true');
}

// attach open listeners
document.querySelectorAll('.view-btn').forEach(btn => {
  btn.addEventListener('click', e => {
    const card = e.currentTarget.closest('.product-card');
    openModal(card);
  });
});
closeBtn.addEventListener('click', closeModal);
overlay.addEventListener('click', closeModal);

// qty controls inside modal
incBtn.addEventListener('click', ()=> qtySpan.textContent = +qtySpan.textContent + 1);
decBtn.addEventListener('click', ()=> {
  let v = +qtySpan.textContent - 1;
  if (v>0) qtySpan.textContent = v;
});

// add-to-cart from modal (stub)
addBtn.addEventListener('click', () => {
  alert(`Added ${qtySpan.textContent} × ${modal.querySelector('#modal-title').textContent} to cart`);
  closeModal();
});