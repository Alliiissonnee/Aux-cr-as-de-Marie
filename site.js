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
const cards = document.querySelectorAll('.card');
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