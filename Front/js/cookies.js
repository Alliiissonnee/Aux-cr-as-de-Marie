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
    localStorage.setItem('cookieConsent', 'refused');
    cookieBanner.hidden = true;
});

// "Gérer les cookies" (dans le pied de page) : on réaffiche le bandeau pour changer d'avis
document.getElementById('manageCookies').addEventListener('click', () => {
    cookieBanner.hidden = false;
});
