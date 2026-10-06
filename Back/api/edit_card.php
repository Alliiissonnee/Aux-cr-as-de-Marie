<?php

require __DIR__ . '/admin_check.php';
require __DIR__ . '/config.php';

$id = $_POST['id'];
$name = $_POST['name'];
$description = $_POST['description'];
$price = $_POST['price'];
$category = $_POST['category'];

// Verifie que le prix est un nombre
if (!is_numeric($price)){
    die("Le prix doit être un nombre");
}

// recupère le nom de l'img en base 
$stmt = $pdo->prepare("SELECT image FROM cards WHERE id = :id");
$stmt->execute(['id' => $id]);
$ligne = $stmt->fetch();

if ($_FILES['image']['tmp_name'] !== '') {
    $extension = strtolower(pathinfo($_FILES['image']['name'], PATHINFO_EXTENSION));
    $extensionsAutorisees = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
    if (!in_array($extension, $extensionsAutorisees)){
        die("Seules les images sont acceptées (jpg, jpeg, png, webp, gif)");
    }
    $nomImage = uniqid() . '.' . $extension;

    if (file_exists(__DIR__ . '/../uploads/' . $ligne['image'])) {
        unlink (__DIR__ . '/../uploads/' . $ligne['image']);
    }

    move_uploaded_file($_FILES['image']['tmp_name'], __DIR__ . '/../uploads/' . $_FILES['image']['name']);
    $image = $nomImage;
} else {
    $image = $ligne['image'];
}

$stmt = $pdo->prepare("UPDATE cards SET image = :image, name = :name, description = :description, price = :price, category = :category WHERE id = :id");
$stmt->execute(['id' => $id, 'image' => $image, 'name' => $name, 'description'=> $description, 'price' => $price, 'category' => $category]);

echo "Votre création a bien été modifiée.";