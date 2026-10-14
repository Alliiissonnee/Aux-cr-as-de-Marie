// Désamorce les caractères spéciaux d'un texte pour l'afficher sans danger dans du HTML
// (évite qu'un nom ou une description contienne du code qui s'exécute)
function escapeHtml(text) {
  return String(text)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}
