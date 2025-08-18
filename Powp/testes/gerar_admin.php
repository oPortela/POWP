<?php 
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

try {
    require_once __DIR__ . '/../back/conexao/connection.php'; // caminho corrigido
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Erro de conexão com o banco de dados: ' . $e->getMessage()]);
    exit;
}

$nome = 'Administrador';
$nomeUsuario = 'admin';
$senhaAdmin = 'admin123';
$hashSenha = password_hash($senhaAdmin, PASSWORD_DEFAULT);
$data = date('Y-m-d H:i:s');
$funcao = 'Administrador';
$status = 'A';

// Usar a conexão já criada no connection.php
if ($conn->connect_error) {
    die("Erro de conexão com o banco de dados: " . $conn->connect_error);
}

// Verificar se o usuário admin já existe
$sql = 'SELECT codusur FROM usuarios WHERE usuario = ?';
$stmt = $conn->prepare($sql);
$stmt->bind_param('s', $nomeUsuario);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    // Usuário já existe, atualizar senha
    $sqlUpdate = 'UPDATE usuarios SET senha = ? WHERE nome = ?';
    $stmtUpdate = $conn->prepare($sqlUpdate);
    $stmtUpdate->bind_param('ss', $hashSenha, $nomeUsuario);
    
    if ($stmtUpdate->execute()) {
        echo "Usuário admin atualizado com sucesso!<br>";
    } else {
        echo "Erro ao atualizar usuário admin.<br>";
    }
} else {
    // Usuário não existe, criar novo
    $sqlInsert = 'INSERT INTO usuarios (nome, data_cadastro, usuario, senha, funcao, status) VALUES (?, ?, ?, ?, ?, ?)';
    $stmtInsert = $conn->prepare($sqlInsert);
    $stmtInsert->bind_param('ssssss', $nome, $data, $nomeUsuario, $hashSenha, $funcao, $status);
    
    if ($stmtInsert->execute()) {
        echo "Usuário admin criado com sucesso!<br>";
    } else {
        echo "Erro ao criar usuário admin.<br>";
    }
}

echo "Usuário: " . $nomeUsuario . "<br>";
echo "Senha: " . $senhaAdmin . "<br>";
echo "Hash da senha: " . $hashSenha;

$conn->close();
?>