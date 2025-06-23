const loginContainer = document.getElementById('login-container');
const loginForm = document.getElementById('login-form');
const usernameInput = document.getElementById('username');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');

const appHeader = document.getElementById('app-header');
const greetingEl = document.getElementById('greeting');
const logoutBtn = document.getElementById('logout-btn');

const catalogSection = document.getElementById('catalog-section');
const catalogEl = document.getElementById('product-catalog');

const cartButtonEl = document.getElementById('cart-button');
const cartCountEl = document.getElementById('cart-count');
const cartModalEl = document.getElementById('cart-modal');
const cartCloseEl = document.getElementById('cart-close');
const cartItemsEl = document.getElementById('cart-items');
const cartTotalEl = document.getElementById('cart-total');
const clearCartBtn = document.getElementById('clear-cart');
const checkoutBtn = document.getElementById('checkout-btn');

const checkoutModalEl = document.getElementById('checkout-modal');
const checkoutCloseEl = document.getElementById('checkout-close');
const checkoutForm = document.getElementById('checkout-form');
const paymentMethodSelect = document.getElementById('payment-method');
const creditCardFields = document.getElementById('credit-card-fields');
const customerNameInput = document.getElementById('customer-name');
const customerAddressInput = document.getElementById('customer-address');
const cardNumberInput = document.getElementById('card-number');
const cardExpiryInput = document.getElementById('card-expiry');
const cardCvvInput = document.getElementById('card-cvv');
const orderConfirmationEl = document.getElementById('order-confirmation');
const confCloseBtn = document.getElementById('conf-close-btn');

let products = [];
let cart = [];

// ---------- Funções utilitárias ----------
function showElement(el) {
  el.classList.remove('hidden');
}
function hideElement(el) {
  el.classList.add('hidden');
}
function formatPrice(value) {
  return value.toLocaleString('pt-BR', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function truncateText(text, maxLength) {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '…';
}
function onlyDigits(str) {
  return str.replace(/\D+/g, '');
}

// Luhn para validar número de cartão
function luhnCheck(cardNumber) {
  const digits = onlyDigits(cardNumber);
  let sum = 0;
  let shouldDouble = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let d = parseInt(digits.charAt(i), 10);
    if (shouldDouble) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
    shouldDouble = !shouldDouble;
  }
  return (sum % 10) === 0;
}
// Validação de validade MM/AA: mês 01-12 e não expirado
function validateExpiry(expiry) {
  if (!/^\d{2}\/\d{2}$/.test(expiry)) return false;
  const [mmStr, yyStr] = expiry.split('/');
  const mm = parseInt(mmStr, 10);
  const yy = parseInt(yyStr, 10);
  if (mm < 1 || mm > 12) return false;
  const now = new Date();
  const currentYear = now.getFullYear() % 100; // dois dígitos
  const currentMonth = now.getMonth() + 1; // 1-12
  if (yy < currentYear) return false;
  if (yy === currentYear && mm < currentMonth) return false;
  return true;
}

// ---------- Máscaras e listeners de formatação de cartão ----------
cardNumberInput.addEventListener('input', (e) => {
  let digits = onlyDigits(e.target.value).slice(0, 16);
  const parts = [];
  for (let i = 0; i < digits.length; i += 4) {
    parts.push(digits.substring(i, i + 4));
  }
  e.target.value = parts.join(' ');
});

// Validade: "MM/AA"
cardExpiryInput.addEventListener('input', (e) => {
  let val = onlyDigits(e.target.value).slice(0, 4);
  if (val.length >= 3) {
    val = val.slice(0, 2) + '/' + val.slice(2);
  }
  e.target.value = val;
});

// CVV: até 3 dígitos
cardCvvInput.addEventListener('input', (e) => {
  let digits = onlyDigits(e.target.value).slice(0, 3);
  e.target.value = digits;
});

// ---------- Inicialização: verificar estado de login e carregar carrinho do localStorage ----------
document.addEventListener('DOMContentLoaded', () => {
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  if (isLoggedIn) {
    const userName = localStorage.getItem('userName') || '';
    showApp(userName);
    loadCartFromStorage();
    fetchProducts();
    updateCartDisplay();
  } else {
    showLogin();
  }
});

// ---------- Login / Logout ----------
function showLogin() {
  loginContainer.classList.remove('hidden');
  appHeader.classList.add('hidden');
  catalogSection.classList.add('hidden');
}

function showApp(userName) {
  loginContainer.classList.add('hidden');
  appHeader.classList.remove('hidden');
  catalogSection.classList.remove('hidden');
  greetingEl.textContent = `Olá, ${userName}`;
}

loginForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const name = usernameInput.value.trim();
  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();
  if (!name || !email || !password) {
    alert('Preencha nome, e-mail e senha.');
    return;
  }
  // Simula autenticação bem-sucedida
  localStorage.setItem('isLoggedIn', 'true');
  localStorage.setItem('userName', name);
  localStorage.setItem('userEmail', email);
  showApp(name);
  loadCartFromStorage();
  fetchProducts();
  updateCartDisplay();
  loginForm.reset();
});

