<?php
// Demande à La Poste où en est le colis d'une commande (réservé à l'admin)
// Sans clé Okapi dans .env, renvoie un suivi de démonstration au même format que La Poste
require __DIR__ . '/admin_check.php';
require __DIR__ . '/config.php';

$id = (int) ($_GET['id'] ?? 0);

$stmt = $pdo->prepare("SELECT tracking_number FROM orders WHERE id = :id");
$stmt->execute(['id' => $id]);
$order = $stmt->fetch();

if (!$order || $order['tracking_number'] === null) {
    http_response_code(404);
    die("Aucun numéro de suivi pour cette commande.");
}

$trackingNumber = $order['tracking_number'];
// La réponse est du JSON (comme orders.php)
header('Content-Type: application/json');

$okapiKey = getenv('OKAPI_KEY');

// 1er chemin : on a une clé → on demande à la vraie API de La Poste
if ($okapiKey) {
    // La clé voyage dans l'en-tête de la demande
    $context = stream_context_create([
        'http' => [
            'header' => "X-Okapi-Key: " . $okapiKey . "\r\nAccept: application/json\r\n",
            'ignore_errors' => true,
        ],
    ]);
    $json = file_get_contents('https://api.laposte.fr/suivi/v2/idships/' . urlencode($trackingNumber) . '?lang=fr_FR', false, $context);

    if ($json === false) {
        http_response_code(502);
        die(json_encode(['error' => "La Poste ne répond pas, réessayez plus tard."]));
    }
    // Le code de réponse de La Poste : "HTTP/1.1 404 Not Found" → on garde le 2e mot → 404
    $statusCode = (int) explode(' ', $http_response_header[0])[1];

    if ($statusCode !== 200) {
        // On ne renvoie pas le message technique de La Poste : il peut contenir des détails internes
        http_response_code($statusCode === 404 ? 404 : 502);
        die(json_encode(['error' => "Suivi indisponible pour ce colis."]));
    }

    echo $json;
    exit;
}

// 2e chemin : pas de clé → suivi de démonstration, au MÊME format que La Poste
// (les étapes sont rangées de la plus récente à la plus ancienne, comme chez La Poste)
echo json_encode([
    'shipment' => [
        'idShip' => $trackingNumber,
        'product' => 'Colissimo',
        'isFinal' => false,
        'event' => [
            ['code' => 'ET1', 'label' => "Votre colis est en cours d'acheminement.", 'date' => date('c')],
            ['code' => 'PC1', 'label' => 'Votre colis a été déposé au bureau de poste.', 'date' => date('c', strtotime('-1 day'))],
        ],
    ],
]);
