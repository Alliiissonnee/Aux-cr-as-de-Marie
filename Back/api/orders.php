<?php
// Donne la liste des commandes, pour la page commandes de l'admin.

require __DIR__ . '/admin_check.php';
require __DIR__ . '/config.php';

// Toutes les commandes, de la plus récente à la plus ancienne
$stmt = $pdo->prepare("SELECT * FROM orders ORDER BY created_at DESC");
$stmt->execute();
$orders = $stmt->fetchAll(PDO::FETCH_ASSOC);

// Pour chaque commande, on ajoute la liste de ses articles
$stmt = $pdo->prepare("SELECT name, unit_price, quantity FROM order_items WHERE order_id = :id");
foreach ($orders as $index => $order) {
    $stmt->execute(['id' => $order['id']]);
    $orders[$index]['items'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
}

echo json_encode($orders);
