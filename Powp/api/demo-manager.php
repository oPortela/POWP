<?php
/**
 * Gerenciador de contas demo
 * Funções para criar, validar e gerenciar usuários de teste
 */

require_once __DIR__ . '/conexao/connection.php';

class DemoManager {
    private $conn;
    
    public function __construct($connection) {
        $this->conn = $connection;
    }
    
    /**
     * Criar usuário demo
     */
    public function createDemoUser($data) {
        try {
            // Gerar credenciais
            $timestamp = substr(time(), -4);
            $empresa_clean = preg_replace('/[^a-zA-Z0-9]/', '', strtolower($data['nomeEmpresa']));
            $usuario_demo = 'demo_' . substr($empresa_clean, 0, 8) . '_' . $timestamp;
            $senha_demo = $this->generatePassword();
            $senha_hash = password_hash($senha_demo, PASSWORD_DEFAULT);
            
            // Data de expiração (30 dias)
            $data_expiracao = date('Y-m-d H:i:s', strtotime('+30 days'));
            
            // Inserir na tabela teste_gratis
            $stmt = $this->conn->prepare("
                INSERT INTO teste_gratis (
                    nome_empresa, nome_responsavel, email, telefone, 
                    segmento, funcionarios, usuario_demo, senha_demo, 
                    data_cadastro, data_expiracao, status, newsletter
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?, 'ativo', ?)
            ");
            
            $newsletter = isset($data['newsletter']) ? 1 : 0;
            
            $stmt->bind_param("sssssssssi", 
                $data['nomeEmpresa'],
                $data['nomeResponsavel'], 
                $data['email'],
                $data['telefone'],
                $data['segmento'] ?? '',
                $data['funcionarios'] ?? '',
                $usuario_demo,
                $senha_hash,
                $data_expiracao,
                $newsletter
            );
            
            if (!$stmt->execute()) {
                throw new Exception('Erro ao criar registro de teste');
            }
            
            // Inserir na tabela usuarios
            $stmt_user = $this->conn->prepare("
                INSERT INTO usuarios (
                    nome, usuario, senha, funcao, status, 
                    data_cadastro, tipo_conta, empresa_teste, data_expiracao
                ) VALUES (?, ?, ?, 'demo', 'A', NOW(), 'teste', ?, ?)
            ");
            
            $stmt_user->bind_param("sssss", 
                $data['nomeResponsavel'],
                $usuario_demo,
                $senha_hash,
                $data['nomeEmpresa'],
                $data_expiracao
            );
            
            if (!$stmt_user->execute()) {
                throw new Exception('Erro ao criar usuário demo');
            }
            
            // Criar dados de exemplo para o usuário
            $this->createSampleData($usuario_demo, $data['nomeEmpresa']);
            
            return [
                'success' => true,
                'credentials' => [
                    'usuario' => $usuario_demo,
                    'senha' => $senha_demo,
                    'email' => $data['email'],
                    'empresa' => $data['nomeEmpresa'],
                    'expira_em' => $data_expiracao
                ]
            ];
            
        } catch (Exception $e) {
            return [
                'success' => false,
                'message' => $e->getMessage()
            ];
        }
    }
    
    /**
     * Verificar se usuário demo ainda é válido
     */
    public function validateDemoUser($usuario) {
        $stmt = $this->conn->prepare("
            SELECT * FROM usuarios 
            WHERE usuario = ? AND tipo_conta = 'teste' AND status = 'A'
            AND (data_expiracao IS NULL OR data_expiracao > NOW())
        ");
        
        $stmt->bind_param("s", $usuario);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result->num_rows > 0) {
            // Atualizar último acesso
            $this->updateLastAccess($usuario);
            return true;
        }
        
        return false;
    }
    
    /**
     * Atualizar último acesso
     */
    private function updateLastAccess($usuario) {
        $stmt = $this->conn->prepare("
            UPDATE teste_gratis SET ultimo_acesso = NOW() 
            WHERE usuario_demo = ?
        ");
        $stmt->bind_param("s", $usuario);
        $stmt->execute();
    }
    
    /**
     * Criar dados de exemplo para demonstração
     */
    private function createSampleData($usuario_demo, $empresa) {
        // Aqui você pode inserir dados de exemplo nas tabelas
        // Por exemplo: clientes, fornecedores, produtos fictícios
        
        try {
            // Exemplo: Inserir clientes fictícios
            $clientes_exemplo = [
                ['Cliente Exemplo 1', 'F', '123.456.789-01'],
                ['Cliente Exemplo 2', 'F', '987.654.321-02'],
                ['Empresa Exemplo LTDA', 'J', '12.345.678/0001-90']
            ];
            
            foreach ($clientes_exemplo as $cliente) {
                // Inserir cliente (adapte conforme sua estrutura)
                $stmt = $this->conn->prepare("
                    INSERT INTO pwclientes (data_cadastro, tipo_pessoa, observacao) 
                    VALUES (NOW(), ?, 'Cliente de demonstração para usuário demo')
                ");
                $stmt->bind_param("s", $cliente[1]);
                $stmt->execute();
                
                $cliente_id = $this->conn->insert_id;
                
                // Inserir dados específicos do tipo de pessoa
                if ($cliente[1] == 'F') {
                    $stmt_pf = $this->conn->prepare("
                        INSERT INTO pwclientes_fisico (cliente_id, nome, cpf) 
                        VALUES (?, ?, ?)
                    ");
                    $stmt_pf->bind_param("iss", $cliente_id, $cliente[0], $cliente[2]);
                    $stmt_pf->execute();
                } else {
                    $stmt_pj = $this->conn->prepare("
                        INSERT INTO pwclientes_juridico (cliente_id, razao, fantasia, cnpj, inscricaoEst) 
                        VALUES (?, ?, ?, ?, '123456789')
                    ");
                    $stmt_pj->bind_param("isss", $cliente_id, $cliente[0], $cliente[0], $cliente[2]);
                    $stmt_pj->execute();
                }
            }
            
        } catch (Exception $e) {
            // Log do erro, mas não falha a criação do usuário
            error_log("Erro ao criar dados de exemplo: " . $e->getMessage());
        }
    }
    
    /**
     * Gerar senha aleatória
     */
    private function generatePassword($length = 8) {
        $chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
        $password = '';
        for ($i = 0; $i < $length; $i++) {
            $password .= $chars[rand(0, strlen($chars) - 1)];
        }
        return $password;
    }
    
    /**
     * Limpar contas demo expiradas
     */
    public function cleanExpiredDemos() {
        try {
            // Marcar como expiradas
            $stmt = $this->conn->prepare("
                UPDATE teste_gratis SET status = 'expirado' 
                WHERE data_expiracao < NOW() AND status = 'ativo'
            ");
            $stmt->execute();
            
            // Desativar usuários
            $stmt2 = $this->conn->prepare("
                UPDATE usuarios SET status = 'I' 
                WHERE tipo_conta = 'teste' AND data_expiracao < NOW()
            ");
            $stmt2->execute();
            
            return true;
        } catch (Exception $e) {
            return false;
        }
    }
    
    /**
     * Obter estatísticas de demos
     */
    public function getDemoStats() {
        $stats = [];
        
        // Total de demos criados
        $result = $this->conn->query("SELECT COUNT(*) as total FROM teste_gratis");
        $stats['total_demos'] = $result->fetch_assoc()['total'];
        
        // Demos ativos
        $result = $this->conn->query("SELECT COUNT(*) as ativos FROM teste_gratis WHERE status = 'ativo'");
        $stats['demos_ativos'] = $result->fetch_assoc()['ativos'];
        
        // Demos convertidos
        $result = $this->conn->query("SELECT COUNT(*) as convertidos FROM teste_gratis WHERE status = 'convertido'");
        $stats['demos_convertidos'] = $result->fetch_assoc()['convertidos'];
        
        // Taxa de conversão
        if ($stats['total_demos'] > 0) {
            $stats['taxa_conversao'] = round(($stats['demos_convertidos'] / $stats['total_demos']) * 100, 2);
        } else {
            $stats['taxa_conversao'] = 0;
        }
        
        return $stats;
    }
}

// Função para usar na API
function createDemoAccount($data) {
    global $conn;
    $demoManager = new DemoManager($conn);
    return $demoManager->createDemoUser($data);
}

function validateDemoAccount($usuario) {
    global $conn;
    $demoManager = new DemoManager($conn);
    return $demoManager->validateDemoUser($usuario);
}
?>