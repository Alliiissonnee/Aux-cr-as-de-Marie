// Si l'adresse contient "?error", on affiche le message d'erreur
const params = new URLSearchParams(window.location.search);

if (params.has('error')) {
  document.getElementById('loginError').hidden = false;
}
