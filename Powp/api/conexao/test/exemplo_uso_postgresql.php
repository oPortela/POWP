<?php
/**
 * Exemplo prático de uso da conexão PostgreSQL
 */

require_once 'PostgreSQLConnection.php';

// Carrega variáveis de ambiente
$envFile = __DIR__ . '/../../.env';
if (file_exists($envFile)) {
    $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos($line, '=') !== false && strpos($line, '#') !== 0) {
            list($key, $value) = explode('=', $line, 2);
            $_ENV[trim($key)] = trim($value);
        }
    }
}

try {
    // Configurações do banco
    $db = new PostgreSQLConnection(
        $_ENV['PG_HOST'] ?? 'localhost',
        $_ENV['PG_PORT'] ?? '5432',
        $_ENV['PG_NAME'] ?? 'meu_banco',
        $_ENV['PG_USER'] ?? 'postgres',
        $_ENV['PG_PASS'] ?? ''
    );
    
    echo "<h2>Testando Conexão PostgreSQL</h2>";
    
    // 1. Testa a conexão
    $test = $db->testConnection();
    if ($test['success']) {
        echo "✅ Conexão estabelecida com sucesso!<br>";
        echo "Versão do PostgreSQL: " . $test['version'] . "<br><br>";
    } else {
        throw new Exception($test['error']);
    }
    
    // 2. Exemplo de criação de tabela
    echo "<h3>Criando tabela de exemplo...</h3>";
    $createTable = "
        CREATE TABLE IF NOT EXISTS usuarios_teste (
            id SERIAL PRIMARY KEY,
            nome VARCHAR(100) NOT NULL,
            email VARCHAR(150) UNIQUE NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ";
    
    if ($db->execute($createTable)) {
        echo "✅ Tabela 'usuarios_teste' criada com sucesso!<br>";
    }
    
    // 3. Exemplo de inserção
    echo "<h3>Inserindo dados...</h3>";
    $insertUser = "INSERT INTO usuarios_teste (nome, email) VALUES (?, ?) ON CONFLICT (email) DO NOTHING";
    
    $usuarios = [
        ['João Silva', 'joao@email.com'],
        ['Maria Santos', 'maria@email.com'],
        ['Pedro Oliveira', 'pedro@email.com']
    ];
    
    foreach ($usuarios as $usuario) {
        if ($db->execute($insertUser, $usuario)) {
            echo "✅ Usuário '{$usuario[0]}' inserido!<br>";
        }
    }
    
    // 4. Exemplo de consulta
    echo "<h3>Consultando dados...</h3>";
    $users = $db->select("SELECT * FROM usuarios_teste ORDER BY id");
    
    if ($users) {
        echo "<table border='1' style='border-collapse: collapse; margin: 10px 0;'>";
        echo "<tr><th>ID</th><th>Nome</th><th>Email</th><th>Criado em</th></tr>";
        
        foreach ($users as $user) {
            echo "<tr>";
            echo "<td>{$user['id']}</td>";
            echo "<td>{$user['nome']}</td>";
            echo "<td>{$user['email']}</td>";
            echo "<td>{$user['created_at']}</td>";
            echo "</tr>";
        }
        echo "</table>";
    }
    
    // 5. Exemplo de transação
    echo "<h3>Exemplo de transação...</h3>";
    try {
        $db->beginTransaction();
        
        $db->execute("UPDATE usuarios_teste SET nome = ? WHERE email = ?", 
                    ['João Silva Santos', 'joao@email.com']);
        
        $db->execute("INSERT INTO usuarios_teste (nome, email) VALUES (?, ?)", 
                    ['Ana Costa', 'ana@email.com']);
        
        $db->commit();
        echo "✅ Transação executada com sucesso!<br>";
        
    } catch (Exception $e) {
        $db->rollback();
        echo "❌ Erro na transação: " . $e->getMessage() . "<br>";
    }
    
    // 6. Consulta final
    echo "<h3>Dados finais:</h3>";
    $finalUsers = $db->select("SELECT COUNT(*) as total FROM usuarios_teste");
    echo "Total de usuários: " . $finalUsers[0]['total'] . "<br>";
    
} catch (Exception $e) {
    echo "❌ Erro: " . $e->getMessage();
}
?>