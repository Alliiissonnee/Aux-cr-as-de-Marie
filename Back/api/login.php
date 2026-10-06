<?php
// Démarre (ou reprend) une session PHP. 
// Doit être la toute première chose exécutée, avant même le moindre echo ou espace, 
// sinon PHP renvoie une erreur ("headers already sent").
session_start();

// Récupère $pdo.
require __DIR__ . '/config.php';

//Recupération email et MDP
$email = $_POST['email'];
$password = $_POST['password'];

// Va chercher, dans admin_users, la ligne dont l'email correspond à celui tapé. 
// fetch() (au singulier) récupère juste cette une ligne, pas un tableau de plusieurs.
$stmt = $pdo->prepare("SELECT * FROM admin_users WHERE email = :email");
$stmt->execute(['email' => $email]);
$ligne = $stmt->fetch();  

// Compare le mot de passe tapé en clair avec le hash stocké en base, sans jamais "décoder" ce hash,
//  juste en le recalculant et en comparant.
if ($ligne && password_verify($password, $ligne['password_hash'])) {
    // Si ça correspond : message de confirmation, et surtout on enregistre l'id de l'admin dans la session
    //  c'est cette ligne qui va permettre à toutes les futures pages de savoir que l'admin est connecté.
    // echo "Mot de passe correct !";
    $_SESSION['admin_id'] = $ligne['id'];
    header('Location: ../admin.html');
    exit;
} else {
    header('Location: ../login.html?erreur=1');
    exit;
};


