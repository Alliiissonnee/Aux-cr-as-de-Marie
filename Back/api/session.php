<?php
//  Verifie que c'est bien l'admin et qu'il est bien connecté
require __DIR__ . '/demarrer_session.php';

echo json_encode(['connecte' => isset($_SESSION['admin_id'])]);