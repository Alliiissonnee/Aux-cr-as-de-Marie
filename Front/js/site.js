fetch('api/cards.php')
  .then(response => response.json())
  .then(data => {
    const container = document.querySelector('.cards-container');
    const cardsHTML = data.map(card => `
  <section class="card" data-id="${card.id}" data-image="${escapeHtml(card.image)}" data-name="${escapeHtml(card.name)}" data-category="${escapeHtml(card.category)}" data-price="${card.price}" >
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
document.getElementById('connexion_admin').addEventListener('click', function () { window.location.href = "login.html"; });

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
  const existant = cart.find(item => item.id === id);

  if (existant) {
    existant.quantity += 1;
  } else {
    cart.push({ id: id, name: name, price: price, image: image, quantity: 1 });
  }
  saveCart(cart);
  updateCartCount();
}

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
})

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

  const itemsHTML = cart.map(item => `
    <div class="cart-item" data-id="${item.id}">
      <img src="uploads/${item.image}" alt="${item.name}">
      <span>${item.name}</span>
      <span>${item.quantity} x ${item.price}€</span>
      <button class="btn-remove-cart" data-id="${item.id}">Retirer</button>
    </div>
  `);

  cartItems.innerHTML = itemsHTML.join('');

  let total = 0;

  cart.forEach(item => {
    total += item.price * item.quantity;
  });

  document.getElementById('cartTotal').textContent = `Total : ${total}€`;

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
