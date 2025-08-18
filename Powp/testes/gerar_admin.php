<?php 
$senhaAdmin = 'admin123';

$hashSenha = password_hash($senhaAdmin, PASSWORD_DEFAULT);

echo "Usuário: admin<br>"
echo "Senha Hash: " . $hashSenha;
?>