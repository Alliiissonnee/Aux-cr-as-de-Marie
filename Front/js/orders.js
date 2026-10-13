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

// Remplit le tableau avec la liste des commandes
const ordersBody = document.getElementById('ordersBody');

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


fetch('api/orders.php')
    .then(response => response.json())
    .then(orders => {
        const rowsHTML = orders.map(order => `
    <tr>
        <td>${formatDate(order.created_at, true)}</td>
        <td>
            ${escapeHtml(order.customer_name)}<br>
            <a href="mailto:${escapeHtml(order.email)}">${escapeHtml(order.email)}</a>
        </td>
        <td>
            ${escapeHtml(order.address)}<br>
            ${escapeHtml(order.postal_code)} ${escapeHtml(order.city)}
        </td>
        <td>
            <ul>${order.items.map(item =>
            `
                <li>
                ${escapeHtml(item.quantity)} x ${escapeHtml(item.name)}
                </li>`).join('')}
            </ul>
        </td>
        <td>${escapeHtml(order.total)} €</td>
        <td>
            <fieldset class="status-switch">
              <label class="status-pending">
                    <input type="radio" name="status-${order.id}" value="pending" data-id="${order.id}" ${order.status === 'pending' ? 'checked' : ''}>
                     En attente
              </label>
               <label class="status-paid">
            <input type="radio" name="status-${order.id}" value="paid" data-id="${order.id}" ${order.status === 'paid' ? 'checked' : ''}>
            Payée
                </label>
                 <label class="status-shipped">
                 <input type="radio" name="status-${order.id}" value="shipped" data-id="${order.id}" ${order.status === 'shipped' ? 'checked' : ''}>
                 Expédiée
                 </label>
             </fieldset>
        </td>

    </tr>

    `);
        ordersBody.innerHTML = rowsHTML.join('');
    });
