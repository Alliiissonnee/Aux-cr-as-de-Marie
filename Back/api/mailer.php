<?php
// Prépare un "facteur" PHPMailer déjà réglé pour envoyer des emails.
// Les réglages (bureau de poste, mot de passe…) viennent des variables d'environnement
// définies dans docker-compose.yml et dans le fichier Back/.env (voir Back/.env.example).
// En développement, les emails partent vers Mailpit : http://localhost:8025

require '/var/www/vendor/autoload.php';

use PHPMailer\PHPMailer\PHPMailer;

function createMailer(): PHPMailer
{
    // "true" : PHPMailer signale les problèmes avec des exceptions (à attraper avec try / catch)
    $mail = new PHPMailer(true);

    $mail->isSMTP();
    $mail->Host = getenv('MAIL_HOST');
    $mail->Port = (int) getenv('MAIL_PORT');

    // Avec un vrai bureau de poste, il faut un identifiant et un mot de passe.
    // Mailpit, lui, n'en demande pas.
    $username = getenv('MAIL_USERNAME');
    if ($username) {
        $mail->SMTPAuth = true;
        $mail->Username = $username;
        $mail->Password = getenv('MAIL_PASSWORD');
    } else {
        $mail->SMTPAuth = false;
        $mail->SMTPAutoTLS = false;
    }

    // Chiffrement de la connexion ("tls" ou "ssl"), demandé par les vrais bureaux de poste
    $encryption = getenv('MAIL_ENCRYPTION');
    if ($encryption) {
        $mail->SMTPSecure = $encryption;
    }

    $mail->CharSet = 'UTF-8';
    $mail->setFrom(getenv('MAIL_FROM'), 'Site Aux créas de Marie');

    return $mail;
}
