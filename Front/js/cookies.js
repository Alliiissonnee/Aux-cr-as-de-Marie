// Bandeau cookies + Google Analytics
// Google Analytics n'est chargé QUE si la personne a cliqué sur "Accepter" (règle de la CNIL)

const GA_ID = 'G-GBSVRS2SWC';
const cookieBanner = document.getElementById('cookieBanner');

// Charge Google Analytics (code fourni par Google)
function loadAnalytics() {
    const script = document.createElement('script');
    script.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
    script.async = true;
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { dataLayer.push(arguments); };
    gtag('js', new Date());
    gtag('config', GA_ID);
}

// Le choix déjà fait, s'il existe : 'accepted', 'refused', ou null (pas encore choisi)
const consent = localStorage.getItem('cookieConsent');

if (consent === 'accepted') {
    loadAnalytics();
} else if (consent === null) {
    cookieBanner.hidden = false;
}


document.getElementById('acceptCookies').addEventListener('click', () => {
    localStorage.setItem('cookieConsent', 'accepted');
    cookieBanner.hidden = true;
    loadAnalytics();
});

document.getElementById('refuseCookies').addEventListener('click', () => {
    // A-t-elle accepté AVANT ? (on regarde avant d'écrire le nouveau choix)
    const wasAccepted = localStorage.getItem('cookieConsent') === 'accepted';

    localStorage.setItem('cookieConsent', 'refused');
    cookieBanner.hidden = true;

    if (wasAccepted) {
        // On efface les cookies déposés par Google Analytics (leur nom commence par "_ga")
        document.cookie.split('; ').forEach(cookie => {
            const name = cookie.split('=')[0];
            if (name.startsWith('_ga')) {
                document.cookie = name + '=; Max-Age=0; path=/';
            }
        });
        // On recharge la page : cette fois, Google Analytics ne sera plus chargé
        location.reload();
    }
});


// "Gérer les cookies" (dans le pied de page) : on réaffiche le bandeau pour changer d'avis
document.getElementById('manageCookies').addEventListener('click', () => {
    cookieBanner.hidden = false;
});
