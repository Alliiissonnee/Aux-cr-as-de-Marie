// Si l'admin n'est pas connecté, on le renvoie vers la page de connexion
fetch('api/session.php')
    .then(response => response.json())
    .then(data => {
        if (!data.loggedIn) {
            window.location.href = 'login.html';
        }
    });

// Deconnexion de l'admin en cliquant sur le cadenas et retour à la page d'accueil
const logoutButton = document.getElementById('deconnexion_admin');
logoutButton.addEventListener('click', () => {
    fetch('api/logout.php')
        .then(() => {
            window.location.href = 'site.html';
        });
});

// Remplit le tableau avec la liste des demandes
const requestsBody = document.getElementById('requestsBody');

// Dictionnaires : le code rangé dans la base → le texte affiché à l'admin
const categoryLabels = {
    bebe: 'Bébé',
    doudou: 'Doudou',
    'tricot-couture': 'Tricot-couture',
    accessoires: 'Accessoires',
};

const budgetLabels = {
    under20: 'Moins de 20 €',
    '20-50': '20 à 50 €',
    '50-100': '50 à 100 €',
    over100: 'Plus de 100 €',
};

// Écrit une date à la française
function formatDate(text, withTime) {
    const date = new Date(text.replace(' ', 'T'));
    const day = date.toLocaleDateString('fr-FR');
    if (withTime) {
        const time = date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
        return `${day}<br><span class="request-time">${time}</span>`;
    }
    return day;
}


fetch('api/requests.php')
    .then(response => response.json())
    .then(requests => {
        const rowsHTML = requests.map(request => `
      <tr>
        <td>${formatDate(request.created_at, true)}</td>
        <td>${escapeHtml(request.name)}</td>
        <td>${`<a href="mailto:${escapeHtml(request.email)}">${escapeHtml(request.email)}</a>`}</td>
        <td>${escapeHtml(categoryLabels[request.category] ?? request.category)}</td>
        <td>${request.desired_date ? formatDate(request.desired_date, false) : '—'}</td>
        <td>${escapeHtml(budgetLabels[request.budget] ?? '—')}</td>
        <td>${escapeHtml(request.message)}</td>
        <td>${request.photo ? `<a href="uploads/${escapeHtml(request.photo)}" target="_blank">Voir</a>` : '—'}</td>
        <td>
            <fieldset class="status-switch">
                <label class="status-new">
                    <input type="radio" name="status-${request.id}" value="new" data-id="${request.id}" ${request.status === 'new' ? 'checked' : ''}>
                    Nouvelle
                </label>
                <label class="status-in-progress">
                    <input type="radio" name="status-${request.id}" value="in_progress" data-id="${request.id}" ${request.status === 'in_progress' ? 'checked' : ''}>
                    En cours
                </label>
                <label class="status-done">
                    <input type="radio" name="status-${request.id}" value="done" data-id="${request.id}" ${request.status === 'done' ? 'checked' : ''}>
                    Terminée
                </label>
            </fieldset>
        </td>
        <td>
            <button type="button" class="delete-request" data-id="${request.id}">Supprimer</button>
        </td>
      </tr>
    `);
        requestsBody.innerHTML = rowsHTML.join('');
    });

// Quand l'admin change le statut d'une demande, on l'enregistre
requestsBody.addEventListener('change', (event) => {
    const radio = event.target;
    const formData = new FormData();
    const id = radio.dataset.id;
    const status = radio.value;
    formData.append('id', id);
    formData.append('status', status);
    fetch('api/update_requests_status.php', {method: 'POST', body: formData})
        .then(response => response.text())
        .then(text => {
            console.log(text);
        })    
});

// Fenêtre "Êtes-vous sûre ?" pour supprimer une demande
const deleteRequestModal = document.getElementById('deleteRequestModal');
let rowToDelete = null; // la ligne (ou la carte) de la demande à supprimer

// Quand on clique sur un bouton Supprimer, on retient sa ligne et on ouvre la fenêtre
requestsBody.addEventListener('click', (event) => {
    if (event.target.matches('.delete-request')) {
        rowToDelete = event.target.closest('tr');
        deleteRequestModal.showModal();
    }
});

// Le bouton annuler ferme la modal supprimer
const cancelDeleteRequestButton = document.getElementById('cancelDeleteRequest');
cancelDeleteRequestButton.addEventListener('click', () => {
  deleteRequestModal.close();
});

// Le bouton supprimer supprime la demande
const confirmDeleteRequestButton = document.getElementById('confirmDeleteRequest');
confirmDeleteRequestButton.addEventListener('click', () => {
  const id = rowToDelete.querySelector('.delete-request').dataset.id;
  const formData = new FormData();
  formData.append('id', id);
  fetch('api/delete_request.php', { method: 'POST', body: formData })
    .then(response => response.text())
    .then(text => {
      console.log(text);
      rowToDelete.remove();
      deleteRequestModal.close();
    });
});