// Si l'admin n'est pas connecté, on le renvoie vers la page de connexion
fetch('api/session.php')
    .then(response => response.json())
    .then(data => {
        if (!data.loggedIn) {
            window.location.href = 'login.html';
        }
    });

// Deconnexion de l'admin en cliquant sur le cadenas et retour à la page d'accueil
const logoutButton = document.getElementById('logoutButton');
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

// Le texte de l'étiquette de livraison
function shippingLabel(order) {
    if (order.shipping_method === 'pickup') {
        return 'Retrait sur place';
    }
    if (Number(order.shipping_cost) === 0) {
        return 'Colissimo offert';
    }
    return `Colissimo (${escapeHtml(order.shipping_cost)} €)`;
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
            <strong class="shipping-${order.shipping_method}">${shippingLabel(order)}</strong><br>
            ${escapeHtml(order.address)}<br>
            ${escapeHtml(order.postal_code)} ${escapeHtml(order.city)}<br>
            ${order.shipping_method === 'colissimo' ? `
            <form class="tracking-form" data-id="${order.id}">
                <input type="text" name="tracking_number" value="${escapeHtml(order.tracking_number ?? '')}" placeholder="N° de suivi" aria-label="Numéro de suivi Colissimo" required>
                <button type="submit">Envoyer</button>
            </form>
            ${order.tracking_number ? `
            <button type="button" class="btn-track" data-id="${order.id}">Où est le colis ?</button>
            <p class="tracking-status" id="tracking-${order.id}"></p>` : ''}

            ` : ''}
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

// Quand l'admin change le statut d'une commande, on l'enregistre
ordersBody.addEventListener('change', (event) => {
    const radio = event.target;
    // On ne réagit qu'aux boutons de statut (pas à la case du numéro de suivi)
    if (!radio.matches('input[type="radio"]')) return;
    const formData = new FormData();
    formData.append('id', radio.dataset.id);
    formData.append('status', radio.value);
    fetch('api/update_order_status.php', { method: 'POST', body: formData })
        .then(response => response.text())
        .then(text => {
            console.log(text);
        });
});

// Quand l'admin envoie un numéro de suivi, on l'enregistre (et la personne reçoit un email)
ordersBody.addEventListener('submit', (event) => {
    event.preventDefault(); // la page ne se recharge pas toute seule
    const form = event.target;
    const formData = new FormData(form);
    formData.append('id', form.dataset.id);

    fetch('api/update_order_tracking.php', { method: 'POST', body: formData })
        .then(response => response.text().then(text => {
            alert(text);
            if (response.ok) {
                window.location.reload(); // on recharge pour voir le statut passer en "Expédiée"
            }
        }));
});

// Quand l'admin clique sur "Où est le colis ?", on demande à La Poste (via notre serveur)
ordersBody.addEventListener('click', (event) => {
    const button = event.target.closest('.btn-track');
    if (!button) return;

    const status = document.getElementById(`tracking-${button.dataset.id}`);
    status.textContent = 'Recherche en cours…';

    fetch(`api/track_order.php?id=${button.dataset.id}`)
        .then(response => response.ok ? response.json() : null)
        .then(data => {
            if (!data || !data.shipment) {
                status.textContent = "Suivi indisponible pour le moment.";
                return;
            }
            const lastEvent = data.shipment.event[0];
            status.textContent = lastEvent.label + ' (' + new Date(lastEvent.date).toLocaleDateString('fr-FR') + ')';
        });
});
