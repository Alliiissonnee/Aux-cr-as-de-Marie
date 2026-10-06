// Si l'adresse contient "?erreur", on affiche le message d'erreur
const params = new URLSearchParams(window.location.search);

if (params.has('erreur')) {
  document.getElementById('loginError').hidden = false;
}
