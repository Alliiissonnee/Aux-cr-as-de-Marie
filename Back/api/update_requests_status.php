<?php

require __DIR__ . '/admin_check.php';
require __DIR__ . '/config.php';

$id = $_POST['id'];
$status = $_POST['status'];

// Verifie le statut de la demande de personnalisation
$allowedStatus = ['new', 'in_progress', 'done'];
if (!in_array($status, $allowedStatus)) {
    http_response_code(400);
    die("Statut non valide");
}

$stmt = $pdo->prepare("UPDATE custom_requests SET status = :status WHERE id = :id");
$stmt->execute(['id'=> $id, 'status' => $status]);
echo "Statut mis à jour";