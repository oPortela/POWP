<?php
/**
 * Classe para gerenciar conexões PostgreSQL
 */
class PostgreSQLConnection {
    private $pdo;
    private $host;
    private $port;
    private $dbname;
    private $username;
    private $password;
    
    public function __construct($host = 'localhost', $port = '5432', $dbname = '', $username = 'postgres', $password = '') {
        $this->host = $host;
        $this->port = $port;
        $this->dbname = $dbname;
        $this->username = $username;
        $this->password = $password;
    }
    
    /**
     * Estabelece conexão com PostgreSQL
     */
    public function connect() {
        try {
            $dsn = "pgsql:host={$this->host};port={$this->port};dbname={$this->dbname}";
            
            $options = [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
                PDO::ATTR_PERSISTENT => true, // Conexão persistente
            ];
            
            $this->pdo = new PDO($dsn, $this->username, $this->password, $options);
            return $this->pdo;
            
        } catch (PDOException $e) {
            throw new Exception("Erro na conexão PostgreSQL: " . $e->getMessage());
        }
    }
    
    /**
     * Retorna a instância PDO
     */
    public function getPDO() {
        if (!$this->pdo) {
            $this->connect();
        }
        return $this->pdo;
    }
    
    /**
     * Executa uma query SELECT
     */
    public function select($sql, $params = []) {
        try {
            $stmt = $this->getPDO()->prepare($sql);
            $stmt->execute($params);
            return $stmt->fetchAll();
        } catch (PDOException $e) {
            throw new Exception("Erro na consulta: " . $e->getMessage());
        }
    }
    
    /**
     * Executa INSERT, UPDATE ou DELETE
     */
    public function execute($sql, $params = []) {
        try {
            $stmt = $this->getPDO()->prepare($sql);
            return $stmt->execute($params);
        } catch (PDOException $e) {
            throw new Exception("Erro na execução: " . $e->getMessage());
        }
    }
    
    /**
     * Inicia uma transação
     */
    public function beginTransaction() {
        return $this->getPDO()->beginTransaction();
    }
    
    /**
     * Confirma a transação
     */
    public function commit() {
        return $this->getPDO()->commit();
    }
    
    /**
     * Desfaz a transação
     */
    public function rollback() {
        return $this->getPDO()->rollback();
    }
    
    /**
     * Fecha a conexão
     */
    public function close() {
        $this->pdo = null;
    }
    
    /**
     * Testa a conexão
     */
    public function testConnection() {
        try {
            $result = $this->select("SELECT version() as version");
            return [
                'success' => true,
                'version' => $result[0]['version'] ?? 'Desconhecida'
            ];
        } catch (Exception $e) {
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }
}

// Exemplo de uso
if (basename(__FILE__) == basename($_SERVER['PHP_SELF'])) {
    // Carrega configurações do .env
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
    
    // Configurações
    $host = $_ENV['PG_HOST'] ?? 'localhost';
    $port = $_ENV['PG_PORT'] ?? '5432';
    $dbname = $_ENV['PG_NAME'] ?? 'teste';
    $username = $_ENV['PG_USER'] ?? 'postgres';
    $password = $_ENV['PG_PASS'] ?? '';
    
    // Testa a conexão
    try {
        $db = new PostgreSQLConnection($host, $port, $dbname, $username, $password);
        $test = $db->testConnection();
        
        if ($test['success']) {
            echo "✅ Conexão PostgreSQL bem-sucedida!<br>";
            echo "Versão: " . $test['version'];
        } else {
            echo "❌ Falha na conexão: " . $test['error'];
        }
        
    } catch (Exception $e) {
        echo "❌ Erro: " . $e->getMessage();
    }
}
?>