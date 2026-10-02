<?php

require 'admin_check.php';
require 'config.php';

$id = $_POST['id'];

$stmt = $pdo->prepare("SELECT image FROM cards WHERE id = :id");
$stmt->execute(['id' => $id]);
$ligne = $stmt->fetch();  

if ($ligne) {
    $stmt = $pdo->prepare("DELETE FROM cards WHERE id = :id");
    $stmt->execute(['id' => $id]);
 if (file_exists('uploads/' . $ligne['image'])) {
        unlink ('uploads/' . $ligne['image']);
    }
    echo "La card est bien supprimée";
} else {
    echo "La cards n'existe pas";
}
