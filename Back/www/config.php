<?php

// Les 4 informations nécessaires pour se connecter à MySQL : 
// le nom du service, le nom de la base, et les identifiants.

$host = 'mysql';
$dbname = 'auxcreasdemarie';
$user = 'root';
$pass = 'root';

// Construction du DSN (Data Source Name), l'adresse complète pour PDO — quel type de base (mysql), où la trouver, 
// quelle base, quel encodage de caractères (important pour les accents).

$dsn = "mysql:host=$host;dbname=$dbname;charset=utf8mb4";

// On tente de créer une connexion PDO. setAttribute(..., ERRMODE_EXCEPTION) dit à PDO de lever 
// une vraie erreur PHP si une requête échoue (plutôt que d'échouer silencieusement). 
// Si la connexion elle-même échoue, le catch intercepte l'erreur et affiche un message clair au lieu de laisser planter le site brutalement.

try {
    $pdo = new PDO($dsn, $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    die("Erreur de connexion : " . $e->getMessage());
}