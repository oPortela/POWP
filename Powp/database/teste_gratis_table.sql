-- Tabela para gerenciar testes grátis
CREATE TABLE teste_gratis (
    id INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
    nome_empresa VARCHAR(200) NOT NULL,
    nome_responsavel VARCHAR(200) NOT NULL,
    email VARCHAR(200) NOT NULL UNIQUE,
    telefone VARCHAR(20) NOT NULL,
    segmento VARCHAR(50),
    funcionarios VARCHAR(20),
    usuario_demo VARCHAR(50) NOT NULL UNIQUE,
    senha_demo VARCHAR(255) NOT NULL,
    data_cadastro DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    data_expiracao DATETIME NOT NULL,
    status ENUM('ativo', 'expirado', 'convertido', 'cancelado') DEFAULT 'ativo',
    newsletter TINYINT(1) DEFAULT 0,
    ultimo_acesso DATETIME,
    ip_cadastro VARCHAR(45),
    observacoes TEXT,
    INDEX idx_email (email),
    INDEX idx_usuario_demo (usuario_demo),
    INDEX idx_status (status),
    INDEX idx_data_expiracao (data_expiracao)
);

-- Adicionar campo na tabela usuarios para identificar contas de teste
ALTER TABLE usuarios ADD COLUMN tipo_conta ENUM('normal', 'teste') DEFAULT 'normal';
ALTER TABLE usuarios ADD COLUMN empresa_teste VARCHAR(200);
ALTER TABLE usuarios ADD COLUMN data_expiracao DATETIME;

-- Inserir alguns dados de exemplo para demonstração
INSERT INTO teste_gratis (
    nome_empresa, nome_responsavel, email, telefone, 
    segmento, funcionarios, usuario_demo, senha_demo, 
    data_expiracao, status
) VALUES 
(
    'Loja Exemplo LTDA', 
    'João Silva', 
    'joao@lojaexemplo.com', 
    '(62) 99999-1234',
    'comercio', 
    '6-20', 
    'demo_lojaexemplo_1234', 
    '$2y$10$example_hash_here',
    DATE_ADD(NOW(), INTERVAL 30 DAY),
    'ativo'
),
(
    'Distribuidora ABC', 
    'Maria Santos', 
    'maria@distribuidoraabc.com', 
    '(62) 99999-5678',
    'distribuicao', 
    '21-50', 
    'demo_distribuidoraabc_5678', 
    '$2y$10$example_hash_here2',
    DATE_ADD(NOW(), INTERVAL 30 DAY),
    'ativo'
);

COMMIT;