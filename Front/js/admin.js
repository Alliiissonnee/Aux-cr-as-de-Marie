fetch('api/cards.php')
  .then(response => response.json())
  .then(data => {
    const container = document.querySelector('.cards-container');
    const cardsHTML = data.map(card => `
  <section class="card" data-id="${card.id}" data-name="${card.name}" data-category="${card.category}">
    <img src="uploads/${card.image}" alt="${card.name}">
    <article class="card-content">
      <h3>${card.name}</h3>
      <p>${card.description}</p>
      <span class="card-price">${card.price}€</span>
      <button class="btn-edit"> Modifier </button>
      <button class="btn-delete"> Supprimer </button>
    </article>
  </section>
`);
    container.innerHTML = cardsHTML.join('');

    const deleteButtons = document.querySelectorAll('.btn-delete');
    deleteButtons.forEach(button => {
      button.addEventListener('click', () => {
        const card = button.closest('.card');
        const id = card.dataset.id;
        const formData = new FormData();
        formData.append('id', id);
        fetch('api/delete_card.php', { method: 'POST', body: formData });
      });
    });

  });
