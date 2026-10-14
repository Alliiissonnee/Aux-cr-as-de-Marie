<?php
// Modifie une création, et son image si une nouvelle est envoyée (réservé à l'admin)
require __DIR__ . '/admin_check.php';
require __DIR__ . '/config.php';

// Pour éviter le rejet du formulaire en cas d'image trop lourde
if (empty($_POST) && empty($_FILES) && ($_SERVER['CONTENT_LENGTH'] ?? 0) > 0) {
    http_response_code(400);
    die("L'image est trop lourde (10 Mo maximum).");
}

// Récupère les cases du formulaire (trim enlève les espaces au début et à la fin)
$id = (int) ($_POST['id'] ?? 0);
$name = trim($_POST['name'] ?? '');
$description = trim($_POST['description'] ?? '');
$price = $_POST['price'] ?? '';
$category = $_POST['category'] ?? '';

// Le nom est obligatoire
if ($name === '') {
    http_response_code(400);
    die("Le nom de la création est obligatoire.");
}

// Le prix doit être un nombre, et pas négatif
if (!is_numeric($price) || $price < 0) {
    http_response_code(400);
    die("Le prix doit être un nombre positif.");
}

// La catégorie doit être l'une des 4 du menu déroulant
$allowedCategories = ['bebe', 'doudou', 'tricot-couture', 'accessoires'];
if (!in_array($category, $allowedCategories)) {
    http_response_code(400);
    die("Cette catégorie n'existe pas.");
}

// Récupère le nom de l'image actuelle en base
$stmt = $pdo->prepare("SELECT image FROM cards WHERE id = :id");
$stmt->execute(['id' => $id]);
$card = $stmt->fetch();

if (!$card) {
    http_response_code(404);
    die("Cette création n'existe pas.");
}

// Une nouvelle image a été envoyée : on la vérifie, puis elle remplace l'ancienne
if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
    $extension = strtolower(pathinfo($_FILES['image']['name'], PATHINFO_EXTENSION));
    $allowedExtensions = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
    if (!in_array($extension, $allowedExtensions)) {
        http_response_code(400);
        die("Seules les images sont acceptées (jpg, jpeg, png, webp, gif)");
    }

    // Vérifie que l'image est bien une image même si elle a une bonne extension
    if (getimagesize($_FILES['image']['tmp_name']) === false) {
        http_response_code(400);
        die("Ce fichier n'est pas une vraie image");
    }

    // On range d'abord la nouvelle image (si ça échoue, l'ancienne est gardée)
    $imageName = uniqid() . '.' . $extension;
    if (!move_uploaded_file($_FILES['image']['tmp_name'], __DIR__ . '/../uploads/' . $imageName)) {
        http_response_code(500);
        die("L'image n'a pas pu être enregistrée.");
    }

    // Puis on supprime l'ancienne
    if (file_exists(__DIR__ . '/../uploads/' . $card['image'])) {
        unlink(__DIR__ . '/../uploads/' . $card['image']);
    }
    $image = $imageName;
} else {
    // Pas de nouvelle image : on garde l'ancienne
    $image = $card['image'];
}

$stmt = $pdo->prepare("UPDATE cards SET image = :image, name = :name, description = :description, price = :price, category = :category WHERE id = :id");
$stmt->execute(['id' => $id, 'image' => $image, 'name' => $name, 'description'=> $description, 'price' => $price, 'category' => $category]);

echo "Votre création a bien été modifiée.";
