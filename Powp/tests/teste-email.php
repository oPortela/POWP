<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Conexão com o banco
$mysqli = new mysqli("localhost", "usuario", "senha", "meubanco");

if ($mysqli->connect_error) {
    die("Erro na conexão: " . $mysqli->connect_error);
}

// Pega 1 email de teste do banco
$sql = "SELECT email FROM usuarios LIMIT 1";
$result = $mysqli->query($sql);

if ($result && $row = $result->fetch_assoc()) {
    $emailDestino = $row['email'];

    // Cabeçalhos do e-mail
    $assunto = "Teste de Validação de E-mail";
    $mensagem = "Olá! Este é um e-mail de teste para validar o endereço.";
    $headers = "From: seuemail@dominio.com\r\n" .
               "Reply-To: seuemail@dominio.com\r\n" .
               "X-Mailer: PHP/" . phpversion();

    if (mail($emailDestino, $assunto, $mensagem, $headers)) {
        echo json_encode(["status" => "ok", "mensagem" => "E-mail enviado para $emailDestino"]);
    } else {
        echo json_encode(["status" => "erro", "mensagem" => "Falha ao enviar e-mail"]);
    }
} else {
    echo json_encode(["status" => "erro", "mensagem" => "Nenhum e-mail encontrado no banco"]);
}
?>

<button onclick="enviarEmail()">Enviar E-mail de Teste</button>

<script>
function enviarEmail() {
    fetch("enviar_email.php")
        .then(response => response.json())
        .then(data => {
            alert(data.mensagem);
        })
        .catch(err => console.error("Erro:", err));
}
</script>

