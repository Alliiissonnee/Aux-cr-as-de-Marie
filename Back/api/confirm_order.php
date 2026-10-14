<?php
// Vérifie que la commande a bien été payée sur Stripe avant de la marquer payée

require __DIR__ . '/config.php';
require '/var/www/vendor/autoload.php';
require __DIR__ . '/mailer.php';

$sessionId = $_GET['session_id'] ?? '';

if ($sessionId === '') {
    http_response_code(400);
    die("Le paiement est introuvable.");
}

$stripe = new \Stripe\StripeClient(getenv('STRIPE_SECRET_KEY'));
try {
$session = $stripe->checkout->sessions->retrieve($sessionId);
} catch (Exception $e) {
    http_response_code(400);
    die("Le paiement est introuvable.");
}

if ($session->payment_status !== 'paid') {
    http_response_code(400);
    die("Le paiement n'a pas été validé.");
}

$stmt = $pdo->prepare("UPDATE orders SET status = 'paid' WHERE stripe_session_id = :session_id AND status = 'pending'");
$stmt->execute(['session_id' => $session->id]);
// Les emails ne partent que la première fois (pas si la personne recharge la page)
if ($stmt->rowCount() === 1) {
    $orderId = $session->metadata->order_id;

    // Le haut du ticket : nom, email, adresse, total…
    $stmt = $pdo->prepare("SELECT * FROM orders WHERE id = :id");
    $stmt->execute(['id' => $orderId]);
    $order = $stmt->fetch();

    // Les lignes du ticket : fetchAll() récupère TOUTES les lignes 
    $stmt = $pdo->prepare("SELECT name, unit_price, quantity FROM order_items WHERE order_id = :id");
    $stmt->execute(['id' => $orderId]);
    $orderItems = $stmt->fetchAll();

    // Le récapitulatif en texte, une ligne par article
    $recap = '';
    foreach ($orderItems as $orderItem) {
       $recap .= "- " . $orderItem['quantity'] . " x " . $orderItem['name'] . " (" . $orderItem['unit_price'] . "€)\n";
    }
    // La livraison choisie
    if ($order['shipping_method'] === 'pickup') {
        $recap .= "Livraison : retrait sur place\n";
    } else {
        $recap .= "Livraison : Colissimo (" . number_format($order['shipping_cost'], 2, ',', ' ') . " €)\n";
    }
    $recap .= "\nTotal : " . $order['total'] . " €";
    
    // Un email qui ne part pas ne doit pas faire échouer la page "Merci" 
    try {
        // Email pour la personne qui a commandé
        $mail = createMailer();
        $mail->addAddress($order['email'], $order['customer_name']);
        $mail->Subject = 'Votre commande n°' . $orderId . ' — Aux créas de Marie';
        $mail->Body = "Bonjour " . $order['customer_name'] . ",\n\n"
            . "Merci pour votre commande ! Marie va la préparer avec soin.\n\n"
            . $recap . "\n\n"
            . "Livraison à :\n"
            . $order['address'] . "\n"
            . $order['postal_code'] . " " . $order['city'] . "\n\n"
            . "À bientôt,\nMarie";
        $mail->send();
        // Email pour l'admin
        $mail = createMailer();
        $mail->addAddress(getenv('MAIL_TO'));
        $mail->addReplyTo($order['email'], $order['customer_name']);
        $mail->Subject = 'Nouvelle commande n°' . $orderId . ' — Aux créas de Marie';
        $mail->Body = "Bonjour Marie,\n\n"
            . "Nouvelle commande payée !\n\n"
            . "De " . $order['customer_name'] . ", " . $order['email'] . "\n\n"
            . $recap . "\n\n"
            . "Livraison à :\n"
            . $order['address'] . "\n"
            . $order['postal_code'] . " " . $order['city'] . "\n\n"
            . "À bientôt";
        $mail->send();
    } catch (Exception $e) {
        // Le paiement est validé quand même : on note juste le problème dans les journaux
        error_log("Email de commande non envoyé : " . $e->getMessage());
    }

}

echo $session->metadata->order_id;
