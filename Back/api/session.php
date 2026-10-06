<?php
//  Verifie que c'est bien l'admin et qu'il est bien connecté
session_start();
echo json_encode(['connecte' => isset($_SESSION['admin_id'])]);