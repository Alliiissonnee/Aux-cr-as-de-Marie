<?php
// Reçoit une demande de personnalisation envoyée depuis le site public

require __DIR__ . '/config.php';
require __DIR__ . '/mailer.php';

// Pour eviter le rejet du formulaire en cas de img trop lourde, message pour prevenir le client
if (empty($_POST) && empty($_FILES) && ($_SERVER['CONTENT_LENGTH'] ?? 0) > 0) {
    http_response_code(400);
    die("La photo est trop lourde (10 Mo maximum).");
}

// Récupère les cases du formulaire (trim enlève les espaces au début et à la fin)
$name = trim($_POST['name'] ?? '');
$email = trim($_POST['email'] ?? '');
$category = $_POST['category'] ?? '';
$desiredDate = $_POST['desired_date'] ?? '';
$budget = $_POST['budget'] ?? '';
$message = trim($_POST['message'] ?? '');

// Vérifie que les cases obligatoires sont remplies
if ($name === '' || $email === '' || $message === '') {
    http_response_code(400);
    die("Merci de remplir votre nom, votre email et votre message.");
}

// Vérifie que l'email ressemble à un vrai email
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    die("L'adresse email n'est pas valide.");
}

// Vérifie que le client a accepté l'utilisation de ses données
if (!isset($_POST['consent'])) {
    http_response_code(400);
    die("Merci d'accepter l'utilisation de vos données pour traiter votre demande.");
}

// Vérifie que la catégorie fait partie de la liste
$allowedCategories = ['bebe', 'doudou', 'tricot-couture', 'accessoires'];
if (!in_array($category, $allowedCategories)) {
    http_response_code(400);
    die("Merci de choisir un type de création.");
}

// Vérifie que le budget fait partie de la liste (vide = "Je ne sais pas encore")
$allowedBudgets = ['', 'under20', '20-50', '50-100', 'over100'];
if (!in_array($budget, $allowedBudgets)) {
    http_response_code(400);
    die("Le budget choisi n'est pas valide.");
}

// Vérifie la date, seulement si le client en a choisi une
if ($desiredDate !== '') {
    $date = DateTime::createFromFormat('Y-m-d', $desiredDate);
    if (!$date || $date->format('Y-m-d') !== $desiredDate) {
        http_response_code(400);
        die("La date n'est pas valide.");
    }
    if ($desiredDate < date('Y-m-d')) {
        http_response_code(400);
        die("La date souhaitée ne peut pas être dans le passé.");
    }
}

// Vérifie que les textes ne sont pas trop longs
if (mb_strlen($name) > 100 || mb_strlen($message) > 2000) {
    http_response_code(400);
    die("Votre nom ou votre message est trop long.");
}

// Photo d'inspiration (facultative)
$photoName = null;

if (isset($_FILES['photo']) && $_FILES['photo']['error'] !== UPLOAD_ERR_NO_FILE) {
    // Le client a choisi une photo : on vérifie qu'elle est bien arrivée
    if ($_FILES['photo']['error'] !== UPLOAD_ERR_OK) {
        http_response_code(400);
        die("La photo n'a pas pu être envoyée (10 Mo maximum).");
    }

    // Vérifie l'extension
    $extension = strtolower(pathinfo($_FILES['photo']['name'], PATHINFO_EXTENSION));
    $allowedExtensions = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
    if (!in_array($extension, $allowedExtensions)) {
        http_response_code(400);
        die("Seules les images sont acceptées (jpg, jpeg, png, webp, gif).");
    }

    // Vérifie que le contenu est vraiment une image
    if (getimagesize($_FILES['photo']['tmp_name']) === false) {
        http_response_code(400);
        die("Ce fichier n'est pas une vraie image.");
    }

    // Donne un nom impossible à deviner, puis enregistre la photo
    $photoName = 'request-' . bin2hex(random_bytes(16)) . '.' . $extension;
    move_uploaded_file($_FILES['photo']['tmp_name'], __DIR__ . '/../uploads/' . $photoName);
}

// Une date ou un budget vide devient "rien" (NULL) dans la base
if ($desiredDate === '') {
    $desiredDate = null;
}
if ($budget === '') {
    $budget = null;
}

// Range la demande dans la base (le statut "new" et la date sont ajoutés automatiquement)
$stmt = $pdo->prepare("INSERT INTO custom_requests (name, email, category, desired_date, budget, message, photo) VALUES (:name, :email, :category, :desired_date, :budget, :message, :photo)");
$stmt->execute([
    'name' => $name,
    'email' => $email,
    'category' => $category,
    'desired_date' => $desiredDate,
    'budget' => $budget,
    'message' => $message,
    'photo' => $photoName,
]);

try {
// Prévient Marie par email
    $mail = createMailer();
    $mail->addAddress(getenv('MAIL_TO'));
    $mail->addReplyTo($email, $name);
    $mail->Subject = 'Nouvelle demande personnalisée de ' .$name;
    $mail->Body = "Une nouvelle demande vient d'arriver sur le site.\n\n"
        . "Nom : $name\n"
        . "Email : $email\n"
        . "Type de création : $category\n"
        . "Date souhaitée : " . ($desiredDate ?? 'non précisée') . "\n"
        . "Budget : " . ($budget ?? 'non précisé') . "\n\n"
        . "Message :\n$message\n";
// Joint la photo d'inspiration, si le client en a envoyé une
    if ($photoName !== null) {
        $mail->addAttachment(__DIR__ . '/../uploads/' . $photoName);
    }
    $mail->send();
} catch (Exception $e) {
    // Email non parti, erreur non apparante coté front
    error_log("Email de demande non envoyé : " . $e->getMessage());
}


echo "Merci ! Votre demande a bien été envoyée. Marie vous répondra par email très vite.";
