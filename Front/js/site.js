fetch('api/cards.php')
  .then(response => response.json())
  .then(data => {
    const container = document.querySelector('.cards-container');
    const cardsHTML = data.map(card => `

  <section class="card" data-id="${card.id}" data-image="${escapeHtml(card.image)}" 
  data-name="${escapeHtml(card.name)}" data-category="${escapeHtml(card.category)}" 
  data-price="${card.price}" >

    <img src="uploads/${escapeHtml(card.image)}" alt="${escapeHtml(card.name)}">
    <article class="card-content">
      <h3>${escapeHtml(card.name)}</h3>
      <p>${escapeHtml(card.description)}</p>
      <span class="card-price">${escapeHtml(card.price)}€</span>
      <button class="btn-addToCart">Ajouter au panier</button>
    </article>
  </section>
`);
    container.innerHTML = cardsHTML.join('');
    cards = document.querySelectorAll('.card');
  });


// Parallax
const bg = document.querySelector('.parallax-bg');
const title = document.getElementById('parallaxTitle');

function updateParallax() {
  const scrolled = window.scrollY;
  bg.style.transform = `translateY(${scrolled * 0.4}px)`;

  if (title) {
    title.style.transform = `translateY(${scrolled * -0.15}px)`;
  }
}

window.addEventListener('scroll', () => {
  requestAnimationFrame(updateParallax);
});

// Rechercher + filtrer par catégorie
const searchInput = document.getElementById('searchInput');
let cards = document.querySelectorAll('.card');
const filterButtons = document.querySelectorAll('nav button[data-filter]');

let activeCategory = 'all';

function filterCards() {
  const query = searchInput.value.toLowerCase().trim();

  cards.forEach(card => {
    const name = (card.dataset.name || '').toLowerCase();
    const category = card.dataset.category || '';

    const matchesSearch = name.includes(query);
    const matchesCategory = activeCategory === 'all' || category === activeCategory;

    card.style.display = (matchesSearch && matchesCategory) ? 'block' : 'none';
  });
}

searchInput.addEventListener('input', filterCards);

filterButtons.forEach(button => {
  button.addEventListener('click', () => {
    filterButtons.forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');

    activeCategory = button.dataset.filter;
    filterCards();
  });
});
// En cliquant sur le cadenas on arrive sur la page login
document.getElementById('loginButton').addEventListener('click', function () { window.location.href = "login.html"; });

// Menu burger (mobile)
const burgerToggle = document.getElementById('burgerToggle');
const navLinks = document.getElementById('navLinks');

burgerToggle.addEventListener('click', () => {
  const isOpen = navLinks.classList.toggle('open');
  burgerToggle.setAttribute('aria-expanded', isOpen);
});

filterButtons.forEach(button => {
  button.addEventListener('click', () => {
    navLinks.classList.remove('open');
    burgerToggle.setAttribute('aria-expanded', false);
  });
});

// Demande personnalisée : les éléments de la modale
const requestModal = document.getElementById('requestModal');
const requestForm = document.getElementById('requestForm');
const requestError = document.getElementById('requestError');
const requestSuccess = document.getElementById('requestSuccess');

// Le bouton "Demande personnalisée" ouvre la modale
const openRequestButton = document.getElementById('openRequestModal');
openRequestButton.addEventListener('click', () => {
  requestError.hidden = true;
  requestForm.hidden = false;      // ← étape 3 : on réaffiche le formulaire
  requestSuccess.hidden = true;    // ← étape 3 : on cache le merci de la fois d'avant
  requestModal.showModal();
});

// Le bouton Annuler ferme la modale
const cancelRequestButton = document.getElementById('cancelRequest');
cancelRequestButton.addEventListener('click', () => {
  requestModal.close();
});

// Le bouton "Envoyer ma demande" envoie la demande au PHP
requestForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const formData = new FormData(requestForm);
  fetch('api/add_request.php', { method: 'POST', body: formData })
    .then(response => {
      response.text().then(text => {
        if (response.ok) {
          // On cache le formulaire et on affiche le merci
          requestForm.reset();
          requestForm.hidden = true;
          requestSuccess.querySelector('p').textContent = text;
          requestSuccess.hidden = false;
        } else {
          // On affiche le message d'erreur dans le formulaire
          requestError.textContent = text;
          requestError.hidden = false;
        }
      });
    });
});

// Le bouton "Fermer" du message de remerciement ferme la modale
const closeRequestSuccessButton = document.getElementById('closeRequestSuccess');
closeRequestSuccessButton.addEventListener('click', () => {
  requestModal.close();
});

// Ajouter au panier 

// CHerche le panier dans localStorage et le renvoie
function getCart() {
  const data = localStorage.getItem('cart');
  return data ? JSON.parse(data) : [];
}

// Enregistre le panier dans localStorage
function saveCart(cart) {
  localStorage.setItem('cart', JSON.stringify(cart));
}

function addToCart(id, name, price, image) {
  const cart = getCart();
  const existing = cart.find(item => item.id === id);

  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ id: id, name: name, price: price, image: image, quantity: 1 });
  }
  saveCart(cart);
  updateCartCount();
}

