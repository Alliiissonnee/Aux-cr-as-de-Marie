<?php

// require exécute config.php (donc établit la connexion $pdo) — si ça plante, on ne voit jamais le echo suivant, 
// on voit l'erreur du catch. Si tout va bien, le message de succès s'affiche. Fichier de test simple, pas destiné à rester en prod.

require 'config.php';
echo "Connexion réussie !";