<?php
// Donne les statistiques des ventes, pour la page statistiques de l'admin
// (seules les commandes payées ou expédiées comptent comme des ventes)
require __DIR__ . '/admin_check.php';
require __DIR__ . '/config.php';

// Les 3 chiffres clés, calculés directement par MySQL
$stmt = $pdo->prepare("SELECT COUNT(*) AS order_count, SUM(total) AS revenue, AVG(total) AS average_basket
                       FROM orders
                       WHERE status IN ('paid', 'shipped')");
$stmt->execute();
$summary = $stmt->fetch(PDO::FETCH_ASSOC);

// Le chiffre d'affaires de chaque mois (GROUP BY = "fais un tas par mois")
$stmt = $pdo->prepare("SELECT DATE_FORMAT(created_at, '%Y-%m') AS month, SUM(total) AS revenue, COUNT(*) AS order_count
                       FROM orders
                       WHERE status IN ('paid', 'shipped')
                       GROUP BY month
                       ORDER BY month");
$stmt->execute();
$months = $stmt->fetchAll(PDO::FETCH_ASSOC);

// Les 5 créations les plus vendues
// JOIN : on relie chaque article à sa commande, pour savoir si elle a été payée
$stmt = $pdo->prepare("SELECT order_items.name, SUM(order_items.quantity) AS quantity_sold
                       FROM order_items
                       JOIN orders ON orders.id = order_items.order_id
                       WHERE orders.status IN ('paid', 'shipped')
                       GROUP BY order_items.name
                       ORDER BY quantity_sold DESC
                       LIMIT 5");
$stmt->execute();
$topItems = $stmt->fetchAll(PDO::FETCH_ASSOC);


echo json_encode([
    'summary' => $summary,
    'months' => $months,
    'topItems' => $topItems,
]);

