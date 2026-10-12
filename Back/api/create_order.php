<?php
require __DIR__ . '/config.php';

// Récupère les cases du formulaire (trim enlève les espaces au début et à la fin)
$customerName = trim($_POST['customer_name'] ?? '');
$email = trim($_POST['email'] ?? '');
$address = trim($_POST['address'] ?? '');
$postalCode = trim($_POST['postal_code'] ?? '');
$city = trim($_POST['city'] ?? '');

// Vérifie que les cases obligatoires sont remplies
if ($customerName === '' || $email === '' || $address === '' || $postalCode === '' || $city === '') {
    http_response_code(400);
    die("Merci de remplir votre nom, votre email et votre adresse complète.");
}

// Vérifie que l'email ressemble à un vrai email
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    die("L'adresse email n'est pas valide.");
}

// Verifie le code postal
if (!preg_match('/^[0-9]{5}$/', $postalCode)) {
    http_response_code(400);
    die("Le code postal n'est pas valide.");
}

// Le panier arrive en texte JSON : json_decode le transforme en tableau PHP
$items = json_decode($_POST['items'] ?? '', true);

// Vérifie que le panier n'est pas vide (ou cassé)
if (!is_array($items) || count($items) === 0) {
    http_response_code(400);
    die("Votre panier est vide.");
}

$total = 0;
$orderItems = []; // les lignes du ticket, avec les VRAIS noms et prix

// foreach = "pour chaque article du panier, fais…"
foreach ($items as $item) {
    $id = (int) ($item['id'] ?? 0);
    $quantity = (int) ($item['quantity'] ?? 0);
    // Vérifie que la quantité est entre 1 et 99
    if ($quantity <1 || $quantity >99) {
        http_response_code(400);
        die("La quantité d'un article n'est pas valide.");
    }
     // Cherche le nom et le prix de cette création dans la table cards
    $stmt = $pdo->prepare("SELECT name, price FROM cards WHERE id = :id");
    $stmt->execute(['id' => $id]);
    $card = $stmt->fetch();
    if (!$card) {
        http_response_code(400);
        die("Une création de votre panier n'existe plus.");
    }
    // Calcul du prix total
    $total += $card['price'] * $quantity; 

    $orderItems[] = [
        'card_id' => $id,
        'name' => $card['name'],
        'unit_price' => $card['price'],
        'quantity' => $quantity,
    ];
}

// Transaction : les 2 tables sont remplies ensemble, ou pas du tout
$pdo->beginTransaction();

// 1. Le haut du ticket
$stmt = $pdo->prepare("INSERT INTO orders (customer_name, email, address, postal_code, city, total) VALUES (:customer_name, :email, :address, :postal_code, :city, :total)");
$stmt->execute([
    'customer_name' => $customerName,
    'email' => $email,
    'address' => $address,
    'postal_code' => $postalCode,
    'city' => $city,
    'total' => $total
]);

// Le numéro que MySQL vient de donner à cette commande
$orderId = $pdo->lastInsertId();

// Les lignes du ticket : une par création achetée
$stmt = $pdo->prepare("INSERT INTO order_items (order_id, card_id, name, unit_price, quantity) VALUES (:order_id, :card_id, :name, :unit_price, :quantity)");

foreach ($orderItems as $orderItem) {
    $stmt->execute([
    'order_id' => $orderId,
    'card_id' => $orderItem['card_id'],
    'name' => $orderItem['name'],
    'unit_price' => $orderItem['unit_price'],
    'quantity' => $orderItem['quantity']
]);
}

// Tout s'est bien passé : on valide les 2 tables d'un coup
$pdo->commit();

// Bibliothèque Stripe (installée par Composer, comme PHPMailer)
require '/var/www/vendor/autoload.php';

// Les articles, dans le format attendu par Stripe
$lineItems = [];
foreach ($orderItems as $orderItem) {
    $lineItems[] = [
        'price_data' => [
            'currency' => 'eur',
            'product_data' => ['name' => $orderItem['name']],
            'unit_amount' => (int) round($orderItem['unit_price'] * 100),
        ],
        'quantity' => $orderItem['quantity'],
    ];
}

// On demande à Stripe de préparer une page de paiement pour cette commande
$stripe = new \Stripe\StripeClient(getenv('STRIPE_SECRET_KEY'));

$session = $stripe->checkout->sessions->create([
    'mode' => 'payment',
    'line_items' => $lineItems,
    'customer_email' => $email,
    'metadata' => ['order_id' => $orderId],
    'success_url' => 'http://localhost:8000/order_success.html?session_id={CHECKOUT_SESSION_ID}',
    'cancel_url' => 'http://localhost:8000/site.html',
]);

$stmt = $pdo->prepare("UPDATE orders SET stripe_session_id = :session_id WHERE id = :id");
$stmt->execute(['id'=> $id, 'status' => $status]);


