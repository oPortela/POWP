CREATE TABLE pwclientes (
	codcli INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
	data_cadastro DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
    tipo_pessoa CHAR(1) NOT NULL,
    observacao VARCHAR(500),
    CHECK (tipo_pessoa IN ('F', 'J'))
);

CREATE TABLE pwclientes_fisico (
	cliente_id INT(11) PRIMARY KEY,
    nome VARCHAR(200) NOT NULL,
    cpf VARCHAR(14) NOT NULL UNIQUE,
    data_nascimento DATE,
    FOREIGN KEY (cliente_id) REFERENCES pwclientes(codcli) ON DELETE CASCADE
);

CREATE TABLE pwclientes_juridico (
	cliente_id INT(11) PRIMARY KEY,
    razao VARCHAR(200) NOT NULL,
    fantasia VARCHAR(200) NOT NULL,
    cnpj VARCHAR(20) NOT NULL UNIQUE,
    inscricaoEst VARCHAR(10) NOT NULL,
    FOREIGN KEY (cliente_id) REFERENCES pwclientes(codcli) ON DELETE CASCADE
);

COMMIT;