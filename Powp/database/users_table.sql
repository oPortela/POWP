CREATE TABLE usuarios (
	codusur INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    data_cadastro DATETIME NOT NULL,
    usuario VARCHAR(30) NOT NULL,
    senha VARCHAR(255) NOT NULL,
    funcao ENUM('admin', 'usuario', 'gerente') NOT NULL DEFAULT 'usuario',
    ultimo_login DATETIME NOT NULL,
    data_alteracao DATETIME COMMENT 'Data alteração de senha',
    status char(1) NOT NULL DEFAULT 'L',
    permissoes LONGTEXT
);