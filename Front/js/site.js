fetch('api/cards.php')
  .then(response => response.json())
  .then(data => {
    const container = document.querySelector('.cards-container');
    const cardsHTML = data.map(card => `
  <section class="card" data-name="${echapper(card.name)}" data-category="${echapper(card.category)}">
    <img src="uploads/${echapper(card.image)}" alt="${echapper(card.name)}">
    <article class="card-content">
      <h3>${echapper(card.name)}</h3>
      <p>${echapper(card.description)}</p>
      <span class="card-price">${echapper(card.price)}€</span>
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