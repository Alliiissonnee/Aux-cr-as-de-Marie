<?php
// Enregistre le numéro de suivi Colissimo d'une commande (réservé à l'admin)
require __DIR__ . '/admin_check.php';
require __DIR__ . '/config.php';
require '/var/www/vendor/autoload.php';
require __DIR__ . '/mailer.php';

$id = (int) ($_POST['id'] ?? 0);
$trackingNumber = strtoupper(trim($_POST['tracking_number'] ?? ''));

if (!preg_match('/^[A-Z0-9]{11,15}$/', $trackingNumber)) {
    http_response_code(400);
    die("Le numéro de suivi n'est pas valide.");
}

// Range le numéro de suivi et passe la commande en "Expédiée"
$stmt = $pdo->prepare("UPDATE orders SET tracking_number = :tracking_number, status = 'shipped' WHERE id = :id");
$stmt->execute(['id' => $id, 'tracking_number' => $trackingNumber]);

// On récupère la commande, pour avoir le nom et l'email
$stmt = $pdo->prepare("SELECT * FROM orders WHERE id = :id");
$stmt->execute(['id' => $id]);
$order = $stmt->fetch();
if (!$order) {
    http_response_code(404);
    die("Cette commande n'existe pas.");
}


// L'email pour la personne qui a commandé
try {
    $mail = createMailer();
    $mail->addAddress($order['email'], $order['customer_name']);
    $mail->Subject = 'Votre commande n°' . $id . ' est en route — Aux créas de Marie';
    $mail->Body = "Bonjour " . $order['customer_name'] . ",\n\n"
        . "Votre colis est parti ! Vous pouvez suivre son trajet ici :\n"
        . "https://www.laposte.fr/outils/suivre-vos-envois?code=" . $trackingNumber . "\n\n"
        . "Numéro de suivi : " . $trackingNumber . "\n\n"
        . "À bientôt,\nMarie";
    $mail->send();

} catch (Exception $e) {
    error_log("Email de suivi non envoyé : " . $e->getMessage());
}


echo "Numéro de suivi enregistré.";