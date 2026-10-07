<?php

require __DIR__ . '/admin_check.php';
require __DIR__ . '/config.php';

$name = $_POST['name'];
$description = $_POST['description'];
$price = $_POST['price'];
$category = $_POST['category'];

if (!is_numeric($price)){
    http_response_code(400);
    die("Le prix doit être un nombre");
}

// Verifie que le fichier a une extention d'image autorisée
$extension = strtolower(pathinfo($_FILES['image']['name'], PATHINFO_EXTENSION));
$allowedExtensions = ['jpg', 'jpeg', 'png', 'webp', 'gif'];

if (!in_array($extension, $allowedExtensions)) {
    http_response_code(400);
    die("Seules les images sont acceptées (jpg, jpeg, png, webp, gif)");
}

// Verifie que l'img est bien une img même si elle a une bonne extension
if (getimagesize($_FILES['image']['tmp_name']) === false) {
    http_response_code(400);
    die("Ce fichier n'est pas une vraie image");
}

// Donne un nom unique à l'image, pour que deux créations ne partagent jamais le même fichier
$imageName = uniqid() . '.' . $extension;


if (move_uploaded_file($_FILES['image']['tmp_name'], __DIR__ . '/../uploads/' . $imageName)) {
    echo "L'image a bien été envoyée";
} else {
    http_response_code(400);
    die ("L'image n'est pas passée");
}


$stmt = $pdo->prepare("INSERT INTO cards (image, name, description, price, category) VALUES (:image, :name, :description, :price, :category)");
$stmt->execute(['image' => $imageName, 'name' => $name, 'description'=> $description, 'price' => $price, 'category' => $category]);

echo "Votre création a bien été ajoutée.";