logoutBtn.addEventListener('click', () => {
  localStorage.removeItem('isLoggedIn');
  localStorage.removeItem('userName');
  localStorage.removeItem('userEmail');
  localStorage.removeItem('cart');
  cart = [];
  updateCartDisplay();
  closeCartModal();
  closeCheckoutModal();
  showLogin();
});

// ---------- Fetch e Render de Produtos ----------
async function fetchProducts() {
  catalogEl.innerHTML = '<p>Carregando produtos...</p>';
  try {
    const res = await fetch('https://fakestoreapi.com/products');
    if (!res.ok) throw new Error('Falha ao buscar produtos');
    products = await res.json();
    renderProducts();
  } catch (error) {
    console.error(error);
    catalogEl.innerHTML = '<p>Erro ao carregar produtos. Tente novamente mais tarde.</p>';
  }
}

function renderProducts() {
  catalogEl.innerHTML = '';
  products.forEach(prod => {
    const card = document.createElement('div');
    card.className = 'product-card';

    const img = document.createElement('img');
    img.src = prod.image;
    img.alt = prod.title;

    const title = document.createElement('h3');
    title.className = 'product-title';
    title.textContent = prod.title;

    const price = document.createElement('p');
    price.className = 'product-price';
    price.textContent = `R$ ${formatPrice(prod.price)}`;

    const desc = document.createElement('p');
    desc.className = 'product-description';
    desc.textContent = truncateText(prod.description, 100);

    const btn = document.createElement('button');
    btn.className = 'btn';
    btn.textContent = 'Adicionar ao Carrinho';
    btn.addEventListener('click', (e) => {
      e.target.classList.add('jump');
      e.target.addEventListener('animationend', () => {
        e.target.classList.remove('jump');
      }, { once: true });
      cartButtonEl.classList.add('shake');
      cartButtonEl.addEventListener('animationend', () => {
        cartButtonEl.classList.remove('shake');
      }, { once: true });

      addToCart(prod.id);
    });

    card.append(img, title, price, desc, btn);
    catalogEl.appendChild(card);
  });
}

// ---------- Carrinho: carregar/salvar em localStorage ----------
function loadCartFromStorage() {
  const stored = localStorage.getItem('cart');
  if (stored) {
    try {
      cart = JSON.parse(stored);
    } catch {
      cart = [];
    }
  } else {
    cart = [];
  }
}
function saveCartToStorage() {
  localStorage.setItem('cart', JSON.stringify(cart));
}

// Adiciona ao carrinho ou incrementa quantidade
function addToCart(prodId) {
  const item = cart.find(ci => ci.id === prodId);
  if (item) {
    item.quantity += 1;
  } else {
    const prod = products.find(p => p.id === prodId);
    if (!prod) return;
    cart.push({ id: prodId, title: prod.title, price: prod.price, image: prod.image, quantity: 1 });
  }
  saveCartToStorage();
  updateCartDisplay();
}

// Atualiza badge do carrinho
function updateCartDisplay() {
  const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  cartCountEl.textContent = totalCount;
}

