<?php
// Permet d'être réutilisé dans tous les fichiers où on a besoin d'être connecté en tant qu'admin

session_start();
if (isset($_SESSION['admin_id'])){
echo "Admin connecté";
} else {
    die("Accès refusé, vous devez être connecté en tant qu'admin.");
}