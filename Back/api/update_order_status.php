<?php
// Change le statut d'une commande (réservé à l'admin) 
require __DIR__ . '/admin_check.php';
require __DIR__ . '/config.php';

$id = (int) ($_POST['id'] ?? 0);
$status = $_POST['status'] ?? '';

// Vérifie le statut de la commande
$allowedStatus = ['pending', 'paid', 'shipped'];
if (!in_array($status, $allowedStatus)) {
    http_response_code(400);
    die("Statut non valide");
}

$stmt = $pdo->prepare("UPDATE orders SET status = :status WHERE id = :id");
$stmt->execute(['id'=> $id, 'status' => $status]);
echo "Statut mis à jour";