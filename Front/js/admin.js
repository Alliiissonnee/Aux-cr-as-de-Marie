// Si l'admin n'est pas connecté, on le renvoie vers la page de connexion
fetch('api/session.php')
  .then(response => response.json())
  .then(data => {
    if (!data.connecte) {
      window.location.href = 'login.html';
    }
  });

const deleteModal = document.getElementById('deleteModal');
const editModal = document.getElementById('editModal');
const editForm = document.getElementById('editForm');
const addModal = document.getElementById('addModal');
const addForm = document.getElementById('addForm');
let cardToDelete = null;
let cardToEdit = null;


fetch('api/cards.php')
  .then(response => response.json())
  .then(data => {
    const container = document.querySelector('.cards-container');
    const cardsHTML = data.map(card => `
  <section class="card" data-id="${card.id}" data-name="${card.name}" data-description="${card.description}" data-price="${card.price}" data-category="${card.category}">
    <img src="uploads/${card.image}" alt="${card.name}">
    <article class="card-content">
      <h3>${card.name}</h3>
      <p>${card.description}</p>
      <span class="card-price">${card.price}€</span>
      <div class="card-actions">
        <button class="btn-edit">Modifier</button>
        <button class="btn-delete">Supprimer</button>
      </div>
    </article>
  </section>
`);
    container.innerHTML = cardsHTML.join('');
    // Ouvre la modal "Etes vous sure?" quand on clique sur supprimer
    const deleteButtons = document.querySelectorAll('.btn-delete');
    deleteButtons.forEach(button => {
      button.addEventListener('click', () => {
        cardToDelete = button.closest('.card');
        deleteModal.showModal();
      });
    });
    // Ouvre la modal de modification quand on clique sur modifier
    const editButtons = document.querySelectorAll('.btn-edit');
    editButtons.forEach(button => {
      button.addEventListener('click', () => {
        cardToEdit = button.closest('.card');
        editForm.elements['id'].value = cardToEdit.dataset.id;
        editForm.elements['name'].value = cardToEdit.dataset.name;
        editForm.elements['description'].value = cardToEdit.dataset.description;
        editForm.elements['price'].value = cardToEdit.dataset.price;
        editForm.elements['category'].value = cardToEdit.dataset.category;
        editModal.showModal();
      });
    });
  });

// Le bouton annuler ferme la modal supprimer
const cancelDeleteButton = document.getElementById('cancelDelete');
cancelDeleteButton.addEventListener('click', () => {
  deleteModal.close();
});

// Le bouton annuler ferme la modal modifier
const cancelEditButton = document.getElementById('closeModal');
cancelEditButton.addEventListener('click', () => {
  editModal.close();
});

// Le bouton supprimer supprime la création
const confirmDeleteButton = document.getElementById('confirmDelete');
confirmDeleteButton.addEventListener('click', () => {
  const id = cardToDelete.dataset.id;
  const formData = new FormData();
  formData.append('id', id);
  fetch('api/delete_card.php', { method: 'POST', body: formData })
    .then(response => response.text())
    .then(text => {
      console.log(text);
      cardToDelete.remove();
      deleteModal.close();
    });
});

// Deconnexion de l'admin en cliquant sur le cadenas et retour à la page d'accueil
const logoutButton = document.getElementById('deconnexion_admin');
logoutButton.addEventListener('click', () => {
  fetch('api/logout.php')
    .then(() => {
      window.location.href = 'site.html';
    });
});

// Le btn valider enregistre les modifications
editForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const formData = new FormData(editForm);
  fetch('api/edit_card.php', { method: 'POST', body: formData })
    .then(response => response.text())
    .then(text => {
      console.log(text);
      window.location.reload();
    })
});

// Le bouton "Ajouter une création" ouvre la modal
const openAddButton = document.getElementById('openAddModal');
openAddButton.addEventListener('click', () => {
  addModal.showModal();
});

// Le bouton annuler ferme la modal
const cancelAddButton = document.getElementById('cancelAdd');
cancelAddButton.addEventListener('click', () => {
  addModal.close();
});

//  Le btn "Ajouter" ajoute une nouvelle création
addForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const formData = new FormData(addForm);
  fetch('api/add_card.php', { method: 'POST', body: formData })
    .then(response => response.text())
    .then(text => {
      console.log(text);
      window.location.reload();
    })
});