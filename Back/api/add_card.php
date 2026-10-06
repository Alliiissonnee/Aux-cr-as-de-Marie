<?php

require __DIR__ . '/admin_check.php';
require __DIR__ . '/config.php';

$name = $_POST['name'];
$description = $_POST['description'];
$price = $_POST['price'];
$category = $_POST['category'];

if (!is_numeric($price)){
    die("Le prix doit être un nombre");
}

// Verifie que le fichier a une extention d'image autorisée
$extension = strtolower(pathinfo($_FILES['image']['name'], PATHINFO_EXTENSION));
$extensionsAutorisees = ['jpg', 'jpeg', 'png', 'webp', 'gif'];

if (!in_array($extension, $extensionsAutorisees)) {
    die("Seules les images sont acceptées (jpg, jpeg, png, webp, gif)");
}

// Donne un nom unique à l'image, pour que deux créations ne partagent jamais le même fichier
$nomImage = uniqid() . '.' . $extension;


if (move_uploaded_file($_FILES['image']['tmp_name'], __DIR__ . '/../uploads/' . $nomImage)) {
    echo "L'image a bien été envoyée";
} else {
    die ("L'image n'est pas passée");
}


$stmt = $pdo->prepare("INSERT INTO cards (image, name, description, price, category) VALUES (:image, :name, :description, :price, :category)");
$stmt->execute(['image' => $nomImage, 'name' => $name, 'description'=> $description, 'price' => $price, 'category' => $category]);

echo "Votre création a bien été ajoutée.";