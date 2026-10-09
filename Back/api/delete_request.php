<?php

require __DIR__ . '/admin_check.php';
require __DIR__ . '/config.php';

$id = $_POST['id'];

$stmt = $pdo->prepare("SELECT photo FROM custom_requests WHERE id = :id");
$stmt->execute(['id' => $id]);
$ligne = $stmt->fetch();  

if ($ligne) {
    $stmt = $pdo->prepare("DELETE FROM custom_requests WHERE id = :id");
    $stmt->execute(['id' => $id]);
 if ($ligne['photo'] && file_exists(__DIR__ . '/../uploads/' . $ligne['photo'])) {
        unlink (__DIR__ . '/../uploads/' . $ligne['photo']);
    }
    echo "La demande est bien supprimée";
} else {
    echo "La demande n'existe pas";
}
