<?php
// Ajoute une nouvelle création avec son image (réservé à l'admin)
require __DIR__ . '/admin_check.php';
require __DIR__ . '/config.php';

// Pour éviter le rejet du formulaire en cas d'image trop lourde
if (empty($_POST) && empty($_FILES) && ($_SERVER['CONTENT_LENGTH'] ?? 0) > 0) {
    http_response_code(400);
    die("L'image est trop lourde (10 Mo maximum).");
}

// Récupère les cases du formulaire (trim enlève les espaces au début et à la fin)
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

// Une image est obligatoire
if (!isset($_FILES['image']) || $_FILES['image']['error'] !== UPLOAD_ERR_OK) {
    http_response_code(400);
    die("Merci d'ajouter une image.");
}


// Vérifie que le fichier a une extension d'image autorisée
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

// Donne un nom unique à l'image, pour que deux créations ne partagent jamais le même fichier
$imageName = uniqid() . '.' . $extension;


// Range l'image dans le dossier uploads (si ça échoue, on s'arrête)
if (!move_uploaded_file($_FILES['image']['tmp_name'], __DIR__ . '/../uploads/' . $imageName)) {
    http_response_code(500);
    die("L'image n'a pas pu être enregistrée.");
}



$stmt = $pdo->prepare("INSERT INTO cards (image, name, description, price, category) VALUES (:image, :name, :description, :price, :category)");
$stmt->execute(['image' => $imageName, 'name' => $name, 'description'=> $description, 'price' => $price, 'category' => $category]);

echo "Votre création a bien été ajoutée.";