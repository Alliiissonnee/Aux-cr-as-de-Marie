<?php
// Démarre (ou reprend) une session PHP. 
// Doit être la toute première chose exécutée, avant même le moindre echo ou espace, 
// sinon PHP renvoie une erreur ("headers already sent").
session_start();

// Récupère $pdo.
require __DIR__ . '/config.php';

// Récupération de l'email et du mot de passe
$email = trim($_POST['email'] ?? '');
$password = $_POST['password'] ?? '';

// Va chercher, dans admin_users, la ligne dont l'email correspond à celui tapé. 
// fetch() récupère juste cette une ligne, pas un tableau de plusieurs.
$stmt = $pdo->prepare("SELECT * FROM admin_users WHERE email = :email");
$stmt->execute(['email' => $email]);
$admin = $stmt->fetch();

// Compare le mot de passe tapé en clair avec le hash stocké en base, 
// sans jamais "décoder" ce hash,
// juste en le recalculant et en comparant.
if ($admin && password_verify($password, $admin['password_hash'])) {
    // Si ça correspond, on enregistre l'id de l'admin dans la session :
    // c'est cette ligne qui va permettre à toutes les futures pages de savoir que l'admin est connecté.
    // On change le numéro de session au moment de la connexion : si quelqu'un avait réussi à connaître
    // l'ancien numéro ("fixation de session"), il ne lui sert plus à rien.
    session_regenerate_id(true);
    $_SESSION['admin_id'] = $admin['id'];
    header('Location: ../admin.html');
    exit;
} else {
    header('Location: ../login.html?error=1');
    exit;
}


