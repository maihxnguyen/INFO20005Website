// ──────────────────────────────────────────
// MODAL OPEN/CLOSE & SELECTION LOGIC
// ──────────────────────────────────────────
const modal    = document.getElementById('product-modal');
const closeBtn = modal.querySelector('.modal-close');
const overlay  = modal.querySelector('.modal-overlay');
const qtySpan  = modal.querySelector('#modal-qty');
const incBtn   = modal.querySelector('#modal-qty-inc');
const decBtn   = modal.querySelector('#modal-qty-dec');
const addBtn   = modal.querySelector('#modal-add');

// Populate modal from clicked card
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

// Wire up modal triggers
document.querySelectorAll('.view-btn').forEach(btn =>
  btn.addEventListener('click', e => {
    openModal(e.currentTarget.closest('.product-card'));
  })
);
closeBtn.addEventListener('click', closeModal);
overlay.addEventListener('click', closeModal);

// Quantity controls
incBtn.addEventListener('click', () =>
  qtySpan.textContent = +qtySpan.textContent + 1
);
decBtn.addEventListener('click', () => {
  let v = +qtySpan.textContent - 1;
  if (v > 0) qtySpan.textContent = v;
});

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
// Initialize badge on load
document.addEventListener('DOMContentLoaded', updateCartCount);

// ──────────────────────────────────────────
// ADD TO CART (modal “Add” button)
// ──────────────────────────────────────────
addBtn.addEventListener('click', () => {
  const title = modal.querySelector('#modal-title').textContent;
  const sizeBtn = modal.querySelector('#modal-sizes button.active');
  const size    = sizeBtn ? sizeBtn.textContent.split('–')[0].trim() : '';
  const price   = sizeBtn ? parseFloat(sizeBtn.dataset.price) : 0;
  const qty     = parseInt(qtySpan.textContent, 10) || 1;

  const cart = getCart();
  const existing = cart.find(x => x.title === title && x.size === size);
  if (existing) {
    existing.qty += qty;
  } else {
    cart.push({ title, size, price, qty });
  }
  saveCart(cart);

  alert(`Added ${qty} × ${title} (${size}) to cart`);
  closeModal();
});
// ──────────────────────────────────────────
// DOMContentLoaded: update badge & render cart if present
// ──────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // 1) Update header badge
  updateCartCount();

  console.log('Cart in storage:', getCart());
console.log('Found cart-items element:', document.getElementById('cart-items'));


  // 2) If the cart table exists, render it
  const cartTbody = document.getElementById('cart-items');
  console.log('cart-items element:', cartTbody);
  if (cartTbody) {
    renderCartPage();
    console.log('renderCartPage() called');
  }
});



// When user submits the checkout form, save their details and go to confirmation
document.getElementById('checkout-form').addEventListener('submit', e => {
  e.preventDefault();
  const form = e.target;
  // gather values
  const orderDetails = {
    name:    form.name.value,
    phone:   form.phone.value,
    address: form.address.value,
    card: {
      number: form.cardNumber.value,
      expiry: form.expiry.value,
      cvv:    form.cvv.value
    }
  };
  // save to localStorage
  localStorage.setItem('orderDetails', JSON.stringify(orderDetails));
  // redirect
  window.location.href = 'confirmation.html';
});



 // checkout form 

document.getElementById('checkout-form').addEventListener('submit', e => {
  e.preventDefault();
  const form = e.target;


  if (!form.checkValidity()) {
    form.reportValidity();
    return; 
  }

  const orderDetails = {
    name:    form.name.value,
    phone:   form.phone.value,
    address: form.address.value,
    card: {
      number: form.cardNumber.value,
      expiry: form.expiry.value,
      cvv:    form.cvv.value
    }
  };


  localStorage.setItem('orderDetails', JSON.stringify(orderDetails));
  window.location.href = 'confirmation.html';
});
