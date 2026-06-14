<?php
error_reporting(0);
ini_set('display_errors', 0);

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

// Elimină \r\n din valori folosite în headere SMTP (protecție header injection)
function sanitize_header(string $value): string {
    return preg_replace('/[\r\n\t]+/', ' ', strip_tags(trim($value)));
}

$name    = sanitize_header(isset($_POST['from_name'])  ? $_POST['from_name']  : '');
$email   = filter_var(trim(isset($_POST['from_email']) ? $_POST['from_email'] : ''), FILTER_VALIDATE_EMAIL);
$phone   = sanitize_header(isset($_POST['phone'])      ? $_POST['phone']      : '');
$message = strip_tags(trim(isset($_POST['message'])    ? $_POST['message']    : ''));

if (!$name || !$email || !$message) {
    echo json_encode(['error' => 'Campuri obligatorii lipsesc']);
    exit;
}

if (strlen($name) > 100 || strlen($message) > 5000) {
    echo json_encode(['error' => 'Date invalide']);
    exit;
}

function smtp_send($to, $from, $reply_to, $subject, $body) {
    $ports = [25, 587];
    $socket = false;
    foreach ($ports as $port) {
        $socket = @fsockopen('localhost', $port, $errno, $errstr, 10);
        if ($socket) break;
    }
    if (!$socket) return false;

    fgets($socket, 1024);

    fputs($socket, "EHLO localhost\r\n");
    do { $line = fgets($socket, 1024); } while ($line && substr($line, 3, 1) === '-');

    fputs($socket, "MAIL FROM:<$from>\r\n");
    fgets($socket, 1024);

    fputs($socket, "RCPT TO:<$to>\r\n");
    fgets($socket, 1024);

    fputs($socket, "DATA\r\n");
    fgets($socket, 1024);

    $msg  = "From: FightClub Galati <$from>\r\n";
    $msg .= "To: $to\r\n";
    $msg .= "Reply-To: $reply_to\r\n";
    $msg .= "Subject: $subject\r\n";
    $msg .= "MIME-Version: 1.0\r\n";
    $msg .= "Content-Type: text/plain; charset=UTF-8\r\n";
    $msg .= "\r\n";
    $msg .= $body . "\r\n";
    $msg .= ".\r\n";

    fputs($socket, $msg);
    $resp = fgets($socket, 1024);

    fputs($socket, "QUIT\r\n");
    fclose($socket);

    return substr(trim($resp), 0, 3) === '250';
}

$subject = "Mesaj de la $name - FightClub Galati";
$body    = "Nume: $name\nEmail: $email\nTelefon: $phone\n\nMesaj:\n$message";
$from    = 'contact@fightclubgalati.ro';

$sent1 = smtp_send('contact@fightclubgalati.ro', $from, $email, $subject, $body);
$sent2 = smtp_send('fightclub.narcisa@gmail.com', $from, $email, $subject, $body);

echo json_encode(($sent1 || $sent2) ? ['success' => true] : ['error' => 'Trimiterea a esuat']);
