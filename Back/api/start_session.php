<?php
// Démarre la session, et déconnecte l'admin après 2 heures sans activité
session_start();

// Durée maximum sans activité : 2 heures, en secondes
$maxInactivity = 2 * 60 * 60;

// Si l'admin est inactive depuis trop longtemps, elle est deconnectée
if (isset($_SESSION['last_activity']) && time() - $_SESSION['last_activity'] > $maxInactivity) {
    session_unset();
    session_destroy();
    session_start();
}

// Si l'admin est connectée, on note l'heure de sa dernière activité
if (isset($_SESSION['admin_id'])) {
    $_SESSION['last_activity'] = time();
}
