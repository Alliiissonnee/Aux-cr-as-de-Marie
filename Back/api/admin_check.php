<?php
// Permet d'être réutilisé dans tous les fichiers où on a besoin d'être connecté en tant qu'admin

require __DIR__ . '/demarrer_session.php';

if (!isset($_SESSION['admin_id'])){
    http_response_code(401);
    die("Accès refusé, vous devez être connecté en tant qu'admin.");
}