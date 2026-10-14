<?php
// Supprime une demande personnalisée et sa photo (réservé à l'admin)
require __DIR__ . '/admin_check.php';
require __DIR__ . '/config.php';

$id = (int) ($_POST['id'] ?? 0);

$stmt = $pdo->prepare("SELECT photo FROM custom_requests WHERE id = :id");
$stmt->execute(['id' => $id]);
$request = $stmt->fetch();  

if ($request) {
    $stmt = $pdo->prepare("DELETE FROM custom_requests WHERE id = :id");
    $stmt->execute(['id' => $id]);
    if ($request['photo'] && file_exists(__DIR__ . '/../uploads/' . $request['photo'])) {
        unlink (__DIR__ . '/../uploads/' . $request['photo']);
    }
    echo "La demande a bien été supprimée";
} else {
    echo "Cette demande n'existe pas";
}
