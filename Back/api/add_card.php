<?php

require __DIR__ . '/admin_check.php';
require __DIR__ . '/config.php';

$name = $_POST['name'];
$description = $_POST['description'];
$price = $_POST['price'];
$category = $_POST['category'];

if (move_uploaded_file($_FILES['image']['tmp_name'], __DIR__ . '/../uploads/' . $_FILES['image']['name'])) {
    echo "L'image a bien été envoyé";
} else {
    die ("L'image n'est pas passée");
}


$stmt = $pdo->prepare("INSERT INTO cards (image, name, description, price, category) VALUES (:image, :name, :description, :price, :category)");
$stmt->execute(['image' => $_FILES['image']['name'], 'name' => $name, 'description'=> $description, 'price' => $price, 'category' => $category]);

echo "Votre création a bien été ajouté.";