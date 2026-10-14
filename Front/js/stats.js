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

// Récupère les statistiques et remplit la page
fetch('api/stats.php')
    .then(response => response.json())
    .then(stats => {
        // Les 3 chiffres clés
        // (Number(...) transforme le texte "241.05" en vrai nombre, et "|| 0" met 0 s'il n'y a encore aucune vente)
        document.getElementById('statRevenue').textContent = Number(stats.summary.revenue || 0).toFixed(2) + ' €';
        document.getElementById('statOrders').textContent = stats.summary.order_count;
        document.getElementById('statAverage').textContent = Number(stats.summary.average_basket || 0).toFixed(2) + ' €';
        // Les ventes par mois : la barre du meilleur mois fait 100 %, les autres sont proportionnelles
        const monthsChart = document.getElementById('monthsChart');
        const bestMonth = Math.max(...stats.months.map(month => Number(month.revenue)));

        monthsChart.innerHTML = stats.months.map(month => {
            const percent = Number(month.revenue) / bestMonth * 100;
            // "2026-10" devient "octobre 2026"
            const label = new Date(month.month + '-01').toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
            return `
                <li>
                    <span class="month-label">${label}</span>
                    <span class="month-bar" style="width: ${percent}%"></span>
                    <span class="month-value">${Number(month.revenue).toFixed(2)} €</span>
                </li>`;
        }).join('');

        const topItems = document.getElementById('topItems');
        topItems.innerHTML = stats.topItems.map(item => `
            <li>${escapeHtml(item.name)} — ${item.quantity_sold} vendu(s)</li>`).join('');

    });
