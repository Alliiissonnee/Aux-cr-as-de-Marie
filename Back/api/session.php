<?php
//  Verifie que c'est bien l'admin et qu'il est bien connecté
require __DIR__ . '/start_session.php';

echo json_encode(['loggedIn' => isset($_SESSION['admin_id'])]);