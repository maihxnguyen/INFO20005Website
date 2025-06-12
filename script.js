// ──────────────────────────────────────────
// MODAL OPEN/CLOSE & SELECTION LOGIC
// ──────────────────────────────────────────
const modal = document.getElementById('product-modal');
if (modal) {
  const closeBtn = modal.querySelector('.modal-close');
  const overlay  = modal.querySelector('.modal-overlay');
  const qtySpan  = modal.querySelector('#modal-qty');
  const incBtn   = modal.querySelector('#modal-qty-inc');
  const decBtn   = modal.querySelector('#modal-qty-dec');
  const addBtn   = modal.querySelector('#modal-add');

  function openModal(card) {
    modal.setAttribute('aria-hidden', 'false');
    const { title, price, img, desc, sizes, toppings } = card.dataset;
    modal.querySelector('#modal-title').textContent = title;
    modal.querySelector('#modal-price').textContent = price;
    modal.querySelector('#modal-desc').textContent  = desc;
    modal.querySelector('#modal-img').src           = img;
    modal.querySelector('#modal-img').alt           = title;

    // Build size buttons
    const sizesEl = modal.querySelector('#modal-sizes');
    sizesEl.innerHTML = '';
    JSON.parse(sizes).forEach((s, i) => {
      const btn = document.createElement('button');
      btn.textContent   = `${s.label} – $${s.price}`;
      btn.dataset.price = s.price;
      btn.className     = 'sizes-btn';
      if (i === 0) btn.classList.add('active');
      btn.addEventListener('click', () => {
        sizesEl.querySelectorAll('button').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
      sizesEl.appendChild(btn);
    });

    // Build toppings checkboxes
    const topEl = modal.querySelector('#modal-toppings');
    topEl.querySelectorAll('label').forEach(l => l.remove());
    JSON.parse(toppings).forEach(t => {
      const lbl = document.createElement('label');
      lbl.innerHTML = `<input type="checkbox" value="${t}"> ${t}`;
      topEl.appendChild(lbl);
    });

    // Reset quantity
    qtySpan.textContent = '1';
  }

  function closeModal() {
    modal.setAttribute('aria-hidden', 'true');
  }

  document.querySelectorAll('.view-btn').forEach(btn =>
    btn.addEventListener('click', e => {
      openModal(e.currentTarget.closest('.product-card'));
    })
  );
  closeBtn.addEventListener('click', closeModal);
  overlay.addEventListener('click', closeModal);

  incBtn.addEventListener('click', () =>
    qtySpan.textContent = +qtySpan.textContent + 1
  );
  decBtn.addEventListener('click', () => {
    let v = +qtySpan.textContent - 1;
    if (v > 0) qtySpan.textContent = v;
  });

  addBtn.addEventListener('click', () => {
    const title   = modal.querySelector('#modal-title').textContent;
    const sizeBtn = modal.querySelector('#modal-sizes button.active');
    const size    = sizeBtn ? sizeBtn.textContent.split('–')[0].trim() : '';
    const price   = sizeBtn ? parseFloat(sizeBtn.dataset.price) : 0;
    const qty     = parseInt(qtySpan.textContent, 10) || 1;

    const cart     = getCart();
    const existing = cart.find(x => x.title === title && x.size === size);
    if (existing) existing.qty += qty;
    else            cart.push({ title, size, price, qty });

    saveCart(cart);
    alert(`Added ${qty} × ${title} (${size}) to cart`);
    closeModal();
  });
}

// ──────────────────────────────────────────
// CART STORAGE & HEADER BADGE
// ──────────────────────────────────────────
function getCart() {
  return JSON.parse(localStorage.getItem('cart') || '[]');
}
function saveCart(cart) {
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartCount();
}
function updateCartCount() {
  const count = getCart().reduce((sum, item) => sum + item.qty, 0);
  const badge = document.getElementById('cart-count');
  if (badge) badge.textContent = count;
}

// ──────────────────────────────────────────
// CART PAGE RENDERER
// ──────────────────────────────────────────
function renderCartPage() {
  const cart = getCart();
  const tbody = document.getElementById('cart-items');
  if (!tbody) return;

  // clear existing rows
  tbody.innerHTML = '';

  // build rows + compute grand total
  let grandTotal = 0;
  cart.forEach(item => {
    const lineTotal = item.price * item.qty;
    grandTotal += lineTotal;

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${item.title}</td>
      <td>${item.size}</td>
      <td>${item.qty}</td>
      <td>$${item.price.toFixed(2)}</td>
      <td>$${lineTotal.toFixed(2)}</td>
    `;
    tbody.appendChild(tr);
  });

  // write grand total
  const gtEl = document.getElementById('grand-total');
  if (gtEl) gtEl.textContent = `$${grandTotal.toFixed(2)}`;
}

// ──────────────────────────────────────────
// SINGLE DOMCONTENTLOADED HANDLER
// ──────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // 1) Update the header badge
  updateCartCount();

  // 2) If we're on the CART page, render it
  const cartTbody = document.getElementById('cart-items');
  if (cartTbody) renderCartPage();

  // 3) If we're on the CONFIRMATION page, populate the user’s order
  if (document.querySelector('main.confirmation-page')) {
    const order = JSON.parse(localStorage.getItem('orderDetails') || '{}');
    console.log('Loading confirmation with:', order);
    document.getElementById('cust-name').textContent    = order.name    || '';
    document.getElementById('cust-address').textContent = order.address || '';
    document.getElementById('cust-phone').textContent   = order.phone   || '';
    const last4 = (order.card?.number || '').slice(-4);
    document.getElementById('card-numbe-last4').textContent = last4;
  }
});

// ──────────────────────────────────────────
// CHECKOUT FORM SUBMISSION
// ──────────────────────────────────────────
const checkoutForm = document.getElementById('checkout-form');
if (checkoutForm) {
  checkoutForm.addEventListener('submit', e => {
    e.preventDefault();

    // 1) HTML5 validity
    if (!checkoutForm.checkValidity()) {
      checkoutForm.reportValidity();
      return;
    }

    // 2) Gather & save
    const orderDetails = {
      name:    checkoutForm.name.value,
      phone:   checkoutForm.phone.value,
      address: checkoutForm.address.value,
      card: {
        number: checkoutForm.cardNumber.value,
        expiry: checkoutForm.expiry.value,
        cvv:    checkoutForm.cvv.value
      }
    };
    console.log('Saving orderDetails:', orderDetails);
    localStorage.setItem('orderDetails', JSON.stringify(orderDetails));

    // 3) Redirect
    window.location.href = 'confirmation.html';
  });
}
