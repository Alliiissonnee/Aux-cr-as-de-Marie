fetch('api/cards.php')
  .then(response => response.json())
  .then(data => {
    const container = document.querySelector('.cards-container');
    const cardsHTML = data.map(card => `
  <section class="card" data-name="${escapeHtml(card.name)}" data-category="${escapeHtml(card.category)}">
    <img src="uploads/${escapeHtml(card.image)}" alt="${escapeHtml(card.name)}">
    <article class="card-content">
      <h3>${escapeHtml(card.name)}</h3>
      <p>${escapeHtml(card.description)}</p>
      <span class="card-price">${escapeHtml(card.price)}€</span>
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
document.getElementById('connexion_admin').addEventListener('click', function() { window.location.href = "login.html"; });

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

