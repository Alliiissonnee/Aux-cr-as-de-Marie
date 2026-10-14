<?php
// Supprime une création et son image (réservé à l'admin)
require __DIR__ . '/admin_check.php';
require __DIR__ . '/config.php';

$id = (int) ($_POST['id'] ?? 0);

$stmt = $pdo->prepare("SELECT image FROM cards WHERE id = :id");
$stmt->execute(['id' => $id]);
$card = $stmt->fetch();  

if ($card) {
    $stmt = $pdo->prepare("DELETE FROM cards WHERE id = :id");
    $stmt->execute(['id' => $id]);
    if (file_exists(__DIR__ . '/../uploads/' . $card['image'])) {
        unlink (__DIR__ . '/../uploads/' . $card['image']);
    }
    echo "La création a bien été supprimée.";
} else {
    echo "Cette création n'existe pas.";
}