const photoModal = document.getElementById('photoModal');
const photoModalImg = document.getElementById('photoModalImage');
const closePhoto = document.getElementById('closePhoto');
const cardsContainer = document.querySelector('.cards-container');
cardsContainer.addEventListener('click', (event) => {
  if (event.target.matches('.btn-addToCart')) {
    const card = event.target.closest('.card');
    const id = Number(card.dataset.id);
    const image = card.dataset.image;
    const name = card.dataset.name;
    const price = Number(card.dataset.price);
    addToCart(id, name, price, image);
  }
  if (event.target.matches('.card img')) {
    photoModalImg.src = event.target.src;
    photoModalImg.alt = event.target.alt;
    photoModal.showModal();
  }
})

closePhoto.addEventListener('click', () => {
  photoModal.close();
});

function updateCartCount() {
  const cart = getCart();
  let total = 0;

  cart.forEach(item => {
    total += item.quantity;
  });
  document.getElementById('cartCount').textContent = total;
}

updateCartCount();

// Afficher le contenu du panier dans une modale
function renderCart() {
  const cart = getCart();
  const cartItems = document.getElementById('cartItems');

  if (cart.length === 0) {
    cartItems.innerHTML = '<li>Votre panier est vide.</li>';
    document.getElementById('cartTotal').textContent = '';
    document.getElementById('openOrder').hidden = true;
    return;
  }
  document.getElementById('openOrder').hidden = false;

  const itemsHTML = cart.map(item => `
    <li class="cart-item" data-id="${escapeHtml(item.id)}">
      <img src="uploads/${escapeHtml(item.image)}" alt="${escapeHtml(item.name)}">
      <span>${escapeHtml(item.name)}</span>
      <span>
        <button type="button" class="btn-decrease" data-id="${escapeHtml(item.id)}">-</button>
        ${escapeHtml(item.quantity)}
        <button type="button" class="btn-increase" data-id="${escapeHtml(item.id)}">+</button>
        x ${escapeHtml(item.price.toFixed(2))}€
        </span>
      <button class="btn-remove-cart" data-id="${escapeHtml(item.id)}">Retirer</button>
    </li>
  `);

  cartItems.innerHTML = itemsHTML.join('');

  let total = 0;

  cart.forEach(item => {
    total += item.price * item.quantity;
  });

  document.getElementById('cartTotal').textContent = `Total : ${escapeHtml(total.toFixed(2))}€`;

}

const cartToggle = document.getElementById('cartToggle');
const cartModal = document.getElementById('cartModal');
const closeCartButton = document.getElementById('closeCart');

cartToggle.addEventListener('click', () => {
  renderCart();
  cartModal.showModal();
});

closeCartButton.addEventListener('click', () => {
  cartModal.close();
});

function removeFromCart(id) {
  const cart = getCart().filter(item => item.id !== id);
  saveCart(cart);
  renderCart();
  updateCartCount();
}

// Modifier la quantité d'un article dans le panier
function changeQuantity(id, change) {
  const cart = getCart();
  const item = cart.find(item => item.id === id);
  item.quantity += change;
  if (item.quantity <= 0) {
    removeFromCart(id);
    return;
  }
  saveCart(cart);
  renderCart();
  updateCartCount();
}


const cartItems = document.getElementById('cartItems');
cartItems.addEventListener('click', (event) => {
  if (event.target.matches('.btn-remove-cart')) {
    const id = Number(event.target.dataset.id);
    removeFromCart(id);
  }
  if (event.target.matches('.btn-increase')) {
    const id = Number(event.target.dataset.id);
    changeQuantity(id, 1);
  }
  if (event.target.matches('.btn-decrease')) {
    const id = Number(event.target.dataset.id);
    changeQuantity(id, -1);
  }
});

// Ouvrir la modal formulaire 
const orderModal = document.getElementById('orderModal');
const orderForm = document.getElementById('orderForm');
const openOrder = document.getElementById('openOrder');
const cancelOrder = document.getElementById('cancelOrder');
openOrder.addEventListener('click', (event) => {
  cartModal.close();
  orderModal.showModal();
})

// Annuler ferme la modal du du form
cancelOrder.addEventListener('click', (event) => {
  orderModal.close();
})

// Le bouton "Payer" du formulaire de commande
const payButton = orderForm.querySelector('button[type="submit"]');

orderForm.addEventListener('submit', (event) => {
  event.preventDefault();
  // On bloque le bouton pendant l'envoi : un double-clic créerait 2 commandes
  payButton.disabled = true;
  payButton.textContent = 'Redirection vers le paiement…';
  const formData = new FormData(orderForm);
  const items = getCart().map(item => ({ id: item.id, quantity: item.quantity }));
  formData.append('items', JSON.stringify(items));
  fetch('api/create_order.php', { method: 'POST', body: formData })
    .then(response => {
      response.text().then(text => {
        if (response.ok) {
          // Le serveur a répondu avec l'adresse de la page de paiement Stripe
          window.location.href = text;
        } else {
          payButton.disabled = false;
          payButton.textContent = 'Payer';
          alert(text);
        }
      });
    });

});


