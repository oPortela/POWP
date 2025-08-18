<?php
/**
 * Exemplo de conexão com PostgreSQL usando PDO
 * 
 * Para usar PostgreSQL, você precisa:
 * 1. Instalar PostgreSQL no servidor
 * 2. Habilitar a extensão pdo_pgsql no PHP
 * 3. Configurar as variáveis de ambiente
 */

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

// Configurações do PostgreSQL
$host = $_ENV['PG_HOST'] ?? 'localhost';
$port = $_ENV['PG_PORT'] ?? '5432';
$user = $_ENV['PG_USER'] ?? 'postgres';
$pass = $_ENV['PG_PASS'] ?? '';
$dbname = $_ENV['PG_NAME'] ?? 'meu_banco';

try {
    // String de conexão PostgreSQL
    $dsn = "pgsql:host={$host};port={$port};dbname={$dbname}";
    
    // Opções de conexão
    $options = [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ];
    
    // Cria a conexão
    $pdo = new PDO($dsn, $user, $pass, $options);
    
    echo "Conexão PostgreSQL estabelecida com sucesso!";
    
} catch (PDOException $e) {
    die("Erro na conexão PostgreSQL: " . $e->getMessage());
}

// Função para testar a conexão
function testarConexao($pdo) {
    try {
        $stmt = $pdo->query("SELECT version()");
        $version = $stmt->fetchColumn();
        echo "<br>Versão do PostgreSQL: " . $version;
        return true;
    } catch (PDOException $e) {
        echo "<br>Erro ao testar conexão: " . $e->getMessage();
        return false;
    }
}

// Testa a conexão se a variável $pdo existir
if (isset($pdo)) {
    testarConexao($pdo);
}
?>