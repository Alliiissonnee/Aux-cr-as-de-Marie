// Page "Merci" : vérifie le paiement auprès du serveur, puis affiche le résultat

// Lit le numéro de session dans l'adresse : order_success.html?session_id=cs_test_...
const params = new URLSearchParams(window.location.search);
const sessionId = params.get('session_id') ?? '';

const orderMessage = document.getElementById('orderMessage');

//  Demande au serveur (qui demande à Stripe) si la commande est payée
fetch('api/confirm_order.php?session_id=' + encodeURIComponent(sessionId))
    .then(response => {
        response.text().then(text => {
            if (response.ok) {
                orderMessage.textContent = `Votre commande n°${text} est validée. Marie va la préparer avec soin.`;
                localStorage.removeItem('cart');
            } else {
                document.getElementById('orderTitle').textContent = 'Oups...';
               orderMessage.textContent = `Votre commande n'est pas validée. Merci de réessayer.`
            }
        });
    });
