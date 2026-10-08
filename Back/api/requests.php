<?php
// Donne la liste des demandes personnalisées, pour la page "Demandes" de l'admin.
// Réservé à l'admin : les demandes contiennent des données personnelles.

require __DIR__ . '/admin_check.php';
require __DIR__ . '/config.php';

// Toutes les demandes, de la plus récente à la plus ancienne
$stmt = $pdo->prepare("SELECT * FROM custom_requests ORDER BY created_at DESC");
$stmt->execute();
$requests = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo json_encode($requests);
