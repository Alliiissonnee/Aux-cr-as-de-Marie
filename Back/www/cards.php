<?php

// Récupère la connexion $pdo.

require 'config.php';

// Prépare une requête SQL qui sélectionne toutes les colonnes de toutes les lignes de la table cards

$stmt = $pdo->prepare("SELECT * FROM cards");
$stmt->execute();
// Récupère toutes les lignes du résultat, sous forme de tableau PHP (un tableau de tableaux associatifs, un par card).
$resultats = $stmt->fetchAll(PDO::FETCH_ASSOC);

// Convertit ce tableau PHP en texte JSON, et l'affiche
echo json_encode($resultats);


// $stmt : statement = instruction/requête