// Renderiza itens no modal do carrinho, com controles de quantidade
function renderCartItems() {
  cartItemsEl.innerHTML = '';
  if (cart.length === 0) {
    cartItemsEl.innerHTML = '<p>O carrinho está vazio.</p>';
    cartTotalEl.textContent = '0.00';
    clearCartBtn.disabled = true;
    checkoutBtn.disabled = true;
    return;
  }

  clearCartBtn.disabled = false;
  checkoutBtn.disabled = false;

  cart.forEach(item => {
    const itemEl = document.createElement('div');
    itemEl.className = 'cart-item';

    const img = document.createElement('img');
    img.src = item.image;
    img.alt = item.title;

    const infoDiv = document.createElement('div');
    infoDiv.className = 'cart-item-info';

    const titleEl = document.createElement('p');
    titleEl.className = 'cart-item-title';
    titleEl.textContent = truncateText(item.title, 30);

    const priceEl = document.createElement('p');
    priceEl.className = 'cart-item-price';
    priceEl.textContent = `R$ ${formatPrice(item.price)}`;

    infoDiv.append(titleEl, priceEl);

    // Controles de quantidade
    const qtyControls = document.createElement('div');
    qtyControls.className = 'cart-item-quantity-controls';

    const decBtn = document.createElement('button');
    decBtn.textContent = '−';
    decBtn.title = 'Diminuir quantidade';
    decBtn.addEventListener('click', () => decreaseQuantity(item.id));

    const qtySpan = document.createElement('span');
    qtySpan.textContent = item.quantity;

    const incBtn = document.createElement('button');
    incBtn.textContent = '+';
    incBtn.title = 'Aumentar quantidade';
    incBtn.addEventListener('click', () => increaseQuantity(item.id));

    qtyControls.append(decBtn, qtySpan, incBtn);

    // Botão remover completamente
    const removeBtn = document.createElement('button');
    removeBtn.className = 'btn btn-remove small-btn';
    removeBtn.textContent = 'Remover Tudo';
    removeBtn.addEventListener('click', () => removeAllFromCart(item.id));

    itemEl.append(img, infoDiv, qtyControls, removeBtn);
    cartItemsEl.appendChild(itemEl);
  });

  const totalValue = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  cartTotalEl.textContent = formatPrice(totalValue);
}

function decreaseQuantity(prodId) {
  const idx = cart.findIndex(ci => ci.id === prodId);
  if (idx > -1) {
    if (cart[idx].quantity > 1) {
      cart[idx].quantity -= 1;
    } else {
      cart.splice(idx, 1)
    }
    saveCartToStorage();
    updateCartDisplay();
    renderCartItems();
  }
}

function increaseQuantity(prodId) {
  const item = cart.find(ci => ci.id === prodId);
  if (item) {
    item.quantity += 1;
    saveCartToStorage();
    updateCartDisplay();
    renderCartItems();
  }
}

function removeAllFromCart(prodId) {
  const idx = cart.findIndex(ci => ci.id === prodId);
  if (idx > -1) {
    cart.splice(idx, 1);
    saveCartToStorage();
    updateCartDisplay();
    renderCartItems();
  }
}

function clearCart() {
  if (confirm('Deseja esvaziar todo o carrinho?')) {
    cart = [];
    saveCartToStorage();
    updateCartDisplay();
    renderCartItems();
  }
}

// ---------- Modal do carrinho: abrir/fechar ----------
function openCartModal() {
  renderCartItems();
  cartModalEl.style.display = 'block';
}
function closeCartModal() {
  cartModalEl.style.display = 'none';
}
cartButtonEl.addEventListener('click', openCartModal);
cartCloseEl.addEventListener('click', closeCartModal);
clearCartBtn.addEventListener('click', clearCart);
checkoutBtn.addEventListener('click', () => {
  closeCartModal();
  openCheckoutModal();
});
window.addEventListener('click', (e) => {
  if (e.target === cartModalEl) {
    closeCartModal();
  }
});

// ---------- Checkout: abrir/fechar ----------
function openCheckoutModal() {
  checkoutForm.reset();
  orderConfirmationEl.innerHTML = '';
  showElement(checkoutForm);
  hideElement(orderConfirmationEl);
  creditCardFields.classList.add('hidden');
  checkoutModalEl.style.display = 'block';
}
function closeCheckoutModal() {
  checkoutModalEl.style.display = 'none';
}
checkoutCloseEl.addEventListener('click', closeCheckoutModal);
window.addEventListener('click', (e) => {
  if (e.target === checkoutModalEl) {
    closeCheckoutModal();
  }
});

