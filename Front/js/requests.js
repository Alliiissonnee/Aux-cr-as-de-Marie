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
        <td>${escapeHtml(request.status)}</td>
      </tr>
    `);
        requestsBody.innerHTML = rowsHTML.join('');
    });