// Mostrar ou esconder campos de cartão conforme método
paymentMethodSelect.addEventListener('change', () => {
  const metodo = paymentMethodSelect.value;
  if (metodo === 'Cartão de Crédito') {
    creditCardFields.classList.remove('hidden');
    cardNumberInput.required = true;
    cardExpiryInput.required = true;
    cardCvvInput.required = true;
  } else {
    creditCardFields.classList.add('hidden');
    cardNumberInput.required = false;
    cardExpiryInput.required = false;
    cardCvvInput.required = false;
  }
});

// ---------- Submissão do formulário de checkout com validação rígida ----------
checkoutForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const name = customerNameInput.value.trim();
  const address = customerAddressInput.value.trim();
  const paymentMethod = paymentMethodSelect.value;
  if (!name || !address || !paymentMethod) {
    alert('Preencha todos os campos obrigatórios.');
    return;
  }
  if (paymentMethod === 'Cartão de Crédito') {
    const cardNumRaw = cardNumberInput.value.trim();
    const expiryRaw = cardExpiryInput.value.trim();
    const cvvRaw = cardCvvInput.value.trim();
    // Verifica 16 dígitos no número do cartão
    const digitsCard = onlyDigits(cardNumRaw);
    if (digitsCard.length !== 16) {
      alert('Número de cartão deve ter 16 dígitos.');
      return;
    }
    if (!luhnCheck(cardNumRaw)) {
      alert('Número de cartão inválido.');
      return;
    }
    // Validação de validade
    if (!validateExpiry(expiryRaw)) {
      alert('Validade inválida ou expirado. Use MM/AA correto.');
      return;
    }
    // CVV 3 dígitos
    if (!/^\d{3}$/.test(cvvRaw)) {
      alert('CVV deve ter 3 dígitos.');
      return;
    }
  }
  if (paymentMethod === 'Pix' || paymentMethod === 'Boleto') {
    alert(`Bom, aqui você finge que pagou um ${paymentMethod.toLowerCase()}, obrigado pela preferência 😗`);
  }

  // Confirmação do pedido
  const totalValue = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  orderConfirmationEl.innerHTML = '';
  const title = document.createElement('h3');
  title.textContent = 'Pedido Confirmado!';
  orderConfirmationEl.appendChild(title);

  const p1 = document.createElement('p');
  p1.textContent = `Obrigado, ${name}! Seu pedido de R$ ${formatPrice(totalValue)} foi recebido.`;
  orderConfirmationEl.appendChild(p1);

  const p2 = document.createElement('p');
  p2.textContent = `Método de pagamento: ${paymentMethod}.`;
  orderConfirmationEl.appendChild(p2);

  const p3 = document.createElement('p');
  p3.textContent = `Será entregue em: ${address}.`;
  orderConfirmationEl.appendChild(p3);

  const itemsTitle = document.createElement('h4');
  itemsTitle.textContent = 'Itens:';
  orderConfirmationEl.appendChild(itemsTitle);

  const ul = document.createElement('ul');
  cart.forEach(item => {
    const li = document.createElement('li');
    li.textContent = `${item.title} x${item.quantity} (R$ ${formatPrice(item.price)})`;
    ul.appendChild(li);
  });
  orderConfirmationEl.appendChild(ul);

  // Botão de fechar confirmação
  if (confCloseBtn) {
    // Se existe no HTML, apenas mostra
    showElement(confCloseBtn);
  } else {
    // Caso não exista, cria dinamicamente
    const btn = document.createElement('button');
    btn.id = 'conf-close-btn';
    btn.className = 'btn small-btn';
    btn.textContent = 'Fechar';
    btn.addEventListener('click', () => closeCheckoutModal());
    orderConfirmationEl.appendChild(btn);
  }

  hideElement(checkoutForm);
  showElement(orderConfirmationEl);

  // Limpar carrinho após confirmação
  cart = [];
  saveCartToStorage();
  updateCartDisplay();
});

// Fechar confirmação via confCloseBtn se existir
if (confCloseBtn) {
  confCloseBtn.addEventListener('click', () => {
    closeCheckoutModal();
  });
}